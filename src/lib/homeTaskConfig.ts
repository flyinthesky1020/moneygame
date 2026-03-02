export type HomeTaskDefinition = {
  id: string;
  label: string;
  targetMode: "train" | "daily";
};

export const HOME_TASKS: HomeTaskDefinition[] = [
  { id: "finish-train-once", label: "完成一次练习模式", targetMode: "train" },
  { id: "profit-any-mode-once", label: "在任意模式中完成一次盈利", targetMode: "train" },
  { id: "finish-daily-once", label: "完成一次每日挑战", targetMode: "daily" },
  { id: "finish-without-loss-day", label: "没有任何一天亏损的情况下完成任意模式", targetMode: "train" },
  { id: "daily-return-over-ten", label: "每日挑战模式下收益 > 10%", targetMode: "daily" },
  { id: "five-train-wins-in-row", label: "连续 5 次练习模式取得盈利", targetMode: "train" },
  { id: "five-daily-wins-in-row", label: "连续 5 次每日挑战模式盈利", targetMode: "daily" },
];
