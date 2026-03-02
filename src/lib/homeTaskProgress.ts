import { HOME_TASKS, type HomeTaskDefinition } from "@/lib/homeTaskConfig";

export type CachedRunRecord = {
  runId: string;
  mode: "train" | "daily";
  dateKey: string;
  completedAt: string;
  totalProfit: number;
  totalReturnPct: number;
  winDays: number;
  lossDays: number;
  idleDays: number;
};

export type CurrentHomeTask = {
  currentIndex: number;
  total: number;
  completed: boolean;
  task: HomeTaskDefinition | null;
};

const STORAGE_KEY = "home_task_runs:v1";

function parseCachedRecords(raw: string | null): CachedRunRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CachedRunRecord => {
      return Boolean(
        item &&
          typeof item.runId === "string" &&
          (item.mode === "train" || item.mode === "daily") &&
          typeof item.dateKey === "string" &&
          typeof item.completedAt === "string" &&
          typeof item.totalProfit === "number" &&
          typeof item.totalReturnPct === "number"
      );
    });
  } catch {
    return [];
  }
}

export function readCachedRunRecords(): CachedRunRecord[] {
  try {
    return parseCachedRecords(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

function writeCachedRunRecords(records: CachedRunRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore storage errors
  }
}

export function cacheCompletedRun(record: CachedRunRecord) {
  const current = readCachedRunRecords();
  const deduped = current.filter((item) => item.runId !== record.runId);
  deduped.push(record);
  deduped.sort((a, b) => {
    const timeDiff =
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.runId.localeCompare(b.runId);
  });
  writeCachedRunRecords(deduped);
}

function hasConsecutiveProfits(
  records: CachedRunRecord[],
  mode: CachedRunRecord["mode"],
  streakTarget: number
) {
  let streak = 0;
  for (const record of records) {
    if (record.mode !== mode) continue;
    if (record.totalProfit > 0) {
      streak += 1;
      if (streak >= streakTarget) return true;
      continue;
    }
    streak = 0;
  }
  return false;
}

function isTaskComplete(taskId: string, records: CachedRunRecord[]) {
  switch (taskId) {
    case "finish-train-once":
      return records.some((record) => record.mode === "train");
    case "profit-any-mode-once":
      return records.some((record) => record.totalProfit > 0);
    case "finish-daily-once":
      return records.some((record) => record.mode === "daily");
    case "finish-without-loss-day":
      return records.some((record) => record.lossDays === 0);
    case "daily-return-over-ten":
      return records.some(
        (record) => record.mode === "daily" && record.totalReturnPct > 0.1
      );
    case "five-train-wins-in-row":
      return hasConsecutiveProfits(records, "train", 5);
    case "five-daily-wins-in-row":
      return hasConsecutiveProfits(records, "daily", 5);
    default:
      return false;
  }
}

export function resolveCurrentHomeTask(
  records: CachedRunRecord[]
): CurrentHomeTask {
  for (let index = 0; index < HOME_TASKS.length; index += 1) {
    const task = HOME_TASKS[index];
    if (!isTaskComplete(task.id, records)) {
      return {
        currentIndex: index + 1,
        total: HOME_TASKS.length,
        completed: false,
        task,
      };
    }
  }

  return {
    currentIndex: HOME_TASKS.length,
    total: HOME_TASKS.length,
    completed: true,
    task: null,
  };
}
