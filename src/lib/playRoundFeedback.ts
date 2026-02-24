type Rule = {
  min?: number;
  max?: number;
  text: string;
};

type ResolveCommentInput = {
  profitHistory: number[];
  roundReturnPct: number;
};

type RoundFeedbackText = {
  streakText: string;
  returnText: string;
};

const POSITIVE_STREAK_RULES: Rule[] = [
  { min: 1, max: 1, text: "你开始盈利了～这是个好的开始，不是吗？" },
  { min: 2, max: 2, text: "盈利的第2天，这没什么了不起的，哪怕是只猴子也有可能碰运气蒙对。" },
  { min: 3, max: 3, text: "盈利的第3天，自信心开始膨胀" },
  { min: 4, max: 4, text: "连续4天盈利了，你是不是开始怀疑自己是巴菲特了？" },
  { min: 5, text: "梭哈，梭哈，梭哈，你是镰刀，不是韭神！" },
];

const NEGATIVE_STREAK_RULES: Rule[] = [
  { min: 1, max: 1, text: "亏损嘛，很常见" },
  { min: 2, max: 3, text: "这场面我们见惯了，不亏不习惯" },
  { min: 4, max: 4, text: "你是不是开始找未成年退款的按钮了？" },
  { min: 5, text: "韭神！请上座！" },
];

const ZERO_STREAK_RULES: Rule[] = [
  { min: 1, max: 2, text: "时机不好时空仓，是一种良好的美德" },
  { min: 3, max: 4, text: "你是不是空仓时间有点多了，其实也不用这么谨慎" },
  { min: 5, text: "你！离开这片韭菜园！你根本不是韭菜！" },
];

const ROUND_RETURN_PCT_RULES: Rule[] = [
  { max: -5, text: "你好像遇到了亿点点亏损" },
  { min: -5, max: -1, text: "亏点小钱，下次再来～" },
  { min: -1, max: -0.01, text: "你开始怀疑今天是不是没有开盘" },
  { min: -0.01, max: 0.01, text: "没有波动也是一种胜利" },
  { min: 0.01, max: 1, text: "你开始怀疑今天是不是没有开盘" },
  { min: 1, max: 5, text: "小赚～小赚～" },
  { min: 5, text: "运气，也是实力的一种" },
];

export const ACHIEVEMENT_PLACEHOLDER_TEXT = "暂无（后续版本开放）";

function getProfitSign(value: number): "positive" | "negative" | "zero" {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "zero";
}

function calcCurrentStreak(history: number[]) {
  if (history.length === 0) {
    return { positiveStreak: 0, negativeStreak: 0, zeroStreak: 0 };
  }

  const lastSign = getProfitSign(history[history.length - 1]);
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (getProfitSign(history[i]) !== lastSign) break;
    streak += 1;
  }

  return {
    positiveStreak: lastSign === "positive" ? streak : 0,
    negativeStreak: lastSign === "negative" ? streak : 0,
    zeroStreak: lastSign === "zero" ? streak : 0,
  };
}

function inRange(value: number, rule: Rule): boolean {
  const minOk = rule.min === undefined || value >= rule.min;
  const maxOk = rule.max === undefined || value <= rule.max;
  return minOk && maxOk;
}

function findRuleText(rules: Rule[], value: number): string {
  return rules.find((rule) => inRange(value, rule))?.text ?? "";
}

export function resolveRoundComment({
  profitHistory,
  roundReturnPct,
}: ResolveCommentInput): string {
  const detail = resolveRoundFeedbackText({ profitHistory, roundReturnPct });
  return [detail.streakText, detail.returnText].filter(Boolean).join(" ");
}

export function resolveRoundFeedbackText({
  profitHistory,
  roundReturnPct,
}: ResolveCommentInput): RoundFeedbackText {
  const { positiveStreak, negativeStreak, zeroStreak } = calcCurrentStreak(profitHistory);

  const streakText = positiveStreak
    ? findRuleText(POSITIVE_STREAK_RULES, positiveStreak)
    : negativeStreak
      ? findRuleText(NEGATIVE_STREAK_RULES, negativeStreak)
      : findRuleText(ZERO_STREAK_RULES, zeroStreak);

  const returnText = findRuleText(ROUND_RETURN_PCT_RULES, roundReturnPct);
  return { streakText, returnText };
}

export {
  NEGATIVE_STREAK_RULES,
  POSITIVE_STREAK_RULES,
  ROUND_RETURN_PCT_RULES,
  ZERO_STREAK_RULES,
};
