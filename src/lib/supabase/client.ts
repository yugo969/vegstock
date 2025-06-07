import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// クライアントサイド用
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Reactコンポーネント用（クライアントサイド）
export const createSupabaseClient = () =>
  createClientComponentClient<Database>();

// サーバーコンポーネント用
export const createSupabaseServerClient = () =>
  createServerComponentClient<Database>({ cookies });

// 管理者用（サーバーサイドのみ）
export const createSupabaseServiceClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, serviceRoleKey);
};
