export type ScoreHistoryRecord = {
  runId: string;
  nickname: string;
  mode: "train" | "daily";
  totalReturnPct: number;
  winDays: number;
  lossDays: number;
  idleDays: number;
  completedAt: string;
};

const STORAGE_KEY = "score_history:v1";

function parseRecords(raw: string | null): ScoreHistoryRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ScoreHistoryRecord => {
      return Boolean(
        item &&
          typeof item.runId === "string" &&
          typeof item.nickname === "string" &&
          (item.mode === "train" || item.mode === "daily") &&
          typeof item.totalReturnPct === "number" &&
          typeof item.winDays === "number" &&
          typeof item.lossDays === "number" &&
          typeof item.idleDays === "number" &&
          typeof item.completedAt === "string"
      );
    });
  } catch {
    return [];
  }
}

export function readScoreHistory(): ScoreHistoryRecord[] {
  try {
    return parseRecords(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function cacheScoreHistory(record: ScoreHistoryRecord) {
  const current = readScoreHistory().filter((item) => item.runId !== record.runId);
  current.push(record);
  current.sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // ignore storage errors
  }
}
