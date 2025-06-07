import {
  GoogleGenerativeAI,
  type GenerativeModel,
} from "@google/generative-ai";
import type { Stock } from "@/types/supabase";

/**
 * Google Gemini APIクライアント
 */
export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  /**
   * 在庫管理に関する質問に回答
   */
  async generateStockResponse(
    userMessage: string,
    stocks: Stock[],
    context?: string
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(stocks, context);
      const fullPrompt = `${systemPrompt}\n\nユーザーの質問: ${userMessage}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error("AI応答の生成に失敗しました");
    }
  }

  /**
   * 在庫データの分析とアドバイス生成
   */
  async generateStockAnalysis(stocks: Stock[]): Promise<string> {
    try {
      const analysisPrompt = this.buildAnalysisPrompt(stocks);

      const result = await this.model.generateContent(analysisPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error("在庫分析の生成に失敗しました");
    }
  }

  /**
   * 買い物リスト生成
   */
  async generateShoppingList(stocks: Stock[]): Promise<string> {
    try {
      const shoppingPrompt = this.buildShoppingPrompt(stocks);

      const result = await this.model.generateContent(shoppingPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error("買い物リストの生成に失敗しました");
    }
  }

  /**
   * システムプロンプト構築
   */
  private buildSystemPrompt(stocks: Stock[], context?: string): string {
    const stockSummary = this.formatStockSummary(stocks);

    return `あなたは冷凍野菜ストック管理アプリ「vegstock」のAIアシスタントです。
ユーザーの冷凍野菜在庫管理をサポートします。

【現在の在庫状況】
${stockSummary}

【あなたの役割】
- 在庫に関する質問に正確に回答する
- 在庫管理のアドバイスを提供する
- 買い物の提案をする
- 料理のアイデアを提案する
- 食材の保存方法をアドバイスする

【回答の方針】
- 簡潔で分かりやすい日本語で回答する
- 具体的な数値や期間を含める
- 実用的なアドバイスを心がける
- 親しみやすい口調で話す

${context ? `【追加コンテキスト】\n${context}` : ""}`;
  }

  /**
   * 分析プロンプト構築
   */
  private buildAnalysisPrompt(stocks: Stock[]): string {
    const stockSummary = this.formatStockSummary(stocks);
    const lowStockItems = this.getLowStockItems(stocks);
    const outOfStockItems = this.getOutOfStockItems(stocks);

    return `冷凍野菜在庫の分析をお願いします。

【現在の在庫状況】
${stockSummary}

【在庫切れ】
${outOfStockItems.length > 0 ? outOfStockItems.join(", ") : "なし"}

【在庫少（閾値以下）】
${lowStockItems.length > 0 ? lowStockItems.join(", ") : "なし"}

以下の観点で分析してください：
1. 在庫状況の総合評価
2. 注意が必要な野菜
3. 在庫管理の改善提案
4. 今後の購入計画のアドバイス

200文字程度で簡潔にまとめてください。`;
  }

  /**
   * 買い物リストプロンプト構築
   */
  private buildShoppingPrompt(stocks: Stock[]): string {
    const lowStockItems = this.getLowStockItems(stocks);
    const outOfStockItems = this.getOutOfStockItems(stocks);

    return `現在の在庫状況から買い物リストを作成してください。

【在庫切れ】
${outOfStockItems.length > 0 ? outOfStockItems.join(", ") : "なし"}

【在庫少（閾値以下）】
${lowStockItems.length > 0 ? lowStockItems.join(", ") : "なし"}

【全在庫状況】
${this.formatStockSummary(stocks)}

以下の形式で買い物リストを作成してください：
- 優先度の高い順に並べる
- 推奨購入数量を含める
- 理由も簡潔に記載する

例：
🔴 ブロッコリー（2袋）- 在庫切れ
🟡 にんじん（1袋）- 残り2日分`;
  }

  /**
   * 在庫サマリーをフォーマット
   */
  private formatStockSummary(stocks: Stock[]): string {
    if (stocks.length === 0) {
      return "在庫データがありません";
    }

    return stocks
      .map((stock) => {
        const remainingDays = this.calculateRemainingDays(stock);
        const status = this.getStockStatus(stock);

        return `- ${stock.name}: ${stock.stock_count_bag}袋 (${remainingDays}日分) ${status}`;
      })
      .join("\n");
  }

  /**
   * 残日数計算
   */
  private calculateRemainingDays(stock: Stock): number {
    if (stock.daily_usage_g <= 0 || stock.stock_count_bag <= 0) {
      return 0;
    }
    return Math.floor(
      (stock.total_weight_g * stock.stock_count_bag) / stock.daily_usage_g
    );
  }

  /**
   * 在庫ステータス取得
   */
  private getStockStatus(stock: Stock): string {
    if (stock.stock_count_bag === 0) {
      return "🔴";
    }

    const remainingDays = this.calculateRemainingDays(stock);
    if (stock.threshold_days && remainingDays <= stock.threshold_days) {
      return "🟡";
    }

    return "🟢";
  }

  /**
   * 在庫少アイテム取得
   */
  private getLowStockItems(stocks: Stock[]): string[] {
    return stocks
      .filter((stock) => {
        if (stock.stock_count_bag === 0) return false;
        const remainingDays = this.calculateRemainingDays(stock);
        return stock.threshold_days && remainingDays <= stock.threshold_days;
      })
      .map((stock) => stock.name);
  }

  /**
   * 在庫切れアイテム取得
   */
  private getOutOfStockItems(stocks: Stock[]): string[] {
    return stocks
      .filter((stock) => stock.stock_count_bag === 0)
      .map((stock) => stock.name);
  }
}

/**
 * Geminiクライアントのシングルトンインスタンス
 */
let geminiClient: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!geminiClient) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "NEXT_PUBLIC_GEMINI_API_KEY environment variable is required"
      );
    }
    geminiClient = new GeminiClient(apiKey);
  }
  return geminiClient;
}
