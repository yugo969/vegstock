"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockList } from "@/components/stocks/StockList";
import { ChartDashboard } from "@/components/charts/ChartDashboard";
import { ChatPanel } from "@/components/ai/ChatPanel";
import { toast } from "sonner";
import { Package, BarChart3, MessageSquare, LogOut } from "lucide-react";

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  // 認証ガード - 未認証の場合はログインページにリダイレクト（一度だけ）
  useEffect(() => {
    if (!loading && !user && !hasRedirected.current) {
      console.log("User not authenticated, redirecting to login");
      hasRedirected.current = true;
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("ログアウトに失敗しました");
    } else {
      toast.success("ログアウトしました");
      router.push("/login");
    }
  };

  // 認証中の場合はローディング表示
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-neon-primary text-lg">読み込み中...</div>
        </div>
      </div>
    );
  }

  // 未認証の場合は空の画面（リダイレクト処理中）
  if (!user) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400">認証確認中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Header */}
      <header className="bg-surface-800 border-b border-surface-600 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1
            className="text-2xl font-heading font-bold text-neon-primary glitch"
            data-text="vegstock"
          >
            vegstock
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-400 hover:text-neon-accent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <Tabs defaultValue="stocks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="stocks" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              在庫一覧
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              グラフ
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              AIチャット
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="space-y-4">
            <StockList />
          </TabsContent>

          <TabsContent value="charts" className="space-y-4">
            <ChartDashboard />
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <ChatPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
