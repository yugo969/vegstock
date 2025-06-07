/**
 * AIチャットのインテント解析ユーティリティ
 */

export interface StockIntent {
  type: "stock_operation" | "stock_query" | "general_chat";
  operation?: "add" | "subtract" | "set" | "create" | "delete" | "update";
  stockName?: string;
  amount?: number;
  confidence: number;
  originalText: string;
}

export interface ParsedStockData {
  name: string;
  totalWeightG?: number;
  dailyUsageG?: number;
  stockCountBag?: number;
  thresholdDays?: number;
}

/**
 * ユーザー入力からインテントを解析
 */
export function parseIntent(input: string): StockIntent {
  const normalizedInput = input.toLowerCase().trim();

  // 在庫操作パターン
  const operationPatterns = [
    // 追加パターン
    { pattern: /(.+?)を(\d+(?:\.\d+)?)袋?追加/, operation: "add" as const },
    { pattern: /(.+?)(\d+(?:\.\d+)?)袋追加/, operation: "add" as const },
    { pattern: /(.+?)を(\d+(?:\.\d+)?)個?足す/, operation: "add" as const },
    { pattern: /(.+?)(\d+(?:\.\d+)?)袋?足す/, operation: "add" as const },
    { pattern: /(.+?)を(\d+(?:\.\d+)?)袋?プラス/, operation: "add" as const },

    // 減算パターン
    {
      pattern: /(.+?)を?(\d+(?:\.\d+)?)袋?減らす/,
      operation: "subtract" as const,
    },
    {
      pattern: /(.+?)(\d+(?:\.\d+)?)袋?減らす/,
      operation: "subtract" as const,
    },
    {
      pattern: /(.+?)を?(\d+(?:\.\d+)?)袋?使った/,
      operation: "subtract" as const,
    },
    {
      pattern: /(.+?)(\d+(?:\.\d+)?)袋?使った/,
      operation: "subtract" as const,
    },
    {
      pattern: /(.+?)を?(\d+(?:\.\d+)?)袋?マイナス/,
      operation: "subtract" as const,
    },

    // 設定パターン
    { pattern: /(.+?)を?(\d+(?:\.\d+)?)袋?に設定/, operation: "set" as const },
    { pattern: /(.+?)(\d+(?:\.\d+)?)袋?に設定/, operation: "set" as const },
    {
      pattern: /(.+?)の在庫を?(\d+(?:\.\d+)?)袋?にする/,
      operation: "set" as const,
    },

    // 新規作成パターン
    { pattern: /(.+?)を?新規追加/, operation: "create" as const },
    { pattern: /(.+?)を?登録/, operation: "create" as const },
    { pattern: /新しく(.+?)を?追加/, operation: "create" as const },
  ];

  // 在庫照会パターン
  const queryPatterns = [
    /(.+?)の在庫は?/,
    /(.+?)は?何袋/,
    /(.+?)の残り/,
    /(.+?)の状況/,
    /在庫確認/,
    /在庫状況/,
  ];

  // 操作パターンをチェック
  for (const { pattern, operation } of operationPatterns) {
    const match = normalizedInput.match(pattern);
    if (match) {
      const stockName = match[1]?.trim();
      const amount =
        operation === "create" ? undefined : parseFloat(match[2] || "0");

      if (stockName && (operation === "create" || (amount && amount > 0))) {
        return {
          type: "stock_operation",
          operation,
          stockName,
          amount,
          confidence: 0.9,
          originalText: input,
        };
      }
    }
  }

  // 照会パターンをチェック
  for (const pattern of queryPatterns) {
    const match = normalizedInput.match(pattern);
    if (match) {
      const stockName = match[1]?.trim();

      return {
        type: "stock_query",
        stockName: stockName || undefined,
        confidence: 0.8,
        originalText: input,
      };
    }
  }

  // 一般的な会話
  return {
    type: "general_chat",
    confidence: 0.5,
    originalText: input,
  };
}

/**
 * 新規在庫作成用のデータを入力から抽出
 */
