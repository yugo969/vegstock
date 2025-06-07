import type { Metadata } from "next";
import { Orbitron, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "vegstock - 冷凍野菜ストック管理",
  description:
    "AIが支援する冷凍野菜ストック管理アプリ。在庫状況の視覚化、残日数計算、チャットベースの操作で効率的な食材管理を実現。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${inter.variable} antialiased dark`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
