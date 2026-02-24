# H5 Virtual Trading Game (MVP Skeleton)

## 项目简介
这是一个虚拟股票交易游戏的 H5 项目骨架，用于快速搭建前端结构与依赖。

## 当前阶段说明
当前已完成 MVP 后端 API + 前端核心页面联调（首页启动、做题、结算、结果页、排行榜、海报下载），可进行端到端演示。

## 技术栈
- Next.js（App Router）+ TypeScript
- Supabase JS Client
- TradingView Lightweight Charts
- Chart.js

## 项目目录结构说明
```
/Users/haitao/Documents/Newproject
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
    │   ├── page.tsx
    │   ├── play
    │   │   ├── PlayClient.tsx
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
  - daily 同一用户同一天仅允许一次计榜完成记录。

### 2) 当前架构
- 前端：Next.js App Router 页面 + Client Component 状态机（首页启动 run，play 逐题交互，result 展示结算）。
- 后端：Next.js Route Handlers 提供业务 API。
- 数据层：Supabase（`questions` / `runs` / `run_answers` / `daily_user_sets`）。
- 身份：匿名 `user_id`（cookie 持久化）。
- 领域工具层：
  - `src/lib/dateKey.ts`：Asia/Singapore 日期 key 生成。
  - `src/lib/gameMath.ts`：收益计算、曲线与汇总。
  - `src/lib/styleEngine.ts`：结算风格评语生成。

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
  - daily 完成冲突检查（409 + existing_run_id）
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
  - daily 完成态再次兜底检查并写入 `daily_user_sets`
- `leaderboard`：
  - 按日期（默认新加坡今日）读取 daily completed 榜单
  - 按 `total_return_pct desc` 返回前 100
- 前端联调：
  - 首页两个按钮直接调用 `start` 启动 run
  - `play` 页完成价格K线主图 + 成交量副图（独立小图与独立纵轴）渲染
  - `play` 页答题改为二选一：`买入 / Buy` 与 `不买 / Hold`，无默认选中，点击即提交
  - `play` 页顶部显示进度、当前总资产、当前收益率
  - 最后一题后调用 `finish` 并跳转 `result/[runId]`
  - `result` 页展示收益曲线（Y 轴含 0）、收益率、总收益、评语
  - `leaderboard` 页调用 `/api/leaderboard` 展示 Top100（收益率、总收益、盈利题数）
  - `result` 页支持 Canvas 生成分享海报并在浏览器下载（不上传存储）

### 4) 未解决问题
- 目前使用 Supabase 匿名公钥直连表，尚未配置 RLS 与更细粒度权限控制。
- 题目分配与 run 关系目前由前端携带 `question_id` 回传，未在后端做“run 专属题单”强绑定。
- 并发极端场景下，`answer` 的顺序号与累计值依赖读后写，后续可考虑事务/RPC 强化。

### 5) 待办列表
- 前端：
  - 补充异常交互（断线重试、重复提交提示、daily 冲突提示优化）
  - 海报样式模板扩展（主题切换、二维码/链接样式优化）
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

## 前端交互注意事项（最新）
- 做题页仅保留两个选择：`买入 / Buy` 与 `不买 / Hold`。
- 做题页每题默认无选中态；点击任一选项即提交，不再需要“提交答案”确认按钮。
- 做题页顶部显示：进度、当前总资产、当前收益率（不再显示 mode）。
- K线与成交量已拆分为上下两个图：
  - 上方为价格K线主图
  - 下方为成交量副图（独立纵轴），并与主图时间范围联动

## 常见问题排查
- 若出现 `Cannot find module './331.js'`（或类似 chunk 缺失）：
  1. 停掉当前 dev 进程
  2. 删除构建缓存：`rm -rf .next`
  3. 重新启动：`npm run dev`
- 若仍异常，可先验证生产构建：`npm run build`，再重新执行 `npm run dev`。

## 环境变量说明
- `NEXT_PUBLIC_SUPABASE_URL`：Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`：Supabase 匿名公钥

## 未来阶段约束（重要安全规则）
- 前端永远不能获得第 61 根 K 线数据。
- 所有收益计算必须在后端 API 中完成。
- daily 模式每天只能计入榜单一次。
