import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// サーバーコンポーネント用
export const createSupabaseServerClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// 管理者用（サーバーサイドのみ）
export const createSupabaseServiceClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, serviceRoleKey);
};
