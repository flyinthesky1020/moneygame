# 韭皇养成计划（H5 MVP Skeleton）

## 项目简介
这是一个虚拟股票交易游戏的 H5 项目骨架，用于快速搭建前端结构与依赖。

## 当前阶段说明
当前已完成 MVP 后端 API + 前端核心页面联调（首页启动、做题、结算、结果页、排行榜、分享海报），并进入正式上线前体验收敛阶段，可进行端到端演示。
当前版本：`1.6.1`（新增首页对话引导层与跨页面背景统一）。

## 快速接手索引（新会话优先看这里）
### 1) 当前状态（2026-03-08）
- 模式名称（做题页）：`韭皇练习场`（train）/ `韭皇竞技场`（daily）。
- 站点页面名称已更新为：`韭皇养成计划`（`src/app/layout.tsx` metadata）。
- 做题页仅保留主标题（`韭皇练习场 / 韭皇竞技场`），已移除主标题下的小字文案。
- 做题页顶部指标（进度/总资产/收益率）手机端保持同一行。
- 做题页背景色与首页一致：`rgb(242, 231, 211)`（`body.play-mode-body`）。
- 做题页手机端答题按钮（`买入 / 暂且不动`）已改为底部吸附 Bar，适配不同机型与安全区。
- 做题页除底部答题 Bar 外，主内容区整体下移 `20px`（练习场/竞技场一致）。
- 每次开启新 run（`daily/train`）进入第一题时，会在买入按钮上方自动弹出“全仓买入并持有 1 天自动卖出”的提示气泡。
- 结果页背景色与分享页外底一致，采用浅米色纯色底。
- 做题按钮：`买入`（红）/ `暂且不动`（深蓝）。
- 涨跌颜色统一规则：`涨红跌绿`（做题页反馈、K线、成交量、MACD、结算海报均已同步）。
- 图表区：
  - 上图：价格K线 + MA7/MA30。
  - 下图：可切换 `成交量 / MACD / KDJ`（无第三张图）。
- 每题反馈弹窗：
  - 标题直接展示 `ROUND_RETURN_PCT_RULES` 命中文案；
  - 显示本次收益、当日振幅、连击文案；
  - 特殊成就无解锁时不显示该行。
- 最后一题完成后：
  - 用户必须填写昵称后才能结算；
  - 昵称会用于结算页与分享海报。
- 结果页/分享图：
  - 页面左上角提供极简返回主页按钮；
  - 分享图为手写卡片风，支持一键分享；
  - 左下角展示昵称、日期与扫码引导文案；
  - 右下角展示二维码（当前指向 `chivesgame.com`）；
  - 结算按钮文案已改为“分享战绩”，优先触发系统分享；微信环境会尝试调用分享接口，受环境限制时给出右上角菜单引导；
  - 图表下方文案按收益结果从三组配置文案中稳定随机；
  - 文案作者在文案末行下方右对齐显示；
  - 右上角勋章按总收益率分为 5 档：`技术的神 / 盈利者 / 平淡是福 / 亏损者 / 你就是韭皇`。
- 首页：
  - 采用 `390x844` 固定舞台等比缩放，保证不同手机机型完整显示全部元素；
  - 首页舞台圆角已移除，避免在部分手机出现黑色边角；
  - 首页调试悬浮按钮（Debug）已移除，保持上线页面纯净；
  - 新增前置引导层（全屏交互式对话），默认分三轮逐条出现（每条约 0.5s）；
  - 引导层对话中“你”名称在左侧，“韭皇”名称在右侧；
  - 引导推进按钮固定在底部，最后阶段显示“轻触页面进入韭皇模拟器”；
  - 最后一阶段点击引导页任意区域会进入首页，并使用统一加载动画过渡；
  - 引导已加入本地标记（`home_intro_seen:v1`），首次进入后返回首页将直接跳过引导；
  - 右侧三个入口按钮已改为纯 CSS 手绘纸质按钮，不再依赖按钮素材图；
  - `character_daily` 增加轻微呼吸/漂浮动效；
  - `leaderboard` 区域可点击进入排行榜页面；
  - `leaderboard` 木牌上方展示当日榜单前三名的纯文字摘要（排名 / 学者昵称 / 收益率）；
  - 新增“当前任务”模块，任务串行发布，进度缓存到本地存储；
  - 当前任务模块支持点击诱导动效，点击后会按任务目标模式进入 `练习模式` 或 `每日挑战`；
  - `韭皇练习场 / 我的成绩 / 制作团队` 三个按钮的点击优先级为首页最高。
