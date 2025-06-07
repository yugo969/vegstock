"use client";

import { useState } from "react";
import { StockCard } from "./StockCard";
import { StockForm } from "./StockForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useStocks } from "@/hooks/useStocks";
import type { Stock, StockInsert } from "@/types/supabase";
import { Search, Plus, Package, AlertTriangle } from "lucide-react";

export function StockList() {
  const {
    stocks,
    loading,
    error,
    createStock,
    updateStock,
    updateStockCount,
    deleteStock,
  } = useStocks();

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [sortBy, setSortBy] = useState<
    "name" | "remaining_days" | "updated_at"
  >("updated_at");

  // フィルタリング
  const filteredStocks = stocks.filter((stock) =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ソート
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "remaining_days":
        const remainingA =
          a.daily_usage_g > 0
            ? Math.floor(
                (a.total_weight_g * a.stock_count_bag) / a.daily_usage_g
              )
            : Infinity;
        const remainingB =
          b.daily_usage_g > 0
            ? Math.floor(
                (b.total_weight_g * b.stock_count_bag) / b.daily_usage_g
              )
            : Infinity;
        return remainingA - remainingB;
      case "updated_at":
      default:
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }
  });

  // 統計情報
  const totalStocks = stocks.length;
  const lowStockCount = stocks.filter((stock) => {
    if (!stock.threshold_days || stock.daily_usage_g <= 0) return false;
    const remainingDays = Math.floor(
      (stock.total_weight_g * stock.stock_count_bag) / stock.daily_usage_g
    );
    return remainingDays <= stock.threshold_days;
  }).length;
  const outOfStockCount = stocks.filter(
    (stock) => stock.stock_count_bag === 0
  ).length;

  const handleFormSubmit = async (stockData: Omit<StockInsert, "user_id">) => {
    if (editingStock) {
      const success = await updateStock(editingStock.id, stockData);
      if (success) {
        setEditingStock(null);
        setShowForm(false);
      }
      return success;
    } else {
      const success = await createStock(stockData);
      if (success) {
        setShowForm(false);
      }
      return success;
    }
  };

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingStock(null);
    setShowForm(false);
  };

  if (error) {
    return (
      <Card className="bg-surface-800 border-surface-600">
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <p>エラーが発生しました: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計情報 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-surface-800 border-surface-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-neon-primary" />
              <div>
                <p className="text-sm text-gray-400">総在庫数</p>
                <p className="text-2xl font-bold text-white">{totalStocks}</p>
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
                  {outOfStockCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-800 border-surface-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">在庫少</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {lowStockCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 検索・フィルター */}
      <Card className="bg-surface-800 border-surface-600">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="野菜名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-surface-700 border-surface-600 focus:border-neon-primary"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "name" | "remaining_days" | "updated_at"
                )
              }
              className="px-3 py-2 bg-surface-700 border border-surface-600 rounded-md text-white focus:border-neon-primary focus:outline-none"
            >
              <option value="updated_at">更新日順</option>
              <option value="name">名前順</option>
              <option value="remaining_days">残日数順</option>
            </select>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-neon-primary hover:bg-neon-primary-hover text-surface-900 font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              在庫追加
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* フォーム */}
      {showForm && (
        <StockForm
          stock={editingStock || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
          loading={loading}
        />
      )}

      {/* 在庫一覧 */}
      {loading && stocks.length === 0 ? (
        <Card className="bg-surface-800 border-surface-600">
          <CardContent className="p-6">
            <div className="text-center text-gray-400">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <p>読み込み中...</p>
            </div>
          </CardContent>
        </Card>
      ) : sortedStocks.length === 0 ? (
        <Card className="bg-surface-800 border-surface-600">
          <CardContent className="p-6">
            <div className="text-center text-gray-400">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <p>
                {searchTerm
                  ? `"${searchTerm}"に一致する在庫が見つかりません`
                  : "在庫データがありません"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="mt-4 bg-neon-primary hover:bg-neon-primary-hover text-surface-900 font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  最初の在庫を追加
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedStocks.map((stock) => (
            <StockCard
              key={stock.id}
              stock={stock}
              onUpdateCount={updateStockCount}
              onEdit={handleEdit}
              onDelete={deleteStock}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
