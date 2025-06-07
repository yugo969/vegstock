import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// シングルトンインスタンス
let supabase: ReturnType<typeof createSupabaseBrowserClient>;

export const getSupabaseBrowserClient = () => {
  if (!supabase) {
    supabase = createSupabaseBrowserClient();
  }
  return supabase;
};
