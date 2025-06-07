/**
 * 残日数を計算する
 * @param totalWeightG 1袋の重量(g)
 * @param dailyUsageG 1日の使用量(g)
 * @param stockCountBag 現在の袋数
 * @returns 残日数（daily_usage_g = 0の場合はnull）
 */
export function calculateRemainingDays(
  totalWeightG: number,
  dailyUsageG: number,
  stockCountBag: number
): number | null {
  if (dailyUsageG <= 0) {
    return null;
  }

  const totalStockG = totalWeightG * stockCountBag;
  return Math.floor(totalStockG / dailyUsageG);
}

/**
 * 指定日数分の必要袋数を計算する
 * @param totalWeightG 1袋の重量(g)
 * @param dailyUsageG 1日の使用量(g)
 * @param targetDays 目標日数（デフォルト13日）
 * @returns 必要袋数
 */
export function calculateRequiredBags(
  totalWeightG: number,
  dailyUsageG: number,
  targetDays: number = 13
): number {
  if (totalWeightG <= 0 || dailyUsageG <= 0) {
    return 0;
  }

  const totalRequiredG = dailyUsageG * targetDays;
  return Math.ceil(totalRequiredG / totalWeightG);
}

/**
 * 不足袋数を計算する
 * @param totalWeightG 1袋の重量(g)
 * @param dailyUsageG 1日の使用量(g)
 * @param stockCountBag 現在の袋数
 * @param targetDays 目標日数（デフォルト13日）
 * @returns 不足袋数（負の値の場合は余剰）
 */
export function calculateShortfallBags(
  totalWeightG: number,
  dailyUsageG: number,
  stockCountBag: number,
  targetDays: number = 13
): number {
  const requiredBags = calculateRequiredBags(
    totalWeightG,
    dailyUsageG,
    targetDays
  );
  return Math.max(0, requiredBags - stockCountBag);
}

/**
 * 数値を表示用にフォーマットする
 * @param value 数値
 * @param precision 小数点以下桁数（デフォルト1）
 * @returns フォーマット済み文字列（1000以上は"1k+"形式）
 */
export function formatNumber(value: number, precision: number = 1): string {
  if (value >= 1000) {
    return `${Math.floor(value / 1000)}k+`;
  }

  return Number(value.toFixed(precision)).toString();
}

/**
 * 在庫データのバリデーション
 * @param stockData 在庫データ
 * @returns バリデーション結果
 */
export function validateStockData(stockData: {
  name: string;
  totalWeightG: number;
  dailyUsageG: number;
  stockCountBag: number;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!stockData.name.trim()) {
    errors.push("野菜名が必要です");
  }

  if (stockData.totalWeightG <= 0) {
    errors.push("1袋の重量は正の値である必要があります");
  }

  if (stockData.dailyUsageG < 0) {
    errors.push("1日の使用量は0以上である必要があります");
  }

  if (stockData.stockCountBag < 0) {
    errors.push("袋数は0以上である必要があります");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
