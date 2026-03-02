import { NextRequest, NextResponse } from "next/server";
import { getSingaporeDateKey } from "@/lib/dateKey";
import { START_BANKROLL } from "@/lib/gameMath";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

type Mode = "train" | "daily";

function isMode(value: unknown): value is Mode {
  return value === "train" || value === "daily";
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function sampleIds(ids: string[], count: number): string[] {
  const arr = [...ids];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

type Candle = {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

type QuestionRow = {
  id: string;
  candles: Candle[];
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const mode = body?.mode;
    if (!isMode(mode)) {
      return NextResponse.json(
        { message: "Invalid mode, should be train|daily" },
        { status: 400 }
      );
    }

    let userId = req.cookies.get("user_id")?.value ?? "";
    let needSetCookie = false;
    if (!isUuid(userId)) {
      userId = crypto.randomUUID();
      needSetCookie = true;
    }

    const supabase = getSupabaseServerClient();
    const dateKey = getSingaporeDateKey();

    const questionCount = mode === "daily" ? 50 : 10;
    const { data: allQuestionIds, error: idsErr } = await supabase
      .from("questions")
      .select("id");

    if (idsErr) {
      return NextResponse.json({ message: idsErr.message }, { status: 500 });
    }

    const idList = (allQuestionIds ?? []).map((q) => q.id as string);
    if (idList.length < questionCount) {
      return NextResponse.json(
        { message: `Not enough questions. Need ${questionCount}.` },
        { status: 400 }
      );
    }

    const pickedIds = sampleIds(idList, questionCount);
    const { data: pickedRows, error: pickErr } = await supabase
      .from("questions")
      .select("id,candles")
      .in("id", pickedIds);

    if (pickErr) {
      return NextResponse.json({ message: pickErr.message }, { status: 500 });
    }

    const byId = new Map<string, QuestionRow>();
    (pickedRows as QuestionRow[]).forEach((row) => byId.set(row.id, row));

    const questions = pickedIds
      .map((qid) => byId.get(qid))
      .filter(Boolean)
      .map((row) => {
        const candles = Array.isArray(row!.candles) ? row!.candles : [];
        return {
          question_id: row!.id,
          candles: candles.slice(0, 60),
        };
      });

    const { data: createdRun, error: createErr } = await supabase
      .from("runs")
      .insert({
        user_id: userId,
        mode,
        date_key: dateKey,
        start_bankroll: START_BANKROLL,
        completed: false,
      })
      .select("id")
      .single();

    if (createErr) {
      return NextResponse.json({ message: createErr.message }, { status: 500 });
    }

    const res = NextResponse.json({
      run_id: createdRun.id,
      mode,
      date_key: dateKey,
      questions,
    });

    if (needSetCookie) {
      res.cookies.set("user_id", userId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365 * 2,
      });
    }

    return res;
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
