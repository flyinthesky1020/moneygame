"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body>
        <main style={{ padding: 24 }}>
          <div className="card stack" style={{ maxWidth: 760, margin: "0 auto" }}>
            <h1>页面加载失败</h1>
            <p className="error-text">
              {error?.message || "发生未知错误，请刷新页面后重试。"}
            </p>
            <button type="button" onClick={reset}>
              重试
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
