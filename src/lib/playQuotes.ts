const PLAY_QUOTES = [
  "不要急！是技术性回调！",
  "看不懂就不出手，空仓也是仓位。",
  "合并不好",
  "随便",
];

export function pickRandomPlayQuote(): string {
  const idx = Math.floor(Math.random() * PLAY_QUOTES.length);
  return PLAY_QUOTES[idx];
}

export { PLAY_QUOTES };
