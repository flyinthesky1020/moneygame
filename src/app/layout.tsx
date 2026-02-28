import type { Metadata } from "next";
import HomeBackButton from "@/components/HomeBackButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "Virtual Trading Game",
  description: "H5 virtual trading game MVP skeleton"
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
