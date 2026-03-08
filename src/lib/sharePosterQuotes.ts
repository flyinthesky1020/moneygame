export type SharePosterQuote = {
  text: string;
  author: string;
};

const SHARE_POSTER_UP_QUOTES: SharePosterQuote[] = [
  { text: "技术指标刚学会，金叉一现就梭哈，居然真涨了！原来我也能靠技术吃饭，感动哭了！", author: "小天" },
  { text: "跟风买了大佬说的票，睡醒一看涨停了！啥也不懂就赚钱，这运气不买彩票可惜了！", author: "小天" },
  { text: "盯盘三小时眼睛快瞎了，终于等到拉升瞬间卖出，赚了两百块外卖钱，知识变现成功！", author: "小天" },
  { text: "群里消息说这支要涨，半信半疑买了点，结果真红了！原来韭菜也有春天，泪目！", author: "小天" },
  { text: "昨天割肉今天买回，做T成功成本降了一块！虽然只赚几十块，但感觉自己像操盘手！", author: "小天" },
  { text: "新手光环果然存在！第一笔交易就赚钱，这市场也没那么难嘛，准备辞职全职炒了！", author: "小天" },
  { text: "抄了邻居大爷的底，他套半年我赚三天！姜还是老的辣，但韭菜新芽也能喝口汤！", author: "小天" },
  { text: "误打误撞买了热点概念，晚上出利好涨停！这运气买基金得亏死，炒股才能暴富！", author: "小天" },
  { text: "终于不是高买低卖了！这次低买高卖成功，虽然只赚个奶茶钱，但韭菜逆袭了！", author: "小天" },
];

const SHARE_POSTER_DOWN_QUOTES: SharePosterQuote[] = [
  { text: "K线向上我冲锋，K线向下我装死，横批：明天一定回本。", author: "小天" },
  { text: "别人恐惧我贪婪，别人贪婪我割肉，主打一个逆向思维，反向致富。", author: "小天" },
  { text: "技术指标全看涨，买入就绿给你看，原来我是反向指标本人。", author: "小天" },
  { text: "追涨杀跌一气呵成，账户余额一泻千里，这手速不去打电竞可惜了。", author: "小天" },
  { text: "MACD金叉我梭哈，死叉我装瞎，眼睛一闭就是长期持有。", author: "小天" },
  { text: "早盘追高笑嘻嘻，尾盘跳水哭唧唧，一天体验完整个人生。", author: "小天" },
  { text: "止损设了10个点，跌到9个点我改止损，跌到20个点我改信仰。", author: "小天" },
  { text: "研究了三小时财报，不如隔壁大爷一句听说要涨，知识付费了属于是。", author: "小天" },
  { text: "满仓干进去，软件卡住了，再打开已经跌停，这网费太贵了。", author: "小天" },
  { text: "赢了会所嫩模，输了下海干活，结果天天在海边徘徊，潮起潮落都是我。", author: "小天" },
];

const SHARE_POSTER_FLAT_QUOTES: SharePosterQuote[] = [
  { text: "横有多长竖有多高，主力洗盘我装死，成本区死守不动，迟早给我一根大阳线！", author: "小天" },
  { text: "上下一分钱玩一天，主力你累不累？我反正躺平了，电费都不够手续费，爱咋咋地！", author: "小天" },
  { text: "箱体震荡一个月，高抛低吸做T降低成本，虽然没赚但也没亏，韭菜的自我修养！", author: "小天" },
  { text: "均线粘合选择方向，我赌向上突破！满仓干进去，错了就当长期股东，反正不割肉！", author: "小天" },
  { text: "成交量缩到地量，地量见地价懂不懂？主力比我有耐心？看谁先熬死谁！", author: "小天" },
  { text: "织布机行情持续中，红绿交替折磨人，打开账户一看，好家伙原地踏步一个月！", author: "小天" },
  { text: "平台整理蓄势待发，技术指标全部走平，这憋大招的感觉，突破那天必须满仓追！", author: "小天" },
  { text: "每天波动两个点，心脏不用坐过山车，虽然无聊但安全，横盘也是赚时间换空间！", author: "小天" },
  { text: "横盘中偷偷吸筹，成交量暴露主力行踪，等我察觉已经晚了，只能跟着喝汤！", author: "小天" },
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
