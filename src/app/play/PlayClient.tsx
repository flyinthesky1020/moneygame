"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CandlestickWithVolume, {
  CandlePoint,
} from "@/components/CandlestickWithVolume";
import BuyRatioSelector from "@/components/BuyRatioSelector";
import { START_BANKROLL } from "@/lib/gameMath";
import { cacheCompletedRun } from "@/lib/homeTaskProgress";
import {
  resolveRoundFeedbackText,
} from "@/lib/playRoundFeedback";
import { cacheScoreHistory } from "@/lib/scoreHistory";

type Mode = "train" | "daily";

type StartResponse = {
  run_id: string;
  mode: Mode;
  date_key: string;
  questions: Array<{
    question_id: string;
    candles: CandlePoint[];
  }>;
};

type AnswerResponse = {
  index_in_run: number;
  r_pct: number;
  profit: number;
  cum_profit_after: number;
  bankroll_after: number;
};

type RoundFeedback = AnswerResponse & {
  streak_comment: string;
  return_comment: string;
  unlocked_achievements: string[];
};

type FinishResponse = {
  run_id: string;
  mode: Mode;
  date_key: string;
  n: number;
  total_profit: number;
  total_return_pct: number;
  return_pct: number;
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
  completed_at: string;
};

const MAX_NICKNAME_LEN = 16;

function sanitizeNickname(input: string): string {
  return input.replace(/\s+/g, " ").trim().slice(0, MAX_NICKNAME_LEN);
}

function isMode(v: string | null): v is Mode {
  return v === "train" || v === "daily";
}

function safeGetSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function clearRunStartCache() {
  try {
    const keysToDelete: string[] = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (key?.startsWith("run_start:")) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // ignore storage errors
  }
}

function safeSetRunStart(runId: string, payload: StartResponse) {
  const key = `run_start:${runId}`;
  const value = JSON.stringify(payload);
  try {
    sessionStorage.setItem(key, value);
  } catch {
    clearRunStartCache();
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // ignore if still exceeds quota
    }
  }
}