- 每日挑战：
  - `daily` 模式现在允许同一天多次游玩与多次完成；
  - 每次完成 `daily` 的结果都会进入当日榜单；
  - 榜单按当日 `daily` 完成记录的收益率排序，展示前 100 条记录。
- 排行榜：
  - 排行榜页面改为首页同风格的手绘视觉；
  - 展示数据库中当日每日挑战收益率最高的前 100 条记录；
  - 列名已调整为“匿名玩家昵称”，每名玩家仍会稳定映射一个随机学者别名；
  - 金融学者昵称库共 1000 个，不重复。
  - 底部固定 Bar 新增“我”的当日排名摘要；无成绩时默认显示 `#999+ / 无 / 无`。
- 制作团队：
  - `credits` 页面已替换为正式介绍文案；
  - 页面风格与首页/排行榜统一；
  - 已接入二维码素材：`public/assets/erweima.webp`。
- 页面背景统一：
  - `我的成绩 / 排行榜 / 制作团队` 三页背景已统一为首页同款纯色底（`rgb(242, 231, 211)`）；
  - 通过 `body.home-like-body` 统一管理，避免内容区渐变与全屏底色不一致。
- 我的成绩：
  - 展示当前本地缓存的历史成绩记录；
  - 每条记录显示两行：
    - 第一行：昵称、模式、结算时间（精确到分钟）
    - 第二行：收益率、盈利天数、亏损天数、未开仓天数
- 交互文案配置：
  - 每题反馈规则与文案：`/Users/haitao/Documents/Newproject/src/lib/playRoundFeedback.ts`
  - 分享图随机文案与作者：`/Users/haitao/Documents/Newproject/src/lib/sharePosterQuotes.ts`
  - 首页任务配置：`/Users/haitao/Documents/Newproject/src/lib/homeTaskConfig.ts`
  - 首页任务缓存与进度计算：`/Users/haitao/Documents/Newproject/src/lib/homeTaskProgress.ts`
  - 排行榜金融学者昵称配置：`/Users/haitao/Documents/Newproject/src/lib/financeScholarNames.ts`
  - 我的成绩历史缓存：`/Users/haitao/Documents/Newproject/src/lib/scoreHistory.ts`

### 2) 素材路径速查
- 首页素材目录：`/Users/haitao/Documents/Newproject/public/assets`
- 首页必需素材：
  - `title_block.webp`
  - `character_daily.webp`
  - `leaderboard.webp`
  - `btn_training.webp`
  - `btn_record.webp`
  - `btn_team.webp`

