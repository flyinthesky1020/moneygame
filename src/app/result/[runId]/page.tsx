"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProfitCurveChart from "@/components/ProfitCurveChart";
import SharePosterCanvas from "@/components/SharePosterCanvas";
import StyleCommentCard from "@/components/StyleCommentCard";

type RunResult = {
  id?: string;
  run_id?: string;
  mode: "train" | "daily";
  n: number;
  total_profit: number;
  total_return_pct: number;
  final_bankroll: number;
  win_count: number;
  avg_buy_ratio: number;
  curve: number[];
  style_tag: string;
  style_text: string;
  completed_at?: string;
};

export default function ResultPage() {
  const params = useParams<{ runId: string }>();
  const runId = params?.runId;
  const [data, setData] = useState<RunResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          if (!canceled) {
            setData(cached);
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
        };
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
    return <div className="stack">结算加载中...</div>;
  }

  if (error || !data) {
    return (
      <div className="stack">
        <h1>结算页</h1>
        <div className="error-text">{error || "暂无结算数据"}</div>
      </div>
    );
  }

  return (
    <div className="stack">
      <h1>结算页</h1>
      <p>
        Run ID：{runId} | 模式：{data.mode} | 题数：{data.n}
      </p>

      <div className="card">
        <h3>累计收益曲线</h3>
        <ProfitCurveChart curve={data.curve} />
      </div>

      <div className="card stack">
        <h3>核心指标</h3>
        <p>收益率：{(data.total_return_pct * 100).toFixed(2)}%</p>
        <p>总收益：{data.total_profit.toFixed(2)}</p>
        <p>最终资金：{data.final_bankroll.toFixed(2)}</p>
        <p>胜场：{data.win_count}</p>
        <p>平均仓位：{(data.avg_buy_ratio * 100).toFixed(2)}%</p>
      </div>

      <div className="card">
        <StyleCommentCard
          styleTag={data.style_tag || "稳健观察者"}
          styleText={data.style_text || "暂无评语"}
        />
      </div>

      <div className="card stack">
        <h3>生成分享海报</h3>
        <SharePosterCanvas
          runId={runId || ""}
          totalReturnPct={data.total_return_pct}
          curve={data.curve}
          styleText={data.style_text || "暂无评语"}
        />
      </div>
    </div>
  );
}
