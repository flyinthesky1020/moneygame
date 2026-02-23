export const START_BANKROLL = 1_000_000;

export function calcReturnRatio(c0: number, c1: number): number {
  if (!Number.isFinite(c0) || !Number.isFinite(c1) || c0 === 0) {
    throw new Error("Invalid candle close values");
  }
  return (c1 - c0) / c0;
}

export function calcProfit(
  bankroll: number,
  buyRatio: number,
  returnRatio: number
): number {
  return bankroll * buyRatio * returnRatio;
}

export function toFixedNum(value: number, digits = 6): number {
  return Number(value.toFixed(digits));
}

export type RunAnswerRow = {
  index_in_run: number;
  buy_ratio: number;
  profit: number;
  cum_profit_after: number;
};

export function buildCurve(rows: RunAnswerRow[]): number[] {
  const sorted = [...rows].sort((a, b) => a.index_in_run - b.index_in_run);
  return [0, ...sorted.map((r) => r.cum_profit_after)];
}

export function summarizeRun(rows: RunAnswerRow[]) {
  if (rows.length === 0) {
    return {
      n: 0,
      totalProfit: 0,
      totalReturnPct: 0,
      finalBankroll: START_BANKROLL,
      winCount: 0,
      avgBuyRatio: 0,
      curve: [0],
    };
  }

  const sorted = [...rows].sort((a, b) => a.index_in_run - b.index_in_run);
  const totalProfit = sorted[sorted.length - 1].cum_profit_after;
  const n = sorted.length;
  const winCount = sorted.filter((r) => r.profit > 0).length;
  const avgBuyRatio =
    sorted.reduce((acc, cur) => acc + cur.buy_ratio, 0) / Math.max(1, n);

  return {
    n,
    totalProfit: toFixedNum(totalProfit),
    totalReturnPct: toFixedNum(totalProfit / START_BANKROLL),
    finalBankroll: toFixedNum(START_BANKROLL + totalProfit),
    winCount,
    avgBuyRatio: toFixedNum(avgBuyRatio),
    curve: buildCurve(sorted),
  };
}