function safeSetNickname(runId: string, nickname: string) {
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

export default function PlayClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const modeParam = searchParams.get("mode");
  const runIdParam = searchParams.get("run_id");

  const [runState, setRunState] = useState<StartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<RoundFeedback | null>(
    null
  );
  const [finishing, setFinishing] = useState(false);
  const [cumProfit, setCumProfit] = useState(0);
  const [profitHistory, setProfitHistory] = useState<number[]>([]);
  const [nicknameInput, setNicknameInput] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [chartHeight, setChartHeight] = useState(360);

  useEffect(() => {
    document.body.classList.add("play-mode-body");
    return () => {
      document.body.classList.remove("play-mode-body");
    };
  }, []);

  useEffect(() => {
    const updateChartHeight = () => {
      const viewportHeight = window.innerHeight;
      if (viewportHeight <= 720) {
        setChartHeight(280);
        return;
      }
      if (viewportHeight <= 820) {
        setChartHeight(310);
        return;
      }
      if (viewportHeight <= 920) {
        setChartHeight(340);
        return;
      }
      setChartHeight(370);
    };

    updateChartHeight();
    window.addEventListener("resize", updateChartHeight);
    window.visualViewport?.addEventListener("resize", updateChartHeight);
    return () => {
      window.removeEventListener("resize", updateChartHeight);
      window.visualViewport?.removeEventListener("resize", updateChartHeight);
    };
  }, []);

  useEffect(() => {
    let canceled = false;

    async function bootstrap() {
      try {
        setLoading(true);
        setError("");

        if (runIdParam && runState?.run_id === runIdParam) {
          if (!canceled) setLoading(false);
          return;
        }

        if (runIdParam) {
          const raw = safeGetSession(`run_start:${runIdParam}`);
          if (raw) {
            const parsed = JSON.parse(raw) as StartResponse;
            if (!canceled) {
              setRunState(parsed);
              setLoading(false);
            }
            return;
          }
        }

        if (!isMode(modeParam)) {
          if (!canceled) {
            setError("缺少 mode 或 run_id，无法开始。");
            setLoading(false);
          }
          return;
        }

        const res = await fetch("/api/run/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: modeParam }),
        });
        const data = await res.json();

        if (res.status === 409 && data?.existing_run_id) {
          router.replace(`/result/${data.existing_run_id}`);
          return;
        }
        if (!res.ok) {
          throw new Error(data?.message ?? "启动 run 失败");
        }

        const payload = data as StartResponse;
        safeSetRunStart(payload.run_id, payload);
        router.replace(`/play?mode=${payload.mode}&run_id=${payload.run_id}`);
        if (!canceled) {
          setRunState(payload);
          setLoading(false);
        }
      } catch (e) {
        if (!canceled) {
          setError(e instanceof Error ? e.message : "加载失败");
          setLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      canceled = true;
    };
  }, [modeParam, runIdParam, router, runState?.run_id]);

  const totalQuestions = runState?.questions.length ?? 0;
  const currentQuestion = runState?.questions[currentIndex] ?? null;
  const isLast = currentIndex === Math.max(0, totalQuestions - 1);

  const progressText = useMemo(() => {
    if (!runState) return "-";
    return `${currentIndex + 1} / ${runState.questions.length}`;
  }, [currentIndex, runState]);
  const currentBankroll = START_BANKROLL + cumProfit;
  const currentReturnPct = (cumProfit / START_BANKROLL) * 100;
  const modeTitle = runState?.mode === "daily" ? "韭皇竞技场" : "韭皇练习场";

  async function submitAnswer(buyRatio: number) {
    if (!runState || !currentQuestion) return;
    try {
      setSubmitting(true);
      setError("");
      const bankrollBefore = START_BANKROLL + cumProfit;

      const res = await fetch("/api/run/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          run_id: runState.run_id,
          question_id: currentQuestion.question_id,
          buy_ratio: buyRatio,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "提交答案失败");
      }
      const feedback = data as AnswerResponse;
      const nextProfitHistory = [...profitHistory, feedback.profit];
      const roundReturnPct = bankrollBefore > 0
        ? (feedback.profit / bankrollBefore) * 100
        : 0;
      const { streakText, returnText } = resolveRoundFeedbackText({
        profitHistory: nextProfitHistory,
        roundReturnPct,
      });
      setProfitHistory(nextProfitHistory);
      setAnswerFeedback({
        ...feedback,
        streak_comment: streakText,
        return_comment: returnText,
        unlocked_achievements: [],
      });
      setCumProfit(feedback.cum_profit_after);
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSelectOption(value: number) {
    if (submitting || finishing || answerFeedback) return;
    setSelectedRatio(value);
    void submitAnswer(value);
  }

  async function handleModalConfirm() {
    if (!runState) return;

    if (!isLast) {
      setAnswerFeedback(null);
      setSelectedRatio(null);
      setNicknameError("");
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    const nickname = sanitizeNickname(nicknameInput);
    if (!nickname) {
      setNicknameError("请先填写昵称");
      return;
    }

    try {
      setNicknameError("");
      setFinishing(true);
      const res = await fetch("/api/run/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          run_id: runState.run_id,
          nickname,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "结算失败");
      }
      const finishData = {
        ...(data as FinishResponse),
        nickname,
      };
      sessionStorage.setItem(
        `run_result:${runState.run_id}`,
        JSON.stringify(finishData)
      );
      cacheCompletedRun({
        runId: runState.run_id,
        mode: finishData.mode,
        dateKey: finishData.date_key,
        completedAt: finishData.completed_at,
        totalProfit: finishData.total_profit,
        totalReturnPct: finishData.total_return_pct,
        winDays: finishData.win_days ?? finishData.win_count ?? 0,
        lossDays: finishData.loss_days ?? 0,
        idleDays: finishData.idle_days ?? 0,
      });
      cacheScoreHistory({
        runId: runState.run_id,
        nickname,
        mode: finishData.mode,
        totalReturnPct: finishData.total_return_pct,
        winDays: finishData.win_days ?? finishData.win_count ?? 0,
        lossDays: finishData.loss_days ?? 0,
        idleDays: finishData.idle_days ?? 0,
        completedAt: finishData.completed_at,
      });
      safeSetNickname(runState.run_id, nickname);
      router.push(`/result/${runState.run_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "结算失败");
    } finally {
      setFinishing(false);
    }
  }

  if (loading) {
    return <div className="stack">加载中...</div>;
  }

  if (error && !runState) {
    return (
      <div className="stack">
        <h1>做题页</h1>
        <div className="error-text">{error}</div>
      </div>
    );
  }

  if (!runState || !currentQuestion) {
    return (
      <div className="stack">
        <h1>做题页</h1>
        <div className="error-text">run 数据不存在，请返回首页重新开始。</div>
      </div>
    );
  }

  return (
    <div className="stack play-shell">
      <div className="page-head play-page-head">
        <h1 className="play-mode-title-text">{modeTitle}</h1>
      </div>

      <div className="metric-strip play-metric-strip">
        <div className="metric-cell">
          <span className="metric-label">进度</span>
          <span className="metric-value">{progressText}</span>
        </div>
        <div className="metric-cell">
          <span className="metric-label">当前总资产</span>
          <span className="metric-value">{currentBankroll.toFixed(2)}</span>
        </div>
        <div className="metric-cell">
          <span className="metric-label">收益率</span>
          <span className="metric-value">{currentReturnPct.toFixed(2)}%</span>
        </div>
      </div>

      <div className="card play-chart-card">
        <CandlestickWithVolume candles={currentQuestion.candles} height={chartHeight} />
        <p className="chart-attribution">
          Charting library:
          {" "}
          <a
            href="https://www.tradingview.com/lightweight-charts/"
            target="_blank"
            rel="noreferrer"
          >
            TradingView Lightweight Charts
          </a>
        </p>
      </div>

      <div className="play-bottom-spacer" />
      <div className="play-bottom-bar">
        <div className="card stack play-action-card">
          <BuyRatioSelector
            value={selectedRatio}
            onChange={handleSelectOption}
            disabled={submitting || finishing || Boolean(answerFeedback)}
          />
        </div>
      </div>

      {error ? <div className="error-text">{error}</div> : null}

      {answerFeedback ? (
        <div className="modal-mask">
          <div className="modal-card stack">
            <h3
              className={
                answerFeedback.profit > 0
                  ? "profit-up"
                  : answerFeedback.profit < 0
                    ? "profit-down"
                    : ""
              }
            >
              {answerFeedback.return_comment}
            </h3>
            <p className="round-profit-mini">
              本次收益：
              <span
                className={
                  answerFeedback.profit > 0
                    ? "profit-up"
                    : answerFeedback.profit < 0
                      ? "profit-down"
                      : ""
                }
              >
                {answerFeedback.profit.toFixed(2)}
              </span>
            </p>
            <p className="round-profit-mini">
              当日振幅：
              <span
                className={
                  answerFeedback.r_pct > 0
                    ? "profit-up"
                    : answerFeedback.r_pct < 0
                      ? "profit-down"
                      : ""
                }
              >
                {answerFeedback.r_pct > 0 ? "+" : ""}
                {answerFeedback.r_pct.toFixed(2)}%
              </span>
            </p>
            <p>{answerFeedback.streak_comment}</p>
            {answerFeedback.unlocked_achievements.length > 0 ? (
              <p>特殊成就解锁：{answerFeedback.unlocked_achievements.join("、")}</p>
            ) : null}
            {isLast ? (
              <div className="stack">
                <label htmlFor="finish-nickname">你的昵称（用于结算和分享）</label>
                <input
                  id="finish-nickname"
                  className="date-input"
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => {
                    const next = sanitizeNickname(e.target.value);
                    setNicknameInput(next);
                    if (nicknameError && next) {
                      setNicknameError("");
                    }
                  }}
                  placeholder="请输入昵称"
                  maxLength={MAX_NICKNAME_LEN}
                  disabled={finishing}
                />
                {nicknameError ? (
                  <div className="error-text">{nicknameError}</div>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              onClick={handleModalConfirm}
              disabled={finishing}
            >
              {isLast ? (finishing ? "结算中..." : "完成并结算") : "下一题"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
