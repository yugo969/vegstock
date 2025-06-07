"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  // 認証状態が更新されたらダッシュボードにリダイレクト（一度だけ）
  useEffect(() => {
    if (user && !authLoading && !hasRedirected.current) {
      console.log("User authenticated, redirecting to dashboard", user);
      hasRedirected.current = true;
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("メールアドレスとパスワードを入力してください");
      return;
    }

    setLoading(true);

    try {
      console.log("Starting login process...", { email });
      const { error } = await signIn(email, password);

      if (error) {
        console.error("Login error:", error);
        toast.error(error.message || "ログインに失敗しました");
        setLoading(false);
      } else {
        console.log("Login successful, waiting for auth state update");
        toast.success("ログインしました");
        // 認証状態の更新を少し待ってからローディングを解除
        setTimeout(() => {
          if (!hasRedirected.current) {
            setLoading(false);
          }
        }, 1000);
      }
    } catch (err) {
      console.error("Login exception:", err);
      toast.error("予期しないエラーが発生しました");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-surface-800 border-surface-600">
        <CardHeader className="text-center">
          <CardTitle
            className="text-2xl font-heading font-bold text-neon-primary glitch"
            data-text="vegstock"
          >
            vegstock
          </CardTitle>
          <CardDescription className="text-gray-400">
            冷凍野菜ストック管理アプリ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300"
              >
                メールアドレス
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
                className="bg-surface-700 border-surface-600 focus:border-neon-primary"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300"
              >
                パスワード
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
                disabled={loading}
                className="bg-surface-700 border-surface-600 focus:border-neon-primary"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-neon-primary hover:bg-neon-primary-hover text-surface-900 font-semibold"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              アカウントをお持ちでない方は{" "}
              <Link
                href="/signup"
                className="text-neon-accent hover:text-neon-accent-hover font-medium underline"
              >
                新規登録
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
