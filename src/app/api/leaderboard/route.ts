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
        "id,user_id,date_key,total_return_pct,final_bankroll,n,win_count,avg_buy_ratio,style_tag,style_text,completed_at"
      )
      .eq("mode", "daily")
      .eq("date_key", dateKey)
      .eq("completed", true)
      .order("total_return_pct", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      date_key: dateKey,
      leaderboard: data ?? [],
    });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
