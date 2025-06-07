import { describe, it, expect } from "vitest";
import {
  parseIntent,
  parseStockCreationData,
  fuzzyMatchStockName,
  validateAmount,
  generateResponseMessage,
  type StockIntent,
} from "../ai/intent-parser";

describe("parseIntent", () => {
  it("在庫追加パターンを正しく解析する", () => {
    const testCases = [
      {
        input: "ブロッコリーを2袋追加",
        expected: {
          type: "stock_operation",
          operation: "add",
          stockName: "ブロッコリー",
          amount: 2,
        },
      },
      {
        input: "にんじん3袋追加",
        expected: {
          type: "stock_operation",
          operation: "add",
          stockName: "にんじん",
          amount: 3,
        },
      },
      {
        input: "トマト1.5袋足す",
        expected: {
          type: "stock_operation",
          operation: "add",
          stockName: "トマト",
          amount: 1.5,
        },
      },
      {
        input: "キャベツを2袋プラス",
        expected: {
          type: "stock_operation",
          operation: "add",
          stockName: "キャベツ",
          amount: 2,
        },
      },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = parseIntent(input);
      expect(result.type).toBe(expected.type);
      expect(result.operation).toBe(expected.operation);
      expect(result.stockName).toBe(expected.stockName);
      expect(result.amount).toBe(expected.amount);
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  it("在庫減算パターンを正しく解析する", () => {
    const testCases = [
      {
        input: "ブロッコリーを1袋減らす",
        expected: {
          type: "stock_operation",
          operation: "subtract",
          stockName: "ブロッコリー",
          amount: 1,
        },
      },
      {
        input: "にんじん2袋使った",
        expected: {
          type: "stock_operation",
          operation: "subtract",
          stockName: "にんじん",
          amount: 2,
        },
      },
      {
        input: "トマトを0.5袋マイナス",
        expected: {
          type: "stock_operation",
          operation: "subtract",
          stockName: "トマト",
          amount: 0.5,
        },
      },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = parseIntent(input);
      expect(result.type).toBe(expected.type);
      expect(result.operation).toBe(expected.operation);
      expect(result.stockName).toBe(expected.stockName);
      expect(result.amount).toBe(expected.amount);
    });
  });

  it("在庫設定パターンを正しく解析する", () => {
    const testCases = [
      {
        input: "ブロッコリーを5袋に設定",
        expected: {
          type: "stock_operation",
          operation: "set",
          stockName: "ブロッコリー",
          amount: 5,
        },
      },
      {
        input: "にんじんの在庫を3袋にする",
        expected: {
          type: "stock_operation",
          operation: "set",
          stockName: "にんじん",
          amount: 3,
        },
      },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = parseIntent(input);
      expect(result.type).toBe(expected.type);
      expect(result.operation).toBe(expected.operation);
      expect(result.stockName).toBe(expected.stockName);
      expect(result.amount).toBe(expected.amount);
    });
  });

  it("新規作成パターンを正しく解析する", () => {
    const testCases = [
      {
        input: "ピーマンを新規追加",
        expected: {
          type: "stock_operation",
          operation: "create",
          stockName: "ピーマン",
        },
      },
      {
        input: "なすを登録",
        expected: {
          type: "stock_operation",
          operation: "create",
          stockName: "なす",
        },
      },
      {
        input: "新しくきゅうりを追加",
        expected: {
          type: "stock_operation",
          operation: "create",
          stockName: "きゅうり",
        },
      },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = parseIntent(input);
      expect(result.type).toBe(expected.type);
      expect(result.operation).toBe(expected.operation);
      expect(result.stockName).toBe(expected.stockName);
      expect(result.amount).toBeUndefined();
    });
  });

  it("在庫照会パターンを正しく解析する", () => {
    const testCases = [
      {
        input: "ブロッコリーの在庫は",
        expected: { type: "stock_query", stockName: "ブロッコリー" },
      },
      {
        input: "にんじんは何袋",
        expected: { type: "stock_query", stockName: "にんじん" },
      },
      {
        input: "トマトの残り",
        expected: { type: "stock_query", stockName: "トマト" },
      },
      {
        input: "在庫確認",
        expected: { type: "stock_query", stockName: undefined },
      },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = parseIntent(input);
      expect(result.type).toBe(expected.type);
      expect(result.stockName).toBe(expected.stockName);
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  it("一般的な会話を正しく分類する", () => {
    const testCases = [
      "こんにちは",
      "ありがとう",
      "今日の天気は",
      "システムの使い方を教えて",
    ];

    testCases.forEach((input) => {
      const result = parseIntent(input);
      expect(result.type).toBe("general_chat");
      expect(result.confidence).toBeLessThan(0.7);
    });
  });
});

describe("parseStockCreationData", () => {
  it("新規在庫作成データを正しく抽出する", () => {
    const input = "ブロッコリーを新規追加 300g 毎日30g 2袋 5日でアラート";
    const result = parseStockCreationData(input);

    expect(result).toEqual({
      name: "ブロッコリー",
      totalWeightG: 300,
      dailyUsageG: 30,
      stockCountBag: 2,
      thresholdDays: 5,
    });
  });

  it("部分的な情報でも正しく抽出する", () => {
    const input = "にんじんを登録 400g";
    const result = parseStockCreationData(input);

    expect(result).toEqual({
      name: "にんじん",
      totalWeightG: 400,
      dailyUsageG: undefined,
      stockCountBag: undefined,
      thresholdDays: undefined,
    });
  });

  it("野菜名がない場合はnullを返す", () => {
    const input = "300g 毎日30g";
    const result = parseStockCreationData(input);

    expect(result).toBeNull();
  });
});

describe("fuzzyMatchStockName", () => {
  const stockNames = [
    "ブロッコリー",
    "にんじん",
    "トマト",
    "キャベツ",
    "ピーマン",
  ];

  it("完全一致で正しくマッチする", () => {
    expect(fuzzyMatchStockName("ブロッコリー", stockNames)).toBe(
      "ブロッコリー"
    );
    expect(fuzzyMatchStockName("にんじん", stockNames)).toBe("にんじん");
  });

  it("大文字小文字を無視してマッチする", () => {
    expect(fuzzyMatchStockName("ブロッコリー", stockNames)).toBe(
      "ブロッコリー"
    );
  });

  it("部分一致で正しくマッチする", () => {
    expect(fuzzyMatchStockName("ブロッコ", stockNames)).toBe("ブロッコリー");
    expect(fuzzyMatchStockName("にんじ", stockNames)).toBe("にんじん");
  });

  it("マッチしない場合はnullを返す", () => {
    expect(fuzzyMatchStockName("存在しない野菜", stockNames)).toBeNull();
    expect(fuzzyMatchStockName("", stockNames)).toBeNull();
  });
});

describe("validateAmount", () => {
  it("正常な数値を受け入れる", () => {
    expect(validateAmount(1, "add")).toEqual({ isValid: true });
    expect(validateAmount(5.5, "subtract")).toEqual({ isValid: true });
    expect(validateAmount(10, "set")).toEqual({ isValid: true });
  });

  it("無効な数値を拒否する", () => {
    expect(validateAmount(NaN, "add")).toEqual({
      isValid: false,
      error: "数値が正しくありません",
    });
    expect(validateAmount(Infinity, "add")).toEqual({
      isValid: false,
      error: "数値が正しくありません",
    });
  });

  it("負の値を拒否する", () => {
    expect(validateAmount(-1, "add")).toEqual({
      isValid: false,
      error: "負の値は指定できません",
    });
  });

  it("大きすぎる値を拒否する", () => {
    expect(validateAmount(101, "set")).toEqual({
      isValid: false,
      error: "在庫数が大きすぎます（100袋以下にしてください）",
    });
    expect(validateAmount(51, "add")).toEqual({
      isValid: false,
      error: "一度に変更できる数量が大きすぎます（50袋以下にしてください）",
    });
  });
});

describe("generateResponseMessage", () => {
  it("成功時の在庫操作メッセージを生成する", () => {
    const intent: StockIntent = {
      type: "stock_operation",
      operation: "add",
      stockName: "ブロッコリー",
      amount: 2,
      confidence: 0.9,
      originalText: "ブロッコリーを2袋追加",
    };

    const message = generateResponseMessage(intent, true, "ブロッコリー", 5);
    expect(message).toBe("ブロッコリーを2袋追加しました（現在: 5袋）");
  });

  it("成功時の在庫照会メッセージを生成する", () => {
    const intent: StockIntent = {
      type: "stock_query",
      stockName: "にんじん",
      confidence: 0.8,
      originalText: "にんじんの在庫は",
    };

    const message = generateResponseMessage(intent, true, "にんじん", 3);
    expect(message).toBe("にんじんの在庫は3袋です");
  });

  it("失敗時のエラーメッセージを生成する", () => {
    const intent: StockIntent = {
      type: "stock_operation",
      operation: "add",
      stockName: "ブロッコリー",
      amount: 2,
      confidence: 0.9,
      originalText: "ブロッコリーを2袋追加",
    };

    const message = generateResponseMessage(intent, false);
    expect(message).toBe(
      "申し訳ありません。ブロッコリーの追加に失敗しました。"
    );
  });

  it("一般的な会話のメッセージを生成する", () => {
    const intent: StockIntent = {
      type: "general_chat",
      confidence: 0.5,
      originalText: "こんにちは",
    };

    const message = generateResponseMessage(intent, true);
    expect(message).toBe(
      "ご質問ありがとうございます。在庫に関することでしたら、「ブロッコリー 2袋追加」のように話しかけてください。"
    );
  });
});
