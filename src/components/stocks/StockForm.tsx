"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateStockData } from "@/lib/stock-utils";
import type { Stock, StockInsert } from "@/types/supabase";
import { Plus, Save, X } from "lucide-react";

interface StockFormProps {
  stock?: Stock;
  onSubmit: (stockData: Omit<StockInsert, "user_id">) => Promise<boolean>;
  onCancel?: () => void;
  loading?: boolean;
}

export function StockForm({
  stock,
  onSubmit,
  onCancel,
  loading = false,
}: StockFormProps) {
  const [formData, setFormData] = useState({
    name: stock?.name || "",
    total_weight_g: stock?.total_weight_g || 300,
    daily_usage_g: stock?.daily_usage_g || 30,
    stock_count_bag: stock?.stock_count_bag || 0,
    threshold_days: stock?.threshold_days || null,
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    const validation = validateStockData({
      name: formData.name,
      totalWeightG: formData.total_weight_g,
      dailyUsageG: formData.daily_usage_g,
      stockCountBag: formData.stock_count_bag,
    });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);

    // 送信
    const success = await onSubmit(formData);
    if (success && !stock) {
      // 新規作成の場合はフォームをリセット
      setFormData({
        name: "",
        total_weight_g: 300,
        daily_usage_g: 30,
        stock_count_bag: 0,
        threshold_days: null,
      });
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // エラーをクリア
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const isEditing = !!stock;

  return (
    <Card className="bg-surface-800 border-surface-600">
      <CardHeader>
        <CardTitle className="text-neon-primary flex items-center gap-2">
          {isEditing ? (
            <>
              <Save className="h-5 w-5" />
              在庫編集
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              在庫追加
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* エラー表示 */}
          {errors.length > 0 && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-md p-3">
              <ul className="text-red-400 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 野菜名 */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-300">
              野菜名 <span className="text-red-400">*</span>
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="例: ブロッコリー"
              disabled={loading}
              className="bg-surface-700 border-surface-600 focus:border-neon-primary"
            />
          </div>

          {/* 1袋の重量 */}
          <div className="space-y-2">
            <label
              htmlFor="total_weight_g"
              className="text-sm font-medium text-gray-300"
            >
              1袋の重量 (g) <span className="text-red-400">*</span>
            </label>
            <Input
              id="total_weight_g"
              type="number"
              min="1"
              step="1"
              value={formData.total_weight_g}
              onChange={(e) =>
                handleInputChange(
                  "total_weight_g",
                  parseInt(e.target.value) || 0
                )
              }
              placeholder="300"
              disabled={loading}
              className="bg-surface-700 border-surface-600 focus:border-neon-primary"
            />
          </div>

          {/* 1日の使用量 */}
          <div className="space-y-2">
            <label
              htmlFor="daily_usage_g"
              className="text-sm font-medium text-gray-300"
            >
              1日の使用量 (g) <span className="text-red-400">*</span>
            </label>
            <Input
              id="daily_usage_g"
              type="number"
              min="0"
              step="1"
              value={formData.daily_usage_g}
              onChange={(e) =>
                handleInputChange(
                  "daily_usage_g",
                  parseInt(e.target.value) || 0
                )
              }
              placeholder="30"
              disabled={loading}
              className="bg-surface-700 border-surface-600 focus:border-neon-primary"
            />
          </div>

          {/* 現在の袋数 */}
          <div className="space-y-2">
            <label
              htmlFor="stock_count_bag"
              className="text-sm font-medium text-gray-300"
            >
              現在の袋数 <span className="text-red-400">*</span>
            </label>
            <Input
              id="stock_count_bag"
              type="number"
              min="0"
              step="0.1"
              value={formData.stock_count_bag}
              onChange={(e) =>
                handleInputChange(
                  "stock_count_bag",
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder="2"
              disabled={loading}
              className="bg-surface-700 border-surface-600 focus:border-neon-primary"
            />
          </div>

          {/* アラート閾値（オプション） */}
          <div className="space-y-2">
            <label
              htmlFor="threshold_days"
              className="text-sm font-medium text-gray-300"
            >
              アラート閾値 (日){" "}
              <span className="text-gray-500">（オプション）</span>
            </label>
            <Input
              id="threshold_days"
              type="number"
              min="1"
              step="1"
              value={formData.threshold_days || ""}
              onChange={(e) =>
                handleInputChange(
                  "threshold_days",
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              placeholder="3"
              disabled={loading}
              className="bg-surface-700 border-surface-600 focus:border-neon-primary"
            />
            <p className="text-xs text-gray-500">
              残日数がこの値以下になったときにアラートを表示します
            </p>
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-neon-primary hover:bg-neon-primary-hover text-surface-900 font-semibold"
            >
              {loading ? "処理中..." : isEditing ? "更新" : "追加"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={loading}
                className="text-gray-400 hover:text-neon-accent"
              >
                <X className="h-4 w-4 mr-2" />
                キャンセル
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
