"use client";

import { useState } from "react";
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

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error("すべての項目を入力してください");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("パスワードが一致しません");
      return;
    }

    if (password.length < 6) {
      toast.error("パスワードは6文字以上で入力してください");
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password);

      if (error) {
        toast.error(error.message || "アカウント作成に失敗しました");
      } else {
        toast.success("アカウントを作成しました。確認メールをご確認ください。");
        router.push("/login");
      }
    } catch (err) {
      toast.error("予期しないエラーが発生しました");
    } finally {
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
            新規アカウント作成
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
                パスワード（6文字以上）
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
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-300"
              >
                パスワード確認
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="パスワード確認"
                disabled={loading}
                className="bg-surface-700 border-surface-600 focus:border-neon-primary"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-neon-primary hover:bg-neon-primary-hover text-surface-900 font-semibold"
            >
              {loading ? "作成中..." : "アカウント作成"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              すでにアカウントをお持ちの方は{" "}
              <Link
                href="/login"
                className="text-neon-accent hover:text-neon-accent-hover font-medium underline"
              >
                ログイン
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
