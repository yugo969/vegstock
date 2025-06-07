import { useState, useCallback } from "react";
import { useStocks } from "./useStocks";
import { getGeminiClient } from "@/lib/ai/gemini-client";
import {
  parseIntent,
  fuzzyMatchStockName,
  validateAmount,
  generateResponseMessage,
  type StockIntent,
} from "@/lib/ai/intent-parser";

export interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  intent?: StockIntent;
  success?: boolean;
}

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const {
    stocks,
    updateStockCount,
    createStock,
    loading: stocksLoading,
  } = useStocks();

  /**
   * メッセージ送信
   */
  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      const userMessageObj: ChatMessage = {
        id: `user-${Date.now()}`,
        type: "user",
        content: userMessage.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessageObj]);
      setIsLoading(true);

      try {
        // インテント解析
        const intent = parseIntent(userMessage);

        let response: string;
        let success = false;

        switch (intent.type) {
          case "stock_operation":
            const operationResult = await handleStockOperation(intent);
            response = operationResult.message;
            success = operationResult.success;
            break;

          case "stock_query":
            const queryResult = await handleStockQuery(intent);
            response = queryResult.message;
            success = queryResult.success;
            break;

          case "general_chat":
          default:
            response = await handleGeneralChat(userMessage);
            success = true;
            break;
        }

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: response,
          timestamp: new Date(),
          intent,
          success,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Chat error:", error);

        const errorMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content:
            "申し訳ありません。エラーが発生しました。もう一度お試しください。",
          timestamp: new Date(),
          success: false,
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, stocks, updateStockCount, createStock]
  );

  /**
   * 在庫操作処理
   */
  const handleStockOperation = async (
    intent: StockIntent
  ): Promise<{ message: string; success: boolean }> => {
    if (!intent.stockName) {
      return {
        message: "野菜名が指定されていません。",
        success: false,
      };
    }

    // 野菜名の曖昧マッチング
    const stockNames = stocks.map((s) => s.name);
    const matchedName = fuzzyMatchStockName(intent.stockName, stockNames);
    const targetStock = matchedName
      ? stocks.find((s) => s.name === matchedName)
      : null;

    // 新規作成の場合
    if (intent.operation === "create") {
      if (targetStock) {
        return {
          message: `${matchedName}は既に登録されています。`,
          success: false,
        };
      }

      // 基本的な在庫データで新規作成
      const success = await createStock({
        name: intent.stockName,
        total_weight_g: 300, // デフォルト値
        daily_usage_g: 30, // デフォルト値
        stock_count_bag: 0, // 初期値
        threshold_days: 7, // デフォルト値
      });

      return {
        message: success
          ? `${intent.stockName}を新規登録しました。詳細設定は在庫一覧から編集してください。`
          : `${intent.stockName}の登録に失敗しました。`,
        success,
      };
    }

    // 既存在庫の操作
    if (!targetStock) {
      return {
        message: `${intent.stockName}が見つかりません。「${intent.stockName}を新規追加」で登録できます。`,
        success: false,
      };
    }

    if (!intent.amount) {
      return {
        message: "数量が指定されていません。",
        success: false,
      };
    }

    // 数値バリデーション
    const validation = validateAmount(intent.amount, intent.operation || "add");
    if (!validation.isValid) {
      return {
        message: validation.error || "数値が正しくありません。",
        success: false,
      };
    }

    // 在庫数計算
    let newCount: number;
    switch (intent.operation) {
      case "add":
        newCount = targetStock.stock_count_bag + intent.amount;
        break;
      case "subtract":
        newCount = Math.max(0, targetStock.stock_count_bag - intent.amount);
        break;
      case "set":
        newCount = intent.amount;
        break;
      default:
        return {
          message: "不明な操作です。",
          success: false,
        };
    }

    // 在庫更新
    const success = await updateStockCount(targetStock.id, newCount);
    const message = generateResponseMessage(
      intent,
      success,
      matchedName || undefined,
      newCount
    );

    return { message, success };
  };

  /**
   * 在庫照会処理
   */
  const handleStockQuery = async (
    intent: StockIntent
  ): Promise<{ message: string; success: boolean }> => {
    if (!intent.stockName) {
      // 全体の在庫状況
      if (stocks.length === 0) {
        return {
          message: "在庫データがありません。",
          success: true,
        };
      }

      const summary = stocks
        .map((stock) => {
          const remainingDays =
            stock.daily_usage_g > 0
              ? Math.floor(
                  (stock.total_weight_g * stock.stock_count_bag) /
                    stock.daily_usage_g
                )
              : 0;
          const status =
            stock.stock_count_bag === 0
              ? "🔴"
              : stock.threshold_days && remainingDays <= stock.threshold_days
              ? "🟡"
              : "🟢";

          return `${status} ${stock.name}: ${stock.stock_count_bag}袋 (${remainingDays}日分)`;
        })
        .join("\n");

      return {
        message: `現在の在庫状況:\n${summary}`,
        success: true,
      };
    }

    // 特定の野菜の照会
    const stockNames = stocks.map((s) => s.name);
    const matchedName = fuzzyMatchStockName(intent.stockName, stockNames);
    const targetStock = matchedName
      ? stocks.find((s) => s.name === matchedName)
      : null;

    if (!targetStock) {
      return {
        message: `${intent.stockName}が見つかりません。`,
        success: false,
      };
    }

    const remainingDays =
      targetStock.daily_usage_g > 0
        ? Math.floor(
            (targetStock.total_weight_g * targetStock.stock_count_bag) /
              targetStock.daily_usage_g
          )
        : 0;

    const message = generateResponseMessage(
      intent,
      true,
      matchedName || undefined,
      targetStock.stock_count_bag
    );
    const detailMessage =
      remainingDays > 0 ? `${message}（約${remainingDays}日分）` : message;

    return {
      message: detailMessage,
      success: true,
    };
  };

  /**
   * 一般的な会話処理
   */
  const handleGeneralChat = async (userMessage: string): Promise<string> => {
    try {
      const geminiClient = getGeminiClient();

      // 特定のキーワードに基づく処理
      if (userMessage.includes("分析") || userMessage.includes("アドバイス")) {
        return await geminiClient.generateStockAnalysis(stocks);
      }

      if (userMessage.includes("買い物") || userMessage.includes("購入")) {
        return await geminiClient.generateShoppingList(stocks);
      }

      // 一般的な質問への回答
      return await geminiClient.generateStockResponse(userMessage, stocks);
    } catch (error) {
      console.error("Gemini API error:", error);

      // フォールバック応答
      if (
        userMessage.includes("こんにちは") ||
        userMessage.includes("はじめまして")
      ) {
        return "こんにちは！冷凍野菜の在庫管理をお手伝いします。「ブロッコリー 2袋追加」のように話しかけてください。";
      }

      if (userMessage.includes("ありがとう")) {
        return "どういたしまして！他にも在庫管理でお困りのことがあれば、お気軽にお声かけください。";
      }

      return "ご質問ありがとうございます。在庫に関することでしたら、「ブロッコリー 2袋追加」や「在庫確認」のように話しかけてください。";
    }
  };

  /**
   * チャット履歴クリア
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  /**
   * 在庫分析取得
   */
  const getStockAnalysis = useCallback(async () => {
    if (stocks.length === 0) return null;

    try {
      const geminiClient = getGeminiClient();
      return await geminiClient.generateStockAnalysis(stocks);
    } catch (error) {
      console.error("Analysis error:", error);
      return null;
    }
  }, [stocks]);

  /**
   * 買い物リスト取得
   */
  const getShoppingList = useCallback(async () => {
    if (stocks.length === 0) return null;

    try {
      const geminiClient = getGeminiClient();
      return await geminiClient.generateShoppingList(stocks);
    } catch (error) {
      console.error("Shopping list error:", error);
      return null;
    }
  }, [stocks]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    getStockAnalysis,
    getShoppingList,
    stocksLoading,
  };
}
