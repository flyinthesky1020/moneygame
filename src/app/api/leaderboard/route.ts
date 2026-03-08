import { NextRequest, NextResponse } from "next/server";
import { getSingaporeDateKey, isValidDateKey } from "@/lib/dateKey";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const requestedDate = req.nextUrl.searchParams.get("date");
    const dateKey = requestedDate && isValidDateKey(requestedDate)
      ? requestedDate
      : getSingaporeDateKey();

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("runs")
      .select(
        "id,user_id,date_key,total_return_pct,total_profit,final_bankroll,n,win_count,avg_buy_ratio,style_tag,style_text,completed_at"
      )
      .eq("mode", "daily")
      .eq("date_key", dateKey)
      .eq("completed", true)
      .order("total_return_pct", { ascending: false })
      .order("completed_at", { ascending: true })
      .limit(100);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const userId = req.cookies.get("user_id")?.value ?? "";
    let currentPlayer: {
      rank: number;
      total_return_pct: number;
      total_profit: number;
      win_count: number;
    } | null = null;

    if (userId) {
      const { data: myRows, error: myErr } = await supabase
        .from("runs")
        .select("total_return_pct,total_profit,win_count,completed_at")
        .eq("mode", "daily")
        .eq("date_key", dateKey)
        .eq("completed", true)
        .eq("user_id", userId)
        .order("total_return_pct", { ascending: false })
        .order("completed_at", { ascending: true })
        .limit(1);

      if (myErr) {
        return NextResponse.json({ message: myErr.message }, { status: 500 });
      }

      const myBest = (myRows ?? [])[0];
      if (myBest?.completed_at) {
        const { count: higherCount, error: higherErr } = await supabase
          .from("runs")
          .select("id", { count: "exact", head: true })
          .eq("mode", "daily")
          .eq("date_key", dateKey)
          .eq("completed", true)
          .gt("total_return_pct", myBest.total_return_pct);
        if (higherErr) {
          return NextResponse.json({ message: higherErr.message }, { status: 500 });
        }

        const { count: tieEarlierCount, error: tieErr } = await supabase
          .from("runs")
          .select("id", { count: "exact", head: true })
          .eq("mode", "daily")
          .eq("date_key", dateKey)
          .eq("completed", true)
          .eq("total_return_pct", myBest.total_return_pct)
          .lt("completed_at", myBest.completed_at);
        if (tieErr) {
          return NextResponse.json({ message: tieErr.message }, { status: 500 });
        }

        currentPlayer = {
          rank: (higherCount ?? 0) + (tieEarlierCount ?? 0) + 1,
          total_return_pct: myBest.total_return_pct,
          total_profit: myBest.total_profit,
          win_count: myBest.win_count ?? 0,
        };
      }
    }

    return NextResponse.json({
      date_key: dateKey,
      leaderboard: data ?? [],
      current_player: currentPlayer,
    });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
