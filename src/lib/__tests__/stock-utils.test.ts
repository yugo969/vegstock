import { describe, it, expect } from "vitest";
import {
  calculateRemainingDays,
  calculateRequiredBags,
  calculateShortfallBags,
  formatNumber,
  validateStockData,
} from "../stock-utils";

describe("stock-utils", () => {
  describe("calculateRemainingDays", () => {
    it("正常な値で残日数を計算する", () => {
      // 300g袋、1日30g使用、2袋在庫 = 20日
      expect(calculateRemainingDays(300, 30, 2)).toBe(20);

      // 250g袋、1日50g使用、1.5袋在庫 = 7日
      expect(calculateRemainingDays(250, 50, 1.5)).toBe(7);
    });

    it("dailyUsageGが0以下の場合nullを返す", () => {
      expect(calculateRemainingDays(300, 0, 2)).toBeNull();
      expect(calculateRemainingDays(300, -10, 2)).toBeNull();
    });

    it("在庫0の場合は0日を返す", () => {
      expect(calculateRemainingDays(300, 30, 0)).toBe(0);
    });
  });

  describe("calculateRequiredBags", () => {
    it("正常な値で必要袋数を計算する", () => {
      // 300g袋、1日30g使用、13日分 = 390g必要 = 2袋
      expect(calculateRequiredBags(300, 30, 13)).toBe(2);

      // 250g袋、1日50g使用、13日分 = 650g必要 = 3袋
      expect(calculateRequiredBags(250, 50, 13)).toBe(3);
    });

    it("デフォルトで13日分を計算する", () => {
      expect(calculateRequiredBags(300, 30)).toBe(2);
    });

    it("無効な値の場合は0を返す", () => {
      expect(calculateRequiredBags(0, 30)).toBe(0);
      expect(calculateRequiredBags(300, 0)).toBe(0);
      expect(calculateRequiredBags(-100, 30)).toBe(0);
      expect(calculateRequiredBags(300, -30)).toBe(0);
    });
  });

  describe("calculateShortfallBags", () => {
    it("不足袋数を計算する", () => {
      // 必要2袋、在庫1袋 = 1袋不足
      expect(calculateShortfallBags(300, 30, 1)).toBe(1);

      // 必要3袋、在庫1袋 = 2袋不足
      expect(calculateShortfallBags(250, 50, 1)).toBe(2);
    });

    it("在庫が十分な場合は0を返す", () => {
      // 必要2袋、在庫3袋 = 不足なし
      expect(calculateShortfallBags(300, 30, 3)).toBe(0);

      // 必要2袋、在庫2袋 = 不足なし
      expect(calculateShortfallBags(300, 30, 2)).toBe(0);
    });
  });

  describe("formatNumber", () => {
    it("小数点以下1桁で丸める", () => {
      expect(formatNumber(3.14159)).toBe("3.1");
      expect(formatNumber(2.0)).toBe("2");
      expect(formatNumber(1.99)).toBe("2");
    });

    it("1000以上はk+形式で表示", () => {
      expect(formatNumber(1000)).toBe("1k+");
      expect(formatNumber(1500)).toBe("1k+");
      expect(formatNumber(2999)).toBe("2k+");
    });

    it("カスタム精度を指定できる", () => {
      expect(formatNumber(3.14159, 0)).toBe("3");
      expect(formatNumber(3.14159, 2)).toBe("3.14");
    });
  });

  describe("validateStockData", () => {
    it("有効なデータでバリデーション成功", () => {
      const validData = {
        name: "ブロッコリー",
        totalWeightG: 300,
        dailyUsageG: 30,
        stockCountBag: 2,
      };

      const result = validateStockData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("野菜名が空の場合エラー", () => {
      const invalidData = {
        name: "",
        totalWeightG: 300,
        dailyUsageG: 30,
        stockCountBag: 2,
      };

      const result = validateStockData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("野菜名が必要です");
    });

    it("野菜名が空白のみの場合エラー", () => {
      const invalidData = {
        name: "   ",
        totalWeightG: 300,
        dailyUsageG: 30,
        stockCountBag: 2,
      };

      const result = validateStockData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("野菜名が必要です");
    });

    it("重量が0以下の場合エラー", () => {
      const invalidData = {
        name: "ブロッコリー",
        totalWeightG: 0,
        dailyUsageG: 30,
        stockCountBag: 2,
      };

      const result = validateStockData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("1袋の重量は正の値である必要があります");
    });

    it("使用量が負の場合エラー", () => {
      const invalidData = {
        name: "ブロッコリー",
        totalWeightG: 300,
        dailyUsageG: -10,
        stockCountBag: 2,
      };

      const result = validateStockData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("1日の使用量は0以上である必要があります");
    });

    it("袋数が負の場合エラー", () => {
      const invalidData = {
        name: "ブロッコリー",
        totalWeightG: 300,
        dailyUsageG: 30,
        stockCountBag: -1,
      };

      const result = validateStockData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("袋数は0以上である必要があります");
    });

    it("複数のエラーがある場合すべて報告", () => {
      const invalidData = {
        name: "",
        totalWeightG: -100,
        dailyUsageG: -30,
        stockCountBag: -2,
      };

      const result = validateStockData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4);
    });
  });
});