### 3) 关键文件速查
- 首页舞台与交互：`/Users/haitao/Documents/Newproject/src/app/page.tsx`
- 首页图层坐标：`/Users/haitao/Documents/Newproject/src/app/page.module.css`
- 排行榜页面：`/Users/haitao/Documents/Newproject/src/app/leaderboard/page.tsx`
- 排行榜页面样式：`/Users/haitao/Documents/Newproject/src/app/leaderboard/page.module.css`
- 我的成绩页面：`/Users/haitao/Documents/Newproject/src/app/profile/page.tsx`
- 我的成绩页面样式：`/Users/haitao/Documents/Newproject/src/app/profile/page.module.css`
- 做题页状态机：`/Users/haitao/Documents/Newproject/src/app/play/PlayClient.tsx`
- K线/指标图组件：`/Users/haitao/Documents/Newproject/src/components/CandlestickWithVolume.tsx`
- 返回主页按钮：`/Users/haitao/Documents/Newproject/src/components/HomeBackButton.tsx`
- 结算分享海报组件：`/Users/haitao/Documents/Newproject/src/components/SharePosterCanvas.tsx`
- 全局样式：`/Users/haitao/Documents/Newproject/src/app/globals.css`
- 后端核心 API：
  - `/Users/haitao/Documents/Newproject/src/app/api/run/start/route.ts`
  - `/Users/haitao/Documents/Newproject/src/app/api/run/answer/route.ts`
  - `/Users/haitao/Documents/Newproject/src/app/api/run/finish/route.ts`
  - `/Users/haitao/Documents/Newproject/src/app/api/leaderboard/route.ts`

## 技术栈
- Next.js（App Router）+ TypeScript
- Supabase JS Client
- TradingView Lightweight Charts
- Chart.js

## 项目目录结构说明
```
/Users/haitao/Documents/Newproject
├── public
│   └── assets
│       ├── btn_record.webp
│       ├── btn_team.webp
│       ├── btn_training.webp
│       ├── character_daily.webp
│       ├── erweima.webp
│       ├── leaderboard.webp
│       └── title_block.webp
├── .env.example
├── .env.local
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── tsconfig.json
└── src
    ├── app
    │   ├── api
    │   │   ├── leaderboard
    │   │   │   └── route.ts
    │   │   └── run
    │   │       ├── [runId]
    │   │       │   └── route.ts
    │   │       ├── answer
    │   │       │   └── route.ts
    │   │       ├── finish
    │   │       │   └── route.ts
    │   │       └── start
    │   │           └── route.ts
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.module.css
    │   ├── page.tsx
    │   ├── credits
    │   │   ├── page.module.css
    │   │   └── page.tsx
    │   ├── daily
    │   │   └── page.tsx
    │   ├── profile
    │   │   └── page.tsx
    │   ├── play
    │   │   ├── PlayClient.tsx
    │   │   └── page.tsx
    │   ├── record
    │   │   └── page.tsx
    │   ├── team
    │   │   └── page.tsx
    │   ├── train
    │   │   └── page.tsx
    │   ├── leaderboard
    │   │   └── page.tsx
    │   └── result
    │       └── [runId]
    │           └── page.tsx
    ├── components
    │   ├── BuyRatioSelector.tsx
    │   ├── CandlestickWithVolume.tsx
    │   ├── ProfitCurveChart.tsx
    │   ├── SharePosterCanvas.tsx
    │   └── StyleCommentCard.tsx
    └── lib
        ├── dateKey.ts
        ├── gameMath.ts
        ├── styleEngine.ts
        ├── supabaseClient.ts
        └── supabaseServer.ts
```

## 项目状态压缩

### 1) 项目目标
- 实现一个虚拟交易游戏 MVP（train / daily 两种模式）。
- 题目数据来源于 Supabase `questions`，每题 61 根 K 线。
- 严格执行安全规则：
  - 前端最多拿到前 60 根 K 线。
  - 收益必须后端计算（使用第 60 与第 61 根 close）。
  - daily 允许重复游玩，且每次完成结果都可参与当日榜单排序。

### 2) 当前架构
- 前端：Next.js App Router 页面 + Client Component 状态机（首页启动 run，play 逐题交互，result 展示结算）。
- 后端：Next.js Route Handlers 提供业务 API。
- 数据层：Supabase（`questions` / `runs` / `run_answers` / `daily_user_sets`）。
- 身份：匿名 `user_id`（cookie 持久化）。
- 领域工具层：
  - `src/lib/dateKey.ts`：Asia/Singapore 日期 key 生成。
  - `src/lib/gameMath.ts`：收益计算、曲线与汇总。
  - `src/lib/styleEngine.ts`：结算风格评语生成。
  - `src/lib/homeTaskProgress.ts`：首页任务进度缓存与解析。
  - `src/lib/financeScholarNames.ts`：排行榜昵称池与稳定随机映射。
  - `src/lib/scoreHistory.ts`：我的成绩历史缓存。