export function parseStockCreationData(input: string): ParsedStockData | null {
  const normalizedInput = input.toLowerCase().trim();

  // 野菜名抽出
  const nameMatch = normalizedInput.match(/(.+?)を?(?:新規追加|登録|追加)/);
  if (!nameMatch) return null;

  const name = nameMatch[1].trim();
  if (!name) return null;

  // 重量抽出 (g)
  const weightMatch = input.match(/(\d+)g|(\d+)グラム/);
  const totalWeightG = weightMatch
    ? parseInt(weightMatch[1] || weightMatch[2])
    : undefined;

  // 使用量抽出
  const usageMatch = input.match(/(?:1日|毎日)(\d+)g|使用量(\d+)g/);
  const dailyUsageG = usageMatch
    ? parseInt(usageMatch[1] || usageMatch[2])
    : undefined;

  // 袋数抽出
  const countMatch = input.match(/(\d+(?:\.\d+)?)袋/);
  const stockCountBag = countMatch ? parseFloat(countMatch[1]) : undefined;

  // 閾値抽出
  const thresholdMatch = input.match(/(\d+)日で?アラート|アラート(\d+)日/);
  const thresholdDays = thresholdMatch
    ? parseInt(thresholdMatch[1] || thresholdMatch[2])
    : undefined;

  return {
    name,
    totalWeightG,
    dailyUsageG,
    stockCountBag,
    thresholdDays,
  };
}

/**
 * 野菜名の曖昧マッチング
 */
export function fuzzyMatchStockName(
  input: string,
  stockNames: string[]
): string | null {
  const normalizedInput = input.toLowerCase().trim();

  // 空文字列の場合はnullを返す
  if (!normalizedInput) {
    return null;
  }

  // 完全一致
  for (const name of stockNames) {
    if (name.toLowerCase() === normalizedInput) {
      return name;
    }
  }

  // 部分一致
  for (const name of stockNames) {
    if (
      name.toLowerCase().includes(normalizedInput) ||
      normalizedInput.includes(name.toLowerCase())
    ) {
      return name;
    }
  }

  // ひらがな・カタカナ変換を考慮した一致
  const hiraganaInput = convertToHiragana(normalizedInput);
  const katakanaInput = convertToKatakana(normalizedInput);

  for (const name of stockNames) {
    const hiraganaName = convertToHiragana(name.toLowerCase());
    const katakanaName = convertToKatakana(name.toLowerCase());

    if (
      hiraganaName === hiraganaInput ||
      katakanaName === katakanaInput ||
      hiraganaName.includes(hiraganaInput) ||
      katakanaName.includes(katakanaInput)
    ) {
      return name;
    }
  }

  return null;
}

/**
 * ひらがなに変換（簡易版）
 */
function convertToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
}

/**
 * カタカナに変換（簡易版）
 */
function convertToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
}

/**
 * 数値の妥当性チェック
 */
export function validateAmount(
  amount: number,
  operation: string
): { isValid: boolean; error?: string } {
  if (isNaN(amount) || !isFinite(amount)) {
    return { isValid: false, error: "数値が正しくありません" };
  }

  if (amount < 0) {
    return { isValid: false, error: "負の値は指定できません" };
  }

  if (operation === "set" && amount > 100) {
    return {
      isValid: false,
      error: "在庫数が大きすぎます（100袋以下にしてください）",
    };
  }

  if ((operation === "add" || operation === "subtract") && amount > 50) {
    return {
      isValid: false,
      error: "一度に変更できる数量が大きすぎます（50袋以下にしてください）",
    };
  }

  return { isValid: true };
}

/**
 * 応答メッセージ生成
 */
export function generateResponseMessage(
  intent: StockIntent,
  success: boolean,
  stockName?: string,
  currentAmount?: number
): string {
  if (!success) {
    switch (intent.type) {
      case "stock_operation":
        return `申し訳ありません。${intent.stockName}の${
          intent.operation === "add"
            ? "追加"
            : intent.operation === "subtract"
            ? "減算"
            : "設定"
        }に失敗しました。`;
      case "stock_query":
        return `申し訳ありません。${intent.stockName}の情報を取得できませんでした。`;
      default:
        return "申し訳ありません。処理に失敗しました。";
    }
  }

  switch (intent.type) {
    case "stock_operation":
      const operationText =
        intent.operation === "add"
          ? "追加しました"
          : intent.operation === "subtract"
          ? "減らしました"
          : intent.operation === "set"
          ? "設定しました"
          : "更新しました";
      const currentText =
        currentAmount !== undefined ? `（現在: ${currentAmount}袋）` : "";
      return `${stockName || intent.stockName}を${
        intent.amount
      }袋${operationText}${currentText}`;

    case "stock_query":
      return currentAmount !== undefined
        ? `${stockName || intent.stockName}の在庫は${currentAmount}袋です`
        : `${stockName || intent.stockName}の在庫情報が見つかりませんでした`;

    default:
      return "ご質問ありがとうございます。在庫に関することでしたら、「ブロッコリー 2袋追加」のように話しかけてください。";
  }
}
