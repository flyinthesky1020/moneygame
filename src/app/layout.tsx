import type { Metadata } from "next";
import HomeBackButton from "@/components/HomeBackButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "韭皇养成计划",
  description: "韭皇养成计划 H5 虚拟交易游戏"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <HomeBackButton />
        <main>{children}</main>
      </body>
    </html>
  );
}
