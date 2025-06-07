export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      stocks: {
        Row: {
          id: string;
          user_id: string;
          team_id: string | null;
          name: string;
          total_weight_g: number;
          daily_usage_g: number;
          stock_count_bag: number;
          created_at: string;
          updated_at: string;
          threshold_days: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id?: string | null;
          name: string;
          total_weight_g: number;
          daily_usage_g: number;
          stock_count_bag: number;
          created_at?: string;
          updated_at?: string;
          threshold_days?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_id?: string | null;
          name?: string;
          total_weight_g?: number;
          daily_usage_g?: number;
          stock_count_bag?: number;
          created_at?: string;
          updated_at?: string;
          threshold_days?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "stocks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// 便利な型エイリアス
export type Stock = Database["public"]["Tables"]["stocks"]["Row"];
export type StockInsert = Database["public"]["Tables"]["stocks"]["Insert"];
export type StockUpdate = Database["public"]["Tables"]["stocks"]["Update"];