### 3) 已完成模块
- API 路由：
  - `POST /api/run/start`
  - `POST /api/run/answer`
  - `POST /api/run/finish`
  - `GET /api/run/[runId]`
  - `GET /api/leaderboard`
- `start`：
  - mode 校验（train=10题 / daily=50题）
  - 匿名 `user_id` cookie 自动生成与写入
  - 返回题目仅含 `candles[0..59]`
- `answer`：
  - run 状态校验（存在、归属用户、未完成）
  - 防重复答题校验（同 run+question）
  - 后端按 `candles[59].c` 与 `candles[60].c` 计算收益
  - 写入累计收益与答题序号
- `finish`：
  - 聚合 run_answers（n、total_profit、return_pct、curve、win_count、avg_buy_ratio）
  - 生成 `style_tag/style_text`
  - 更新 runs 为完成态
  - daily 完成后允许继续重复游玩
  - 仍会写入 `daily_user_sets`，供后续按天归档或扩展使用
  - 前端会把昵称、收益率、盈利天数、亏损天数、未开仓天数缓存到本地成绩历史
- `leaderboard`：
  - 默认读取新加坡当日榜单
  - 从 `daily completed` 记录中按 `total_return_pct desc` 排序
  - 不按 `user_id` 去重
  - 返回前 100 条记录
- 前端联调：
  - 首页改为 390x844 固定舞台（图层绝对定位 + 统一缩放）以实现像素级还原
  - 首页图层素材：`title_block.webp`、`character_daily.webp`、`leaderboard.webp`
  - 首页热点：点击角色区或“今日挑战”竖牌均触发 `enterDaily()`，并执行转场动画后进入 `/daily`
  - 首页点击 `leaderboard` 区域可进入 `/leaderboard`
  - 首页 `leaderboard` 木牌上方展示当日榜单前三名
  - 首页当前任务模块支持点击动效与模式跳转
  - 首页按钮跳转：`韭皇练习场 -> /train`、`我的成绩 -> /record`、`制作团队 -> /team`
  - 路由映射：`/daily -> /play?mode=daily`、`/train -> /play?mode=train`、`/record -> /profile`、`/team -> /credits`
  - `play` 页完成价格K线主图 + 指标副图（支持 `成交量 / MACD / KDJ` 切换）渲染
  - `play` 页与结算页采用统一涨跌配色：`涨红跌绿`
  - `play` 页答题为二选一：`买入` 与 `暂且不动`，无默认选中，点击即提交
  - `play` 页手机端答题按钮吸附在底部 Bar（适配安全区与不同机型）
  - `play` 页顶部显示进度、当前总资产、当前收益率
  - `play` 页模式标题：`韭皇练习场` / `韭皇竞技场`（手写风），已移除标题下小字
  - 最后一题后要求输入昵称，再调用 `finish` 并跳转 `result/[runId]`
  - `result` 页展示手写风结算海报；结算按钮为“分享战绩”，优先走系统分享，回退下载
  - `result` 页左上角提供返回主页按钮
  - `leaderboard` 页调用 `/api/leaderboard` 展示当日 Top100（按记录排序，不按用户去重）
  - 排行榜玩家名使用稳定随机金融学者昵称映射
  - `profile` 页读取本地缓存历史成绩，按条展示两行摘要
  - `result` 页支持 Canvas 生成分享海报并在浏览器下载/系统分享（不上传存储）

### 4) 未解决问题
- 目前使用 Supabase 匿名公钥直连表，尚未配置 RLS 与更细粒度权限控制。
- 题目分配与 run 关系目前由前端携带 `question_id` 回传，未在后端做“run 专属题单”强绑定。
- 并发极端场景下，`answer` 的顺序号与累计值依赖读后写，后续可考虑事务/RPC 强化。

