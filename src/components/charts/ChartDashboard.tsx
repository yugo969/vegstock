"use client";

import { useState, useMemo } from "react";
import { StockChart } from "./StockChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStocks } from "@/hooks/useStocks";
import {
  calculateRemainingDays,
  calculateShortfallBags,
} from "@/lib/stock-utils";
import { BarChart3, TrendingDown, AlertTriangle, Package } from "lucide-react";

type ChartType = "remaining_days" | "shortfall_bags" | "both";
type FilterType = "all" | "low_stock" | "out_of_stock" | "sufficient";

export function ChartDashboard() {
  const { stocks, loading } = useStocks();
  const [chartType, setChartType] = useState<ChartType>("both");
  const [filterType, setFilterType] = useState<FilterType>("all");

  // フィルタリング処理
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const remainingDays = calculateRemainingDays(
        stock.total_weight_g,
        stock.daily_usage_g,
        stock.stock_count_bag
      );

      switch (filterType) {
        case "out_of_stock":
          return stock.stock_count_bag === 0;
        case "low_stock":
          return (
            remainingDays !== null &&
            remainingDays <= 7 &&
            stock.stock_count_bag > 0
          );
        case "sufficient":
          return remainingDays !== null && remainingDays > 7;
        default:
          return true;
      }
    });
  }, [stocks, filterType]);

  // 統計データ
  const stats = useMemo(() => {
    const total = stocks.length;
    const outOfStock = stocks.filter((s) => s.stock_count_bag === 0).length;
    const lowStock = stocks.filter((s) => {
      const remaining = calculateRemainingDays(
        s.total_weight_g,
        s.daily_usage_g,
        s.stock_count_bag
      );
      return remaining !== null && remaining <= 7 && s.stock_count_bag > 0;
    }).length;
    const sufficient = stocks.filter((s) => {
      const remaining = calculateRemainingDays(
        s.total_weight_g,
        s.daily_usage_g,
        s.stock_count_bag
      );
      return remaining !== null && remaining > 7;
    }).length;
    const totalShortfall = stocks.reduce((acc, stock) => {
      return (
        acc +
        calculateShortfallBags(
          stock.total_weight_g,
          stock.daily_usage_g,
          stock.stock_count_bag
        )
      );
    }, 0);

    return { total, outOfStock, lowStock, sufficient, totalShortfall };
  }, [stocks]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-surface-800 rounded-lg mb-4"></div>
          <div className="h-80 bg-surface-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-surface-800 border-surface-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-neon-primary" />
              <div>
                <p className="text-sm text-gray-400">総在庫数</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-800 border-surface-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-sm text-gray-400">在庫切れ</p>
                <p className="text-2xl font-bold text-red-400">
                  {stats.outOfStock}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-800 border-surface-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">在庫少</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {stats.lowStock}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-800 border-surface-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-neon-accent" />
              <div>
                <p className="text-sm text-gray-400">総不足袋数</p>
                <p className="text-2xl font-bold text-neon-accent">
                  {stats.totalShortfall.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* コントロールパネル */}
      <Card className="bg-surface-800 border-surface-600">
        <CardHeader>
          <CardTitle className="text-neon-primary flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            グラフ設定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* グラフタイプ選択 */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                表示タイプ
              </label>
              <div className="flex gap-2">
                <Button
                  variant={chartType === "both" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("both")}
                  className={
                    chartType === "both"
                      ? "bg-neon-primary hover:bg-neon-primary-hover text-surface-900"
                      : "text-gray-400 hover:text-neon-accent"
                  }
                >
                  両方
                </Button>
                <Button
                  variant={chartType === "remaining_days" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("remaining_days")}
                  className={
                    chartType === "remaining_days"
                      ? "bg-neon-primary hover:bg-neon-primary-hover text-surface-900"
                      : "text-gray-400 hover:text-neon-accent"
                  }
                >
                  残日数
                </Button>
                <Button
                  variant={chartType === "shortfall_bags" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("shortfall_bags")}
                  className={
                    chartType === "shortfall_bags"
                      ? "bg-neon-primary hover:bg-neon-primary-hover text-surface-900"
                      : "text-gray-400 hover:text-neon-accent"
                  }
                >
                  不足袋数
                </Button>
              </div>
            </div>

            {/* フィルター選択 */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                フィルター
              </label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterType === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                  className={
                    filterType === "all"
                      ? "bg-neon-primary hover:bg-neon-primary-hover text-surface-900"
                      : "text-gray-400 hover:text-neon-accent"
                  }
                >
                  全て
                </Button>
                <Button
                  variant={filterType === "out_of_stock" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilterType("out_of_stock")}
                  className={
                    filterType === "out_of_stock"
                      ? "bg-neon-primary hover:bg-neon-primary-hover text-surface-900"
                      : "text-gray-400 hover:text-neon-accent"
                  }
                >
                  在庫切れ
                </Button>
                <Button
                  variant={filterType === "low_stock" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilterType("low_stock")}
                  className={
                    filterType === "low_stock"
                      ? "bg-neon-primary hover:bg-neon-primary-hover text-surface-900"
                      : "text-gray-400 hover:text-neon-accent"
                  }
                >
                  在庫少
                </Button>
                <Button
                  variant={filterType === "sufficient" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilterType("sufficient")}
                  className={
                    filterType === "sufficient"
                      ? "bg-neon-primary hover:bg-neon-primary-hover text-surface-900"
                      : "text-gray-400 hover:text-neon-accent"
                  }
                >
                  十分
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* グラフ表示 */}
      <Card className="bg-surface-800 border-surface-600">
        <CardContent className="p-6">
          <StockChart stocks={filteredStocks} type={chartType} />
        </CardContent>
      </Card>

      {/* データサマリー */}
      {filteredStocks.length > 0 && (
        <Card className="bg-surface-800 border-surface-600">
          <CardHeader>
            <CardTitle className="text-neon-primary">データサマリー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">表示中の在庫数:</span>
                <span className="ml-2 text-white font-semibold">
                  {filteredStocks.length}個
                </span>
              </div>
              <div>
                <span className="text-gray-400">平均残日数:</span>
                <span className="ml-2 text-white font-semibold">
                  {filteredStocks.length > 0
                    ? (
                        filteredStocks.reduce((acc, stock) => {
                          const days = calculateRemainingDays(
                            stock.total_weight_g,
                            stock.daily_usage_g,
                            stock.stock_count_bag
                          );
                          return acc + (days || 0);
                        }, 0) / filteredStocks.length
                      ).toFixed(1)
                    : 0}
                  日
                </span>
              </div>
              <div>
                <span className="text-gray-400">合計不足袋数:</span>
                <span className="ml-2 text-white font-semibold">
                  {filteredStocks
                    .reduce((acc, stock) => {
                      return (
                        acc +
                        calculateShortfallBags(
                          stock.total_weight_g,
                          stock.daily_usage_g,
                          stock.stock_count_bag
                        )
                      );
                    }, 0)
                    .toFixed(1)}
                  袋
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
