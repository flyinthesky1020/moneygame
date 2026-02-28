export type SharePosterQuote = {
  text: string;
  author: string;
};

const SHARE_POSTER_UP_QUOTES: SharePosterQuote[] = [
  { text: "傻逼恒生科技，还我钱来！我再也不投资了！大a救我！日日日日日日日！", author: "曾兆钰" },
];

const SHARE_POSTER_DOWN_QUOTES: SharePosterQuote[] = [
  { text: "傻逼恒生科技，还我钱来！我再也不投资了！大a救我！日日日日日日日！", author: "曾兆钰" },
];

const SHARE_POSTER_FLAT_QUOTES: SharePosterQuote[] = [
  { text: "傻逼恒生科技，还我钱来！我再也不投资了！大a救我！日日日日日日日！", author: "曾兆钰" },
];

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function pickSharePosterQuote(
  runId: string,
  totalProfit: number
): SharePosterQuote {
  const pool = totalProfit > 0
    ? SHARE_POSTER_UP_QUOTES
    : totalProfit < 0
      ? SHARE_POSTER_DOWN_QUOTES
      : SHARE_POSTER_FLAT_QUOTES;

  const seed = hashSeed(`${runId}:${totalProfit > 0 ? "up" : totalProfit < 0 ? "down" : "flat"}`);
  return pool[seed % pool.length];
}

export {
  SHARE_POSTER_UP_QUOTES,
  SHARE_POSTER_DOWN_QUOTES,
  SHARE_POSTER_FLAT_QUOTES,
};