### 5) 待办列表
- 前端：
  - 补充异常交互（断线重试、重复提交提示）
  - 海报样式模板扩展（主题切换、二维码链接切换、插画素材优化）
- 数据与安全：
  - 上线 RLS 策略与 service role 分层
  - 为 `run_answers(run_id, question_id)` 增加唯一约束（若未加）
  - 将“run 题单”持久化，服务端强校验 question 是否属于该 run
- 工程化：
  - 增加 API 集成测试与关键计算单测
  - 增加错误码规范与统一响应结构

### 6) 关键代码片段
```ts
// src/app/api/run/start/route.ts
// 强约束：前端只返回前60根K线
const questions = pickedIds
  .map((qid) => byId.get(qid))
  .filter(Boolean)
  .map((row) => ({
    question_id: row!.id,
    candles: (row!.candles ?? []).slice(0, 60),
  }));
```

```ts
// src/app/api/run/answer/route.ts
// 强约束：收益仅后端基于第60/61根close计算
const c0 = Number(candles?.[59]?.c);
const c1 = Number(candles?.[60]?.c);
const returnRatio = (c1 - c0) / c0;
const profit = bankrollBefore * buyRatio * returnRatio;
```

```ts
// src/lib/dateKey.ts
// 使用 Asia/Singapore 日期，不直接用服务器UTC切日
export function getSingaporeDateKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
```

## 本地运行方式
1. 安装 Node.js 20+。
2. 在 `/Users/haitao/Documents/Newproject` 目录执行 `npm install`。
3. 复制 `.env.example` 为 `.env.local` 并填写环境变量。
4. 启动开发服务器：`npm run dev`。

## 首页素材说明
- 首页使用固定图层素材，目录：`/Users/haitao/Documents/Newproject/public/assets`
- 必需文件：
  - `title_block.webp`
  - `character_daily.webp`
  - `leaderboard.webp`

## 首页像素调校指南（390x844 固定舞台）
- 舞台基准尺寸固定为 `390 x 844`，所有 `left/top/width/height` 都是该坐标系下的像素值。
- 桌面端仅做等比缩放（`scale`），不会重排；因此移动端看到的位置就是设计基准位置。
- 关键文件：
  - 布局与交互：`/Users/haitao/Documents/Newproject/src/app/page.tsx`
  - 图层与热区坐标：`/Users/haitao/Documents/Newproject/src/app/page.module.css`

### 当前图层坐标
- `.titleLayer`：`left: 30px; top: 64px; width: 330px; height: 168px;`
- `.characterLayer`：`left: 45px; top: 214px; width: 292px; height: 356px;`
- `.leaderboardLayer`：`left: -10px; top: 530px; width: 276px; height: 302px;`
- `.homePodiumLayer`：`left: 71px; top: 645px; width: 254px;`
- `.taskLayer`：`left: 50px; top: 530px; width: 250px; min-height: 42px;`
- `.trainingBtn`：`left: 250px; top: 600px; width: 136px; height: 56px;`
- `.recordBtn`：`left: 250px; top: 670px; width: 136px; height: 56px;`
- `.teamBtn`：`left: 250px; top: 740px; width: 136px; height: 56px;`

### 当前热区坐标（需与素材联动）
- `.characterHotspot`：`left: 52px; top: 248px; width: 230px; height: 318px;`
- `.leaderboardHotspot`：`left: -10px; top: 530px; width: 276px; height: 302px;`
- `.dailyTagHotspot`：`left: 289px; top: 395px; width: 57px; height: 151px;`

### 转场嘴部中心（需与角色素材联动）
- `page.tsx` 中常量：
  - `MOUTH_X = 196`
  - `MOUTH_Y = 408`
- 如果角色素材整体移动/缩放了，需同步更新这两个值，否则“张嘴圆形 + 缩放中心”会偏移。

