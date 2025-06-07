import { supabase } from "./client";
import type { Stock, StockInsert, StockUpdate } from "@/types/supabase";

export class StocksService {
  private supabase = supabase;

  /**
   * 現在のユーザーの在庫一覧を取得
   */
  async getStocks(): Promise<{ data: Stock[] | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from("stocks")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("在庫取得に失敗しました"),
      };
    }
  }

  /**
   * 特定のIDの在庫を取得
   */
  async getStock(
    id: string
  ): Promise<{ data: Stock | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from("stocks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("在庫取得に失敗しました"),
      };
    }
  }

  /**
   * 野菜名で在庫を検索
   */
  async getStockByName(
    name: string
  ): Promise<{ data: Stock | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from("stocks")
        .select("*")
        .eq("name", name)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = No rows found
        throw error;
      }

      return { data: data || null, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("在庫検索に失敗しました"),
      };
    }
  }

  /**
   * 新しい在庫を作成
   */
  async createStock(
    stockData: Omit<StockInsert, "user_id">
  ): Promise<{ data: Stock | null; error: Error | null }> {
    try {
      const {
        data: { user },
        error: userError,
      } = await this.supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("認証が必要です");
      }

      const { data, error } = await this.supabase
        .from("stocks")
        .insert({
          ...stockData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("在庫作成に失敗しました"),
      };
    }
  }

  /**
   * 在庫を更新
   */
  async updateStock(
    id: string,
    stockData: StockUpdate
  ): Promise<{ data: Stock | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from("stocks")
        .update(stockData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("在庫更新に失敗しました"),
      };
    }
  }

  /**
   * 在庫の袋数を更新（加算/減算も可能）
   */
  async updateStockCount(
    id: string,
    newCount: number,
    operation: "set" | "add" | "subtract" = "set"
  ): Promise<{ data: Stock | null; error: Error | null }> {
    try {
      if (operation === "set") {
        return this.updateStock(id, { stock_count_bag: newCount });
      }

      // 現在の値を取得
      const { data: currentStock, error: getError } = await this.getStock(id);
      if (getError || !currentStock) {
        throw getError || new Error("在庫が見つかりません");
      }

      let updatedCount: number;
      switch (operation) {
        case "add":
          updatedCount = currentStock.stock_count_bag + newCount;
          break;
        case "subtract":
          updatedCount = Math.max(0, currentStock.stock_count_bag - newCount);
          break;
        default:
          throw new Error("無効な操作です");
      }

      return this.updateStock(id, { stock_count_bag: updatedCount });
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error
            : new Error("在庫数更新に失敗しました"),
      };
    }
  }

  /**
   * 在庫を削除
   */
  async deleteStock(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from("stocks")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error : new Error("在庫削除に失敗しました"),
      };
    }
  }

  /**
   * リアルタイム同期のセットアップ
   */
  subscribeToStocks(
    onInsert?: (payload: { new: Stock }) => void,
    onUpdate?: (payload: { old: Stock; new: Stock }) => void,
    onDelete?: (payload: { old: Stock }) => void
  ) {
    return this.supabase
      .channel("stocks_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "stocks",
        },
        (payload) => {
          if (onInsert) {
            onInsert(payload as unknown as { new: Stock });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "stocks",
        },
        (payload) => {
          if (onUpdate) {
            onUpdate(payload as unknown as { old: Stock; new: Stock });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "stocks",
        },
        (payload) => {
          if (onDelete) {
            onDelete(payload as unknown as { old: Stock });
          }
        }
      )
      .subscribe();
  }
}

// シングルトンインスタンス
export const stocksService = new StocksService();
