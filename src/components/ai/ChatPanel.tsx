"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAIChat, type ChatMessage } from "@/hooks/useAIChat";
import {
  MessageCircle,
  Send,
  Trash2,
  Bot,
  User,
  Loader2,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";

export function ChatPanel() {
  const [inputMessage, setInputMessage] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [shoppingList, setShoppingList] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingShoppingList, setLoadingShoppingList] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    getStockAnalysis,
    getShoppingList,
  } = useAIChat();

  // メッセージ送信
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    await sendMessage(inputMessage);
    setInputMessage("");
    inputRef.current?.focus();
  };

  // Enterキーでメッセージ送信
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 在庫分析取得
  const handleGetAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const result = await getStockAnalysis();
      setAnalysis(result);
      setShowAnalysis(true);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // 買い物リスト取得
  const handleGetShoppingList = async () => {
    setLoadingShoppingList(true);
    try {
      const result = await getShoppingList();
      setShoppingList(result);
      setShowShoppingList(true);
    } catch (error) {
      console.error("Shopping list error:", error);
    } finally {
      setLoadingShoppingList(false);
    }
  };

  // メッセージ一覧の最下部にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 初期フォーカス
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="space-y-4">
      {/* メインチャット */}
      <Card className="bg-surface-800 border-surface-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-neon-primary flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            AIアシスタント
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={handleGetAnalysis}
              disabled={loadingAnalysis}
              size="sm"
              variant="outline"
              className="border-surface-600 hover:border-neon-primary text-gray-300 hover:text-neon-primary"
            >
              {loadingAnalysis ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              在庫分析
            </Button>
            <Button
              onClick={handleGetShoppingList}
              disabled={loadingShoppingList}
              size="sm"
              variant="outline"
              className="border-surface-600 hover:border-neon-primary text-gray-300 hover:text-neon-primary"
            >
              {loadingShoppingList ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              買い物リスト
            </Button>
            <Button
              onClick={clearMessages}
              size="sm"
              variant="outline"
              className="border-surface-600 hover:border-red-500 text-gray-300 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              履歴クリア
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* メッセージ一覧 */}
          <div className="h-96 overflow-y-auto space-y-3 p-2 bg-surface-900 rounded-lg">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-neon-primary" />
                  <p className="mb-2">AIアシスタントがお手伝いします</p>
                  <p className="text-sm">
                    「ブロッコリー
                    2袋追加」や「在庫確認」のように話しかけてください
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
              ))
            )}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400">
                <Bot className="h-5 w-5 text-neon-primary" />
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>考え中...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 入力エリア */}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力..."
              disabled={isLoading}
              className="bg-surface-700 border-surface-600 focus:border-neon-primary"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-neon-primary hover:bg-neon-primary-hover text-surface-900"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* 使用例 */}
          <div className="text-sm text-gray-400">
            <p className="mb-1">💡 使用例:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
              <span>• ブロッコリー 2袋追加</span>
              <span>• にんじんの在庫は？</span>
              <span>• トマト 1袋使った</span>
              <span>• 在庫確認</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 在庫分析パネル */}
      {showAnalysis && analysis && (
        <Card className="bg-surface-800 border-surface-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-neon-accent flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              在庫分析
              <Button
                onClick={() => setShowAnalysis(false)}
                size="sm"
                variant="ghost"
                className="ml-auto text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-gray-300 bg-surface-900 p-4 rounded-lg">
              {analysis}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 買い物リストパネル */}
      {showShoppingList && shoppingList && (
        <Card className="bg-surface-800 border-surface-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-neon-accent flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              買い物リスト
              <Button
                onClick={() => setShowShoppingList(false)}
                size="sm"
                variant="ghost"
                className="ml-auto text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-gray-300 bg-surface-900 p-4 rounded-lg">
              {shoppingList}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ChatMessageItemProps {
  message: ChatMessage;
}

function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.type === "user";
  const isSuccess = message.success !== false;

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <Bot className="h-6 w-6 text-neon-primary" />
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? "order-first" : ""}`}>
        <div
          className={`p-3 rounded-lg ${
            isUser
              ? "bg-neon-primary text-surface-900"
              : isSuccess
              ? "bg-surface-700 text-white"
              : "bg-red-900/20 border border-red-500/50 text-red-300"
          }`}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* インテント情報（デバッグ用） */}
          {message.intent && process.env.NODE_ENV === "development" && (
            <div className="mt-2 text-xs opacity-70 border-t border-gray-600 pt-2">
              {message.intent.type} | {message.intent.operation} |{" "}
              {message.intent.confidence}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-1 px-1">
          {message.timestamp.toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <User className="h-6 w-6 text-gray-400" />
        </div>
      )}
    </div>
  );
}
