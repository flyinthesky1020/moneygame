import { NextRequest, NextResponse } from "next/server";
import { START_BANKROLL, summarizeRun } from "@/lib/gameMath";
import { generateStyle } from "@/lib/styleEngine";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

function isUuid(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

type AnswerRow = {
  index_in_run: number;
  buy_ratio: number;
  profit: number;
  cum_profit_after: number;
};

const MAX_NICKNAME_LEN = 16;

function sanitizeNickname(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.replace(/\s+/g, " ").trim().slice(0, MAX_NICKNAME_LEN);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const runId = body?.run_id;
    const nickname = sanitizeNickname(body?.nickname);
    if (!isUuid(runId)) {
      return NextResponse.json({ message: "Invalid run_id" }, { status: 400 });
    }

    const userId = req.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ message: "Missing user session" }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();
    const { data: runRow, error: runErr } = await supabase
      .from("runs")
      .select("id,user_id,mode,date_key,completed,start_bankroll")
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
      return NextResponse.json({ message: "Run already completed", run_id: runId });
    }

    const { data: answers, error: ansErr } = await supabase
      .from("run_answers")
      .select("index_in_run,buy_ratio,profit,cum_profit_after")
      .eq("run_id", runId)
      .order("index_in_run", { ascending: true });

    if (ansErr) {
      return NextResponse.json({ message: ansErr.message }, { status: 500 });
    }

    const rows = (answers ?? []) as AnswerRow[];
    const summary = summarizeRun(rows);
    const winDays = rows.filter((row) => row.buy_ratio > 0 && row.profit > 0).length;
    const lossDays = rows.filter((row) => row.buy_ratio > 0 && row.profit < 0).length;
    const idleDays = rows.filter((row) => row.buy_ratio <= 0).length;
    const style = generateStyle({
      totalReturnPct: summary.totalReturnPct,
      winCount: summary.winCount,
      n: summary.n,
      avgBuyRatio: summary.avgBuyRatio,
    });
    const completedAt = new Date().toISOString();

    const { error: updateErr } = await supabase
      .from("runs")
      .update({
        completed: true,
        completed_at: completedAt,
        n: summary.n,
        total_profit: summary.totalProfit,
        total_return_pct: summary.totalReturnPct,
        final_bankroll: summary.finalBankroll,
        win_count: summary.winCount,
        avg_buy_ratio: summary.avgBuyRatio,
        curve: summary.curve,
        style_tag: style.style_tag,
        style_text: style.style_text,
      })
      .eq("id", runId);

    if (updateErr) {
      return NextResponse.json({ message: updateErr.message }, { status: 500 });
    }

    if (runRow.mode === "daily") {
      const { error: dailySetErr } = await supabase.from("daily_user_sets").upsert(
        {
          user_id: userId,
          date_key: runRow.date_key,
          run_id: runId,
        },
        { onConflict: "user_id,date_key" }
      );

      if (dailySetErr) {
        return NextResponse.json({ message: dailySetErr.message }, { status: 500 });
      }
    }

    const startBankroll = Number(runRow.start_bankroll ?? START_BANKROLL);

    return NextResponse.json({
      run_id: runId,
      mode: runRow.mode,
      date_key: runRow.date_key,
      nickname,
      n: summary.n,
      total_profit: summary.totalProfit,
      total_return_pct: summary.totalReturnPct,
      return_pct: summary.totalReturnPct,
      final_bankroll: startBankroll + summary.totalProfit,
      win_count: summary.winCount,
      win_days: winDays,
      loss_days: lossDays,
      idle_days: idleDays,
      avg_buy_ratio: summary.avgBuyRatio,
      curve: summary.curve,
      style_tag: style.style_tag,
      style_text: style.style_text,
      completed_at: completedAt,
    });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
