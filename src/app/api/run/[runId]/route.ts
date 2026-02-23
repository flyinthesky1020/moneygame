import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

type Context = {
  params: Promise<{
    runId: string;
  }>;
};

export async function GET(_req: NextRequest, ctx: Context) {
  try {
    const { runId } = await ctx.params;
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("runs")
      .select(
        "id,user_id,mode,date_key,completed,n,total_profit,total_return_pct,final_bankroll,win_count,avg_buy_ratio,curve,style_tag,style_text,completed_at"
      )
      .eq("id", runId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ message: "Run not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
