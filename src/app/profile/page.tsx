"use client";

import { useEffect, useState } from "react";
import { readScoreHistory, type ScoreHistoryRecord } from "@/lib/scoreHistory";
import styles from "./page.module.css";

function formatMinute(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "-";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function inferMode(record: ScoreHistoryRecord) {
  return record.mode === "daily" ? "每日挑战" : "练习模式";
}

export default function ProfilePage() {
  const [records, setRecords] = useState<ScoreHistoryRecord[]>([]);

  useEffect(() => {
    document.body.classList.add("home-like-body");
    const syncRecords = () => {
      setRecords(readScoreHistory());
    };

    syncRecords();
    window.addEventListener("focus", syncRecords);
    window.addEventListener("storage", syncRecords);
    return () => {
      document.body.classList.remove("home-like-body");
      window.removeEventListener("focus", syncRecords);
      window.removeEventListener("storage", syncRecords);
    };
  }, []);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>我的成绩</h1>
        <p className={styles.heroText}>看看自己的看图胜率，也许能熄灭做短线的心</p>
      </section>

      {records.length === 0 ? (
        <div className={styles.empty}>暂无成绩记录，先去完成一局练习或挑战。</div>
      ) : (
        <section className={styles.historyList}>
          {records.map((record) => {
            const returnClass = record.totalReturnPct >= 0
              ? styles.returnUp
              : styles.returnDown;

            return (
              <article key={record.runId} className={styles.historyCard}>
                <div className={styles.historyHead}>
                  <div className={styles.summaryLeft}>
                    <span className={styles.summaryName}>
                      {record.nickname.trim() || "匿名玩家"}
                    </span>
                    <span className={styles.summaryMode}>{inferMode(record)}</span>
                  </div>
                  <span className={styles.summaryTime}>
                    {formatMinute(record.completedAt)}
                  </span>
                </div>

                <div className={styles.metricsLine}>
                  <span className={returnClass}>
                    收益率 {(record.totalReturnPct * 100).toFixed(2)}%
                  </span>
                  <span className={styles.metricInline}>盈利 {record.winDays} 天</span>
                  <span className={styles.metricInline}>亏损 {record.lossDays} 天</span>
                  <span className={styles.metricInline}>未开仓 {record.idleDays} 天</span>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
