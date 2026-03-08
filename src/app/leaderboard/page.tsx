"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FINANCE_SCHOLAR_NAMES,
  pickScholarNames,
} from "@/lib/financeScholarNames";
import styles from "./page.module.css";

type LeaderboardRow = {
  id: string;
  user_id: string;
  total_return_pct: number;
  total_profit: number;
  win_count: number;
};

type LeaderboardResponse = {
  date_key: string;
  leaderboard: LeaderboardRow[];
  current_player: {
    rank: number;
    total_return_pct: number;
    total_profit: number;
    win_count: number;
  } | null;
};

function maskUserId(userId: string) {
  return `${userId.slice(0, 4)}...${userId.slice(-4)}`;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBoard() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/leaderboard");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message ?? "加载排行榜失败");
      }
      setData(json as LeaderboardResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载排行榜失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.body.classList.add("home-like-body");
    loadBoard();
    return () => {
      document.body.classList.remove("home-like-body");
    };
  }, []);

  const aliases = useMemo(() => {
    const dateKey = data?.date_key ?? "default";
    return pickScholarNames(dateKey, FINANCE_SCHOLAR_NAMES.length);
  }, [data?.date_key]);
  const currentRank = data?.current_player?.rank ?? null;
  const currentReturnPct = data?.current_player?.total_return_pct ?? null;
  const currentProfit = data?.current_player?.total_profit ?? null;
  const currentWinCount = data?.current_player?.win_count ?? null;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.heroKicker}>DAILY TOP 100</span>
        <h1 className={styles.heroTitle}>韭皇排行榜</h1>
        <p className={styles.heroText}>
          展示当日每日挑战模式下，按收益率排序后的前 100 名玩家最佳成绩。
        </p>
      </section>

      {error ? <div className="error-text">{error}</div> : null}

      <section className={styles.boardCard}>
        <div className={styles.boardHead}>
          <span>排名</span>
          <span>匿名玩家昵称</span>
          <span>收益率</span>
          <span>总收益</span>
          <span>胜场</span>
        </div>

        <div className={styles.boardRows}>
          {(data?.leaderboard ?? []).length === 0 && !loading ? (
            <div className={styles.empty}>当日还没有上榜记录。</div>
          ) : null}

          {(data?.leaderboard ?? []).map((row, index) => {
            const alias = aliases[index] ?? FINANCE_SCHOLAR_NAMES[index];
            const returnClass = row.total_return_pct >= 0
              ? styles.returnUp
              : styles.returnDown;

            return (
              <div key={row.id} className={styles.row}>
                <span
                  className={`${styles.rank} ${index < 3 ? styles.topRank : ""}`}
                >
                  #{index + 1}
                </span>
                <div className={styles.scholar}>
                  <span className={styles.scholarName}>{alias}</span>
                  <span className={styles.scholarMeta}>
                    玩家代号 {maskUserId(row.user_id)}
                  </span>
                </div>
                <span className={returnClass}>
                  {(row.total_return_pct * 100).toFixed(2)}%
                </span>
                <span className={styles.profitValue}>
                  {Number(row.total_profit ?? 0).toFixed(2)}
                </span>
                <span>{row.win_count ?? 0}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.currentBar}>
        <div className={styles.currentRow}>
          <span className={`${styles.rank} ${styles.currentRank}`}>
            #{currentRank ?? "999+"}
          </span>
          <div className={styles.scholar}>
            <span className={styles.scholarName}>我</span>
            <span className={styles.scholarMeta}>我的当日最佳成绩</span>
          </div>
          <span
            className={
              currentReturnPct === null
                ? styles.mutedValue
                : currentReturnPct >= 0
                  ? styles.returnUp
                  : styles.returnDown
            }
          >
            {currentReturnPct === null ? "无" : `${(currentReturnPct * 100).toFixed(2)}%`}
          </span>
          <span className={currentProfit === null ? styles.mutedValue : styles.profitValue}>
            {currentProfit === null ? "无" : Number(currentProfit).toFixed(2)}
          </span>
          <span className={currentWinCount === null ? styles.mutedValue : ""}>
            {currentWinCount === null ? "无" : currentWinCount}
          </span>
        </div>
      </section>
    </div>
  );
}
