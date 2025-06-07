import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// シングルトンクライアント（推奨）
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// 後方互換性のため残すが、シングルトンを返す
export const createSupabaseClient = () => supabase;
