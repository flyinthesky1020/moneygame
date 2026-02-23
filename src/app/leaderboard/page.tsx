"use client";

import { useEffect, useState } from "react";

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
};

export default function LeaderboardPage() {
  const [date, setDate] = useState("");
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBoard(selectedDate?: string) {
    try {
      setLoading(true);
      setError("");
      const query = selectedDate ? `?date=${selectedDate}` : "";
      const res = await fetch(`/api/leaderboard${query}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message ?? "加载排行榜失败");
      }
      setData(json as LeaderboardResponse);
      if (!selectedDate && json?.date_key) {
        setDate(json.date_key);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载排行榜失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBoard();
  }, []);

  return (
    <div className="stack">
      <h1>排行榜 Top100</h1>
      <div className="row">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="date-input"
        />
        <button type="button" onClick={() => loadBoard(date)} disabled={loading}>
          {loading ? "加载中..." : "查询"}
        </button>
      </div>

      {error ? <div className="error-text">{error}</div> : null}

      <div className="card">
        <div className="board-head">
          <span>日期：{data?.date_key ?? "-"}</span>
          <span>总人数：{data?.leaderboard?.length ?? 0}</span>
        </div>

        <div className="board-grid board-grid-head">
          <span>排名</span>
          <span>用户</span>
          <span>收益率</span>
          <span>总收益</span>
          <span>盈利题数</span>
        </div>

        {(data?.leaderboard ?? []).map((row, idx) => (
          <div key={row.id} className="board-grid">
            <span>#{idx + 1}</span>
            <span>{row.user_id.slice(0, 8)}...</span>
            <span className={row.total_return_pct >= 0 ? "profit-up" : "profit-down"}>
              {(row.total_return_pct * 100).toFixed(2)}%
            </span>
            <span>{Number(row.total_profit ?? 0).toFixed(2)}</span>
            <span>{row.win_count ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
