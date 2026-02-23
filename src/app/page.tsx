"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "train" | "daily";

type StartResponse = {
  run_id: string;
  mode: Mode;
  date_key: string;
  questions: Array<{
    question_id: string;
    candles: Array<{ o: number; h: number; l: number; c: number; v: number }>;
  }>;
};

export default function HomePage() {
  const router = useRouter();
  const [startingMode, setStartingMode] = useState<Mode | null>(null);
  const [error, setError] = useState<string>("");

  async function startRun(mode: Mode) {
    try {
      setError("");
      setStartingMode(mode);

      const res = await fetch("/api/run/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });

      const data = await res.json();
      if (res.status === 409 && data?.existing_run_id) {
        router.push(`/result/${data.existing_run_id}`);
        return;
      }
      if (!res.ok) {
        setError(data?.message ?? "启动失败");
        return;
      }

      const payload = data as StartResponse;
      sessionStorage.setItem(
        `run_start:${payload.run_id}`,
        JSON.stringify(payload)
      );
      router.push(`/play?mode=${payload.mode}&run_id=${payload.run_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "启动失败");
    } finally {
      setStartingMode(null);
    }
  }

  return (
    <div className="stack">
      <h1>虚拟交易游戏</h1>
      <p>请选择模式开始。</p>
      <div className="row">
        <button
          type="button"
          onClick={() => startRun("train")}
          disabled={startingMode !== null}
        >
          {startingMode === "train" ? "启动中..." : "训练模式（10题）"}
        </button>
        <button
          type="button"
          onClick={() => startRun("daily")}
          disabled={startingMode !== null}
        >
          {startingMode === "daily" ? "启动中..." : "每日挑战（50题）"}
        </button>
      </div>
      {error ? <div className="error-text">{error}</div> : null}
    </div>
  );
}
