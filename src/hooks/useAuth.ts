"use client";

import { useEffect, useState } from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthState({
        user: session?.user ?? null,
        loading: false,
        error: null,
      });
    });

    // 初期セッションも取得
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setAuthState({
        user: session?.user ?? null,
        loading: false,
        error: null,
      });
    };
    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // ログイン
  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  // サインアップ
  const signUp = async (email: string, password: string) => {
    return supabase.auth.signUp({
      email,
      password,
    });
  };

  // ログアウト
  const signOut = async () => {
    return supabase.auth.signOut();
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
  };
}
