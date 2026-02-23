type StyleInput = {
  totalReturnPct: number;
  winCount: number;
  n: number;
  avgBuyRatio: number;
};

export function generateStyle(input: StyleInput) {
  const { totalReturnPct, winCount, n, avgBuyRatio } = input;
  const winRate = n > 0 ? winCount / n : 0;

  let styleTag = "稳健观察者";
  if (totalReturnPct >= 0.12) styleTag = "趋势猎手";
  else if (totalReturnPct >= 0.05) styleTag = "节奏掌控者";
  else if (totalReturnPct <= -0.08) styleTag = "逆风修行者";
  else if (totalReturnPct < 0) styleTag = "波动体验官";

  const styleText = `本局收益率 ${(totalReturnPct * 100).toFixed(
    2
  )}% ，胜率 ${(winRate * 100).toFixed(1)}% ，平均仓位 ${(
    avgBuyRatio * 100
  ).toFixed(1)}% 。你的交易风格偏向「${styleTag}」。`;

  return {
    style_tag: styleTag,
    style_text: styleText,
  };
}
