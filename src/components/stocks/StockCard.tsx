"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  calculateRemainingDays,
  calculateRequiredBags,
  calculateShortfallBags,
  formatNumber,
} from "@/lib/stock-utils";
import type { Stock } from "@/types/supabase";
import {
  Package,
  Calendar,
  AlertTriangle,
  Plus,
  Minus,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react";

interface StockCardProps {
  stock: Stock;
  onUpdateCount: (
    id: string,
    newCount: number,
    operation: "set" | "add" | "subtract"
  ) => Promise<boolean>;
  onEdit: (stock: Stock) => void;
  onDelete: (id: string) => Promise<boolean>;
  loading?: boolean;
}

export function StockCard({
  stock,
  onUpdateCount,
  onEdit,
  onDelete,
  loading = false,
}: StockCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(stock.stock_count_bag.toString());
  const [quickAmount, setQuickAmount] = useState("1");

  // 計算値
  const remainingDays = calculateRemainingDays(
    stock.total_weight_g,
    stock.daily_usage_g,
    stock.stock_count_bag
  );
  const requiredBags = calculateRequiredBags(
    stock.total_weight_g,
    stock.daily_usage_g
  );
  const shortfallBags = calculateShortfallBags(
    stock.total_weight_g,
    stock.daily_usage_g,
    stock.stock_count_bag
  );

  // アラート判定
  const isLowStock =
    remainingDays !== null &&
    stock.threshold_days &&
    remainingDays <= stock.threshold_days;
  const isOutOfStock = stock.stock_count_bag === 0;

  const handleDirectEdit = async () => {
    const newCount = parseFloat(editValue);
    if (isNaN(newCount) || newCount < 0) {
      setEditValue(stock.stock_count_bag.toString());
      setIsEditing(false);
      return;
    }

    const success = await onUpdateCount(stock.id, newCount, "set");
    if (success) {
      setIsEditing(false);
    } else {
      setEditValue(stock.stock_count_bag.toString());
    }
  };

  const handleQuickUpdate = async (operation: "add" | "subtract") => {
    const amount = parseFloat(quickAmount);
    if (isNaN(amount) || amount <= 0) return;

    await onUpdateCount(stock.id, amount, operation);
  };

  const handleDelete = async () => {
    if (window.confirm(`${stock.name}を削除しますか？`)) {
      await onDelete(stock.id);
    }
  };

  return (
    <Card
      className={`bg-surface-800 border-surface-600 transition-all duration-200 ${
        isOutOfStock
          ? "border-red-500/50 bg-red-900/10"
          : isLowStock
          ? "border-yellow-500/50 bg-yellow-900/10"
          : "hover:border-neon-primary/50"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-neon-primary flex items-center gap-2">
            <Package className="h-5 w-5" />
            {stock.name}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(stock)}
              disabled={loading}
              className="text-gray-400 hover:text-neon-accent h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="text-gray-400 hover:text-red-400 h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* アラート表示 */}
        {(isOutOfStock || isLowStock) && (
          <div
            className={`flex items-center gap-2 text-sm ${
              isOutOfStock ? "text-red-400" : "text-yellow-400"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            {isOutOfStock ? "在庫切れ" : "在庫少"}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 基本情報 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">1袋重量:</span>
            <span className="ml-2 text-white">
              {formatNumber(stock.total_weight_g)}g
            </span>
          </div>
          <div>
            <span className="text-gray-400">1日使用:</span>
            <span className="ml-2 text-white">
              {formatNumber(stock.daily_usage_g)}g
            </span>
          </div>
        </div>

        {/* 在庫数表示・編集 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">現在の袋数:</span>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-20 h-8 text-sm bg-surface-700 border-surface-600"
                />
                <Button
                  size="sm"
                  onClick={handleDirectEdit}
                  disabled={loading}
                  className="h-8 w-8 p-0 bg-neon-primary hover:bg-neon-primary-hover text-surface-900"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditValue(stock.stock_count_bag.toString());
                  }}
                  disabled={loading}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-lg font-semibold text-neon-primary hover:text-neon-primary-hover transition-colors"
              >
                {formatNumber(stock.stock_count_bag)}袋
              </button>
            )}
          </div>

          {/* クイック操作 */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={quickAmount}
              onChange={(e) => setQuickAmount(e.target.value)}
              className="w-16 h-8 text-sm bg-surface-700 border-surface-600"
            />
            <Button
              size="sm"
              onClick={() => handleQuickUpdate("subtract")}
              disabled={loading}
              className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white"
            >
              <Minus className="h-3 w-3 mr-1" />
              使用
            </Button>
            <Button
              size="sm"
              onClick={() => handleQuickUpdate("add")}
              disabled={loading}
              className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-3 w-3 mr-1" />
              追加
            </Button>
          </div>
        </div>

        {/* 計算結果 */}
        <div className="space-y-2 pt-2 border-t border-surface-600">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              残日数:
            </span>
            <span
              className={`font-semibold ${
                remainingDays === null
                  ? "text-gray-500"
                  : remainingDays <= 3
                  ? "text-red-400"
                  : remainingDays <= 7
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {remainingDays === null ? "–" : `${remainingDays}日`}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">13日分必要:</span>
            <span className="text-white">{formatNumber(requiredBags)}袋</span>
          </div>

          {shortfallBags > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">不足:</span>
              <span className="text-red-400 font-semibold">
                {formatNumber(shortfallBags)}袋
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
