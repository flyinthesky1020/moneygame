"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SharePosterCanvas from "@/components/SharePosterCanvas";
import { cacheCompletedRun } from "@/lib/homeTaskProgress";
import { cacheScoreHistory } from "@/lib/scoreHistory";

type RunResult = {
  id?: string;
  run_id?: string;
  mode: "train" | "daily";
  n: number;
  total_profit: number;
  total_return_pct: number;
  final_bankroll: number;
  win_count: number;
  win_days?: number;
  loss_days?: number;
  idle_days?: number;
  avg_buy_ratio: number;
  curve: number[];
  style_tag: string;
  style_text: string;
  nickname?: string;
  completed_at?: string;
};

function safeGetNickname(runId: string): string {
  try {
    const sessionValue = sessionStorage.getItem(`run_nickname:${runId}`);
    if (sessionValue?.trim()) return sessionValue.trim();
  } catch {
    // ignore storage errors
  }
  try {
    const localValue = localStorage.getItem(`run_nickname:${runId}`);
    if (localValue?.trim()) return localValue.trim();
  } catch {
    // ignore storage errors
  }
  return "";
}

function safeSetNickname(runId: string, nickname: string) {
  if (!nickname) return;
  try {
    sessionStorage.setItem(`run_nickname:${runId}`, nickname);
  } catch {
    // ignore storage errors
  }
  try {
    localStorage.setItem(`run_nickname:${runId}`, nickname);
  } catch {
    // ignore storage errors
  }
}

export default function ResultPage() {
  const params = useParams<{ runId: string }>();
  const runId = params?.runId;
  const [data, setData] = useState<RunResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.classList.add("result-mode-body");
    return () => {
      document.body.classList.remove("result-mode-body");
    };
  }, []);

  useEffect(() => {
    let canceled = false;

    async function loadData() {
      if (!runId) {
        setError("runId 缺失");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");

        const cacheRaw = sessionStorage.getItem(`run_result:${runId}`);
        if (cacheRaw) {
          const cached = JSON.parse(cacheRaw) as RunResult;
          const cachedNickname = (cached.nickname ?? "").trim();
          const nickname = cachedNickname || safeGetNickname(runId);
          if (nickname) {
            safeSetNickname(runId, nickname);
          }
          if (!canceled) {
            cacheCompletedRun({
              runId,
              mode: cached.mode,
              dateKey: "",
              completedAt: cached.completed_at ?? new Date(0).toISOString(),
              totalProfit: cached.total_profit,
              totalReturnPct: cached.total_return_pct,
              winDays: cached.win_days ?? cached.win_count ?? 0,
              lossDays: cached.loss_days ?? 0,
              idleDays: cached.idle_days ?? 0,
            });
            cacheScoreHistory({
              runId,
              nickname,
              mode: cached.mode,
              totalReturnPct: cached.total_return_pct,
              winDays: cached.win_days ?? cached.win_count ?? 0,
              lossDays: cached.loss_days ?? 0,
              idleDays: cached.idle_days ?? 0,
              completedAt: cached.completed_at ?? new Date(0).toISOString(),
            });
            setData({
              ...cached,
              nickname,
            });
            setLoading(false);
          }
          return;
        }

        const res = await fetch(`/api/run/${runId}`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.message ?? "加载结算失败");
        }

        const normalized: RunResult = {
          ...json,
          run_id: json.id ?? runId,
          curve: Array.isArray(json.curve) ? json.curve : [0],
          nickname: safeGetNickname(runId),
        };
        cacheCompletedRun({
          runId,
          mode: normalized.mode,
          dateKey: typeof json.date_key === "string" ? json.date_key : "",
          completedAt: normalized.completed_at ?? new Date(0).toISOString(),
          totalProfit: normalized.total_profit,
          totalReturnPct: normalized.total_return_pct,
          winDays: normalized.win_days ?? normalized.win_count ?? 0,
          lossDays: normalized.loss_days ?? 0,
          idleDays: normalized.idle_days ?? 0,
        });
        cacheScoreHistory({
          runId,
          nickname: normalized.nickname ?? "",
          mode: normalized.mode,
          totalReturnPct: normalized.total_return_pct,
          winDays: normalized.win_days ?? normalized.win_count ?? 0,
          lossDays: normalized.loss_days ?? 0,
          idleDays: normalized.idle_days ?? 0,
          completedAt: normalized.completed_at ?? new Date(0).toISOString(),
        });
        safeSetNickname(runId, normalized.nickname ?? "");
        sessionStorage.setItem(`run_result:${runId}`, JSON.stringify(normalized));
        if (!canceled) {
          setData(normalized);
          setLoading(false);
        }
      } catch (e) {
        if (!canceled) {
          setError(e instanceof Error ? e.message : "加载结算失败");
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      canceled = true;
    };
  }, [runId]);

  if (loading) {
    return (
      <div className="page-loader" role="status" aria-label="页面加载中">
        <span className="page-loader-spinner" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="stack">
        <h1>结算页</h1>
        <div className="error-text">{error || "暂无结算数据"}</div>
      </div>
    );
  }

  const displayNickname = data.nickname?.trim() || "匿名玩家";
  const winDays = data.win_days ?? data.win_count ?? 0;
  const idleDays = data.idle_days ?? 0;
  const fallbackLoss = Math.max(0, data.n - winDays - idleDays);
  const lossDays = data.loss_days ?? fallbackLoss;

  return (
    <div className="stack result-page-shell">
      <div className="page-head">
        <h1 className="play-mode-title-text result-page-title">战绩结算</h1>
      </div>
      <SharePosterCanvas
        runId={runId || ""}
        nickname={displayNickname}
        completedAt={data.completed_at}
        totalReturnPct={data.total_return_pct}
        totalProfit={data.total_profit}
        winDays={winDays}
        lossDays={lossDays}
        idleDays={idleDays}
        curve={data.curve}
        styleText={data.style_text || "暂无评语"}
      />
    </div>
  );
}
