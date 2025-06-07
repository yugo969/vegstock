"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockList } from "@/components/stocks/StockList";
import { toast } from "sonner";
import { Package, BarChart3, MessageSquare, LogOut } from "lucide-react";

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("ログアウトに失敗しました");
    } else {
      toast.success("ログアウトしました");
    }
  };

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
            <Card className="bg-surface-800 border-surface-600">
              <CardHeader>
                <CardTitle className="text-neon-primary">在庫グラフ</CardTitle>
                <CardDescription className="text-gray-400">
                  残日数と必要袋数の可視化
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">グラフデータがありません</p>
                  <p className="text-sm text-gray-500 mt-2">
                    在庫データを追加するとグラフが表示されます
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <Card className="bg-surface-800 border-surface-600">
              <CardHeader>
                <CardTitle className="text-neon-primary">AIチャット</CardTitle>
                <CardDescription className="text-gray-400">
                  自然言語で在庫操作を行います
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">AIチャット機能</p>
                  <p className="text-sm text-gray-500 mt-2">
                    「ブロッコリー3袋追加」などと話しかけてください
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