### 如何调整素材尺寸并同步热区
1. 打开首页，先核对素材实际位置与点击命中是否一致（排行榜、角色、每日挑战竖牌、右侧三个按钮）。
2. 在 `page.module.css` 调整对应图层的 `left/top/width/height`，直到素材位置准确。
3. 调整 `characterHotspot`、`dailyTagHotspot`，让热区完整覆盖可点击区域。
4. 若角色嘴部位置变化，在 `page.tsx` 同步更新 `MOUTH_X/MOUTH_Y`。
5. 校验交互：
   - 点击角色区/今日挑战竖牌都应进入 `/daily`
   - 点击三个按钮分别跳转 `/train`、`/record`、`/team`
   - 转场期间不会重复触发（已内置防双击）

### 背景色约束（当前版本）
- 首页舞台背景为纯色：`rgb(242, 231, 211)`。
- 位置：`page.module.css` 的 `.bg`。

## 前端交互注意事项（最新）
- 首页任务模块：
  - 任务清单与顺序配置：`src/lib/homeTaskConfig.ts`
  - 本地缓存 key：`home_task_runs:v1`
  - 任务进度计算：`src/lib/homeTaskProgress.ts`
  - 点击入口样式与动画：`src/app/page.module.css` 中 `.taskButton`
- 排行榜随机昵称：
  - 配置文件：`src/lib/financeScholarNames.ts`
  - `SURNAMES` 与 `GIVEN_NAMES` 组合生成 `1000` 个不重复金融学者名称；
  - `FINANCE_SCHOLAR_NAMES` 为完整昵称池；
  - `pickScholarNames(dateKey, count)` 控制某一天榜单使用的昵称序列。
- 我的成绩历史：
  - 配置/缓存文件：`src/lib/scoreHistory.ts`
  - 本地缓存 key：`score_history:v1`
  - 页面展示文件：`src/app/profile/page.tsx`
- 做题页仅保留两个选择：`买入` 与 `暂且不动`。
- 做题页每题默认无选中态；点击任一选项即提交，不再需要“提交答案”确认按钮。
- 做题页手机端按钮区采用底部吸附 Bar（含 `safe-area-inset-bottom`）。
- 做题页顶部显示：进度、当前总资产、当前收益率（不再显示 mode）。
- 做题页已移除模式标题下的小字文案。
- 做题页背景色与首页一致：`rgb(242, 231, 211)`。
- 模式标题文案：
  - `train -> 韭皇练习场`
  - `daily -> 韭皇竞技场`
- 图表上下结构：
  - 上方：价格图（K线 + MA7 + MA30）
  - 下方：指标图（成交量 / MACD / KDJ 切换）
  - 上下图时间范围联动
- 每题反馈弹窗文案来源：
  - 连击与收益率区间规则：`src/lib/playRoundFeedback.ts`
  - 标题直接使用 `ROUND_RETURN_PCT_RULES` 命中文案

## 常见问题排查
- 若出现 `Cannot find module './331.js'`（或类似 chunk 缺失）：
  1. 停掉当前 dev 进程
  2. 删除构建缓存：`rm -rf .next`
  3. 重新启动：`npm run dev`
- 已内置快捷命令：`npm run dev:clean`（等价于清理 `.next` 后启动 dev）。
- 若仍异常，可先验证生产构建：`npm run build`，再重新执行 `npm run dev`。
- 若浏览器出现 `missing required error components, refreshing...`：
  1. 检查 `src/app/global-error.tsx` 是否存在
  2. 根级错误边界必须返回完整的 `html > body` 结构
  3. 补齐后重新执行 `npm run dev`
- 若浏览器显示首页或任意页面 `Internal Server Error`，但本地重新编译后又查不出问题：
  1. 先检查 `npm run dev` 启动日志里实际端口，是否因为 `3000` 被占用而自动切到 `3001/3002`
  2. 浏览器必须访问日志里显示的实际端口，例如 `http://localhost:3002`
  3. 若希望继续使用 `3000`，先停掉旧进程，再重新启动 dev 服务
  4. 可用 `lsof -nP -iTCP:3000 -sTCP:LISTEN` 查哪个进程占用了 `3000`
