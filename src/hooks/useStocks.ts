"use client";

import { useState, useEffect, useCallback } from "react";
import { stocksService } from "@/lib/supabase/stocks";
import type { Stock, StockInsert, StockUpdate } from "@/types/supabase";
import { toast } from "sonner";

interface UseStocksReturn {
  stocks: Stock[];
  loading: boolean;
  error: Error | null;
  createStock: (stockData: Omit<StockInsert, "user_id">) => Promise<boolean>;
  updateStock: (id: string, stockData: StockUpdate) => Promise<boolean>;
  updateStockCount: (
    id: string,
    newCount: number,
    operation?: "set" | "add" | "subtract"
  ) => Promise<boolean>;
  deleteStock: (id: string) => Promise<boolean>;
  getStockByName: (name: string) => Promise<Stock | null>;
  refreshStocks: () => Promise<void>;
}

export function useStocks(): UseStocksReturn {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 在庫一覧を取得
  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await stocksService.getStocks();

      if (error) {
        throw error;
      }

      setStocks(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err : new Error("在庫取得に失敗しました");
      setError(errorMessage);
      toast.error(errorMessage.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 在庫を作成
  const createStock = useCallback(
    async (stockData: Omit<StockInsert, "user_id">): Promise<boolean> => {
      try {
        const { data, error } = await stocksService.createStock(stockData);

        if (error) {
          throw error;
        }

        if (data) {
          setStocks((prev) => [data, ...prev]);
          toast.success(`${data.name}を追加しました`);
          return true;
        }

        return false;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "在庫作成に失敗しました";
        toast.error(errorMessage);
        return false;
      }
    },
    []
  );

  // 在庫を更新
  const updateStock = useCallback(
    async (id: string, stockData: StockUpdate): Promise<boolean> => {
      try {
        const { data, error } = await stocksService.updateStock(id, stockData);

        if (error) {
          throw error;
        }

        if (data) {
          setStocks((prev) =>
            prev.map((stock) => (stock.id === id ? data : stock))
          );
          toast.success(`${data.name}を更新しました`);
          return true;
        }

        return false;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "在庫更新に失敗しました";
        toast.error(errorMessage);
        return false;
      }
    },
    []
  );

  // 在庫数を更新
  const updateStockCount = useCallback(
    async (
      id: string,
      newCount: number,
      operation: "set" | "add" | "subtract" = "set"
    ): Promise<boolean> => {
      try {
        const { data, error } = await stocksService.updateStockCount(
          id,
          newCount,
          operation
        );

        if (error) {
          throw error;
        }

        if (data) {
          setStocks((prev) =>
            prev.map((stock) => (stock.id === id ? data : stock))
          );

          const operationText =
            operation === "add"
              ? "追加"
              : operation === "subtract"
              ? "使用"
              : "更新";
          toast.success(`${data.name}の在庫を${operationText}しました`);
          return true;
        }

        return false;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "在庫数更新に失敗しました";
        toast.error(errorMessage);
        return false;
      }
    },
    []
  );

  // 在庫を削除
  const deleteStock = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const stockToDelete = stocks.find((stock) => stock.id === id);
        const { error } = await stocksService.deleteStock(id);

        if (error) {
          throw error;
        }

        setStocks((prev) => prev.filter((stock) => stock.id !== id));
        toast.success(`${stockToDelete?.name || "在庫"}を削除しました`);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "在庫削除に失敗しました";
        toast.error(errorMessage);
        return false;
      }
    },
    [stocks]
  );

  // 野菜名で在庫を検索
  const getStockByName = useCallback(
    async (name: string): Promise<Stock | null> => {
      try {
        const { data, error } = await stocksService.getStockByName(name);

        if (error) {
          throw error;
        }

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "在庫検索に失敗しました";
        toast.error(errorMessage);
        return null;
      }
    },
    []
  );

  // 在庫一覧を再取得
  const refreshStocks = useCallback(async () => {
    await fetchStocks();
  }, [fetchStocks]);

  // 初期データ取得
  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  // リアルタイム同期のセットアップ
  useEffect(() => {
    const subscription = stocksService.subscribeToStocks(
      // INSERT
      ({ new: newStock }) => {
        setStocks((prev) => {
          // 既に存在する場合は重複を避ける
          if (prev.some((stock) => stock.id === newStock.id)) {
            return prev;
          }
          return [newStock, ...prev];
        });
      },
      // UPDATE
      ({ new: updatedStock }) => {
        setStocks((prev) =>
          prev.map((stock) =>
            stock.id === updatedStock.id ? updatedStock : stock
          )
        );
      },
      // DELETE
      ({ old: deletedStock }) => {
        setStocks((prev) =>
          prev.filter((stock) => stock.id !== deletedStock.id)
        );
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    stocks,
    loading,
    error,
    createStock,
    updateStock,
    updateStockCount,
    deleteStock,
    getStockByName,
    refreshStocks,
  };
}
