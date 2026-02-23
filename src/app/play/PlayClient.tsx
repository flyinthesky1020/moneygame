"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CandlestickWithVolume, {
  CandlePoint,
} from "@/components/CandlestickWithVolume";
import BuyRatioSelector from "@/components/BuyRatioSelector";

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

type FinishResponse = {
  run_id: string;
  mode: Mode;
  n: number;
  total_profit: number;
  total_return_pct: number;
  return_pct: number;
  final_bankroll: number;
  win_count: number;
  avg_buy_ratio: number;
  curve: number[];
  style_tag: string;
  style_text: string;
  completed_at: string;
};

function isMode(v: string | null): v is Mode {
  return v === "train" || v === "daily";
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
  const [buyRatio, setBuyRatio] = useState(0.25);
  const [submitting, setSubmitting] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<AnswerResponse | null>(
    null
  );
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    let canceled = false;

    async function bootstrap() {
      try {
        setLoading(true);
        setError("");

        if (runIdParam) {
          const raw = sessionStorage.getItem(`run_start:${runIdParam}`);
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
        sessionStorage.setItem(`run_start:${payload.run_id}`, JSON.stringify(payload));
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
  }, [modeParam, runIdParam, router]);

  const totalQuestions = runState?.questions.length ?? 0;
  const currentQuestion = runState?.questions[currentIndex] ?? null;
  const isLast = currentIndex === Math.max(0, totalQuestions - 1);

  const progressText = useMemo(() => {
    if (!runState) return "-";
    return `${currentIndex + 1} / ${runState.questions.length}`;
  }, [currentIndex, runState]);

  async function submitAnswer() {
    if (!runState || !currentQuestion) return;
    try {
      setSubmitting(true);
      setError("");

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
      setAnswerFeedback(data as AnswerResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleModalConfirm() {
    if (!runState) return;

    if (!isLast) {
      setAnswerFeedback(null);
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    try {
      setFinishing(true);
      const res = await fetch("/api/run/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ run_id: runState.run_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "结算失败");
      }
      const finishData = data as FinishResponse;
      sessionStorage.setItem(
        `run_result:${runState.run_id}`,
        JSON.stringify(finishData)
      );
      router.push(`/result/${runState.run_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "结算失败");
    } finally {
      setFinishing(false);
      setAnswerFeedback(null);
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
    <div className="stack">
      <h1>做题页</h1>
      <p>
        模式：{runState.mode} | 进度：{progressText}
      </p>

      <div className="card">
        <CandlestickWithVolume candles={currentQuestion.candles} />
      </div>

      <div className="card stack">
        <div>选择买入比例</div>
        <BuyRatioSelector
          value={buyRatio}
          onChange={setBuyRatio}
          disabled={submitting || finishing}
        />
        <button
          type="button"
          onClick={submitAnswer}
          disabled={submitting || finishing}
        >
          {submitting ? "提交中..." : "提交答案"}
        </button>
      </div>

      {error ? <div className="error-text">{error}</div> : null}

      {answerFeedback ? (
        <div className="modal-mask">
          <div className="modal-card stack">
            <h3>本题结果</h3>
            <p>题号：{answerFeedback.index_in_run}</p>
            <p>涨跌幅：{answerFeedback.r_pct.toFixed(4)}%</p>
            <p>本题收益：{answerFeedback.profit.toFixed(2)}</p>
            <p>累计收益：{answerFeedback.cum_profit_after.toFixed(2)}</p>
            <p>当前资金：{answerFeedback.bankroll_after.toFixed(2)}</p>
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