- 若点击 `/train` 或 `/daily` 入口时在 dev 模式下出现和 `NEXT_REDIRECT` 相关的异常：
  1. 避免在入口页直接使用服务端 `redirect()`
  2. 当前项目已改为客户端 `router.replace()` 跳到 `/play?mode=train` 或 `/play?mode=daily`
  3. 相关文件：`src/components/EntryRedirect.tsx`、`src/app/train/page.tsx`、`src/app/daily/page.tsx`
- 若 `npm run build` 卡在首页或做题页类型错误：
  1. 检查首页 `navigate()` 的联合类型是否覆盖实际跳转目标
  2. 检查 `PlayClient` 中 `FinishResponse` 是否包含 `date_key`
  3. 检查 `SharePosterCanvas` 里 `canvasRef.current` / `getContext()` 是否先收窄后再在异步函数里使用
- 若出现浏览器报错 `Failed to execute 'setItem' on 'Storage' ... exceeded the quota`：
  1. 打开浏览器控制台执行：`sessionStorage.clear()`
  2. 刷新页面并重新进入模式
  3. 若仍复现，优先检查是否在频繁开启新 run 且浏览器禁用了存储清理
- 若想快速验证当前改动是否有静态问题：
  1. 执行 `npm run lint`
  2. 必要时执行 `npm run build`

## 环境变量说明
- `NEXT_PUBLIC_SUPABASE_URL`：Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`：Supabase 匿名公钥

## 云服务器更新发布（阿里云 ECS + PM2 + Caddy）
以下流程用于你后续“本地改完代码后，把线上游戏更新到服务器”。

### 零、推荐改造：Push 到 GitHub 后自动发布到服务器
本仓库已新增工作流文件：`.github/workflows/deploy.yml`。  
当你 `push` 到 `main` 分支时，会自动在服务器执行：
- `git fetch --all && git reset --hard origin/main`
- `npm ci && npm run build`
- `pm2 restart game && pm2 save`
- 本地健康检查会自动重试，避免刚重启时端口未就绪导致误报失败

#### 第一步：在服务器上准备 GitHub Actions 专用 SSH 公钥
1. 在你的本地电脑执行（生成一对新密钥，专门给 GitHub Actions 用）：
```bash
ssh-keygen -t ed25519 -f ~/.ssh/game_deploy_github -C "github-actions-deploy"
```

2. 把公钥追加到服务器（可二选一）：
- 方式 A（推荐）：
```bash
ssh-copy-id -i ~/.ssh/game_deploy_github.pub root@8.166.136.17
```
- 方式 B（你也可以手动复制 `.pub` 内容，追加到服务器 `~/.ssh/authorized_keys`）

3. 验证新密钥可登录：
```bash
ssh -i ~/.ssh/game_deploy_github -p 22 root@8.166.136.17
```

#### 第二步：获取服务器 SSH 指纹（known_hosts）
在本地执行：
```bash
ssh-keyscan -p 22 8.166.136.17 2>/dev/null | grep -v '^#'
```
把输出的非注释行保存下来（推荐至少包含 `ssh-ed25519` 那一行），后面放进 GitHub Secret。

#### 第三步：在 GitHub 仓库配置 Secrets
进入 GitHub 仓库页面：`Settings -> Secrets and variables -> Actions -> New repository secret`，新增以下 5 个：

1. `ECS_HOST` = `8.166.136.17`
2. `ECS_PORT` = `22`
3. `ECS_USER` = `root`
4. `ECS_SSH_KEY_B64` = 私钥的 base64 单行内容（注意是单行，不是原始私钥文本）：
```bash
openssl base64 -A -in ~/.ssh/game_deploy_github
```
5. `ECS_KNOWN_HOSTS` = 上一步 `ssh-keyscan` 输出整行

#### 第四步：推送工作流并做首次验证
```bash
git add .github/workflows/deploy.yml README.md
git commit -m "ci: auto deploy to ecs on push main"
git push origin main
```

然后到 GitHub 仓库 `Actions` 页面查看 `Deploy Game To ECS` 是否成功。
- 直达地址：`https://github.com/flyinthesky1020/moneygame/actions`

