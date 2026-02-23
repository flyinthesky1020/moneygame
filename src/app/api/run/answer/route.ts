import { NextRequest, NextResponse } from "next/server";
import {
  calcProfit,
  calcReturnRatio,
  toFixedNum,
  START_BANKROLL,
} from "@/lib/gameMath";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

type Candle = {
  c: number;
};

function isUuid(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isValidBuyRatio(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const runId = body?.run_id;
    const questionId = body?.question_id;
    const buyRatio = body?.buy_ratio;

    if (!isUuid(runId) || !isUuid(questionId) || !isValidBuyRatio(buyRatio)) {
      return NextResponse.json(
        { message: "Invalid params: run_id, question_id, buy_ratio" },
        { status: 400 }
      );
    }

    const userId = req.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ message: "Missing user session" }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();

    const { data: runRow, error: runErr } = await supabase
      .from("runs")
      .select("id,user_id,completed,start_bankroll")
      .eq("id", runId)
      .maybeSingle();

    if (runErr) {
      return NextResponse.json({ message: runErr.message }, { status: 500 });
    }
    if (!runRow) {
      return NextResponse.json({ message: "Run not found" }, { status: 404 });
    }
    if (runRow.user_id !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    if (runRow.completed) {
      return NextResponse.json({ message: "Run already completed" }, { status: 409 });
    }

    const { data: dupRow, error: dupErr } = await supabase
      .from("run_answers")
      .select("id")
      .eq("run_id", runId)
      .eq("question_id", questionId)
      .limit(1)
      .maybeSingle();

    if (dupErr) {
      return NextResponse.json({ message: dupErr.message }, { status: 500 });
    }
    if (dupRow?.id) {
      return NextResponse.json(
        { message: "Question already answered in this run" },
        { status: 409 }
      );
    }

    const { data: questionRow, error: qErr } = await supabase
      .from("questions")
      .select("candles")
      .eq("id", questionId)
      .maybeSingle();

    if (qErr) {
      return NextResponse.json({ message: qErr.message }, { status: 500 });
    }
    if (!questionRow) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    const candles = (questionRow.candles ?? []) as Candle[];
    const c0 = Number(candles?.[59]?.c);
    const c1 = Number(candles?.[60]?.c);
    if (!Number.isFinite(c0) || !Number.isFinite(c1)) {
      return NextResponse.json(
        { message: "Question candles data invalid for scoring" },
        { status: 422 }
      );
    }

    const { data: lastAnswer, error: lastErr } = await supabase
      .from("run_answers")
      .select("index_in_run,cum_profit_after")
      .eq("run_id", runId)
      .order("index_in_run", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastErr) {
      return NextResponse.json({ message: lastErr.message }, { status: 500 });
    }

    const prevCum = Number(lastAnswer?.cum_profit_after ?? 0);
    const indexInRun = Number(lastAnswer?.index_in_run ?? 0) + 1;
    const startBankroll = Number(runRow.start_bankroll ?? START_BANKROLL);
    const bankrollBefore = startBankroll + prevCum;

    const returnRatio = calcReturnRatio(c0, c1);
    const profit = calcProfit(bankrollBefore, buyRatio, returnRatio);
    const cumProfitAfter = prevCum + profit;
    const bankrollAfter = startBankroll + cumProfitAfter;

    const { error: insertErr } = await supabase.from("run_answers").insert({
      run_id: runId,
      question_id: questionId,
      index_in_run: indexInRun,
      buy_ratio: buyRatio,
      r: toFixedNum(returnRatio),
      profit: toFixedNum(profit),
      cum_profit_after: toFixedNum(cumProfitAfter),
      bankroll_before: toFixedNum(bankrollBefore),
      bankroll_after: toFixedNum(bankrollAfter),
    });

    if (insertErr) {
      return NextResponse.json({ message: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      index_in_run: indexInRun,
      r_pct: toFixedNum(returnRatio * 100),
      profit: toFixedNum(profit),
      cum_profit_after: toFixedNum(cumProfitAfter),
      bankroll_after: toFixedNum(bankrollAfter),
    });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