#### 第五步：日常发布方式（以后就这样）
你只要正常开发并 push 到 `main`：
```bash
git add .
git commit -m "feat: your change"
git push origin main
```
GitHub 会自动把服务器更新到最新版本。

#### 第六步：常见失败与修复（按错误关键字查）
- `error in libcrypto` / `base64: invalid input`：
  - 原因：`ECS_SSH_KEY_B64` 内容格式错误（不是单行 base64）。
  - 修复：重新执行 `openssl base64 -A -in ~/.ssh/game_deploy_github`，完整复制到 `ECS_SSH_KEY_B64`。
- `Connection timed out during banner exchange`：
  - 原因：GitHub runner 无法访问服务器 22 端口。
  - 修复：在阿里云安全组和服务器防火墙放行 `22/tcp` 入站后重试。
- `curl: (7) Failed to connect to 127.0.0.1 port 3000`：
  - 原因：重启后服务尚未就绪或启动失败。
  - 修复：查看 Actions 中自动输出的 `pm2 status` / `pm2 logs game`，按日志排查。

### 一、前提（只需确认）
- 服务器目录：`/root/game`
- 进程管理：`pm2`，进程名：`game`
- 反向代理：`caddy`
- 线上域名：`chivesgame.com`

### 二、标准更新步骤（每次发布都按这个来）
1. 登录服务器：
```bash
ssh root@8.166.136.17
```

2. 进入项目并拉取最新代码：
```bash
cd /root/game
git fetch --all
git pull origin main
```

3. 安装依赖（仅当 `package.json` 或 lock 文件有变更时必须执行）：
```bash
npm ci
```

4. 生产构建：
```bash
npm run build
```

5. 用 PM2 重启线上服务：
```bash
pm2 restart game
pm2 save
pm2 status
```

6. 自检（必须）：
```bash
curl -I http://127.0.0.1:3000
curl -I http://chivesgame.com
curl -vk https://chivesgame.com
```

7. 浏览器实测：
- `https://chivesgame.com`
- 首页能打开、`/train` 和 `/daily` 能正常开始

### 三、常用运维命令
```bash
# 查看 PM2 日志
pm2 logs game --lines 100

# 查看 Caddy 状态
systemctl status caddy

# 查看 Caddy 最近日志
journalctl -u caddy -n 100 --no-pager

# 跟随 Caddy 实时日志
journalctl -u caddy -f
```

### 四、快速回滚（本次更新异常时）
```bash
cd /root/game
git log --oneline -n 5
git reset --hard <上一个可用提交SHA>
npm ci
npm run build
pm2 restart game
pm2 save
```

### 五、微信内打不开但 Safari 可打开（高频问题）
- 若出现微信内打不开、Safari 正常，优先检查中国内地站点合规（ICP备案/接入）与 DNS 生效状态。
- 先查域名解析：
```bash
dig chivesgame.com A +short @1.1.1.1
dig chivesgame.com A +short @8.8.8.8
```
- `Caddy` 日志里若出现 `NXDOMAIN`，说明公网 DNS 还未生效或配置未生效，先修复解析后再重启 `caddy`：
```bash
systemctl restart caddy
journalctl -u caddy -n 80 --no-pager
```

## 未来阶段约束（重要安全规则）
- 前端永远不能获得第 61 根 K 线数据。
- 所有收益计算必须在后端 API 中完成。
- daily 模式可重复游玩，当日榜单按完成记录直接排序展示前 100 条。
