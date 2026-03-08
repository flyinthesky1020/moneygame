"use client";

import Image from "next/image";
import type { CSSProperties, MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FINANCE_SCHOLAR_NAMES, pickScholarNames } from "@/lib/financeScholarNames";
import { readCachedRunRecords, resolveCurrentHomeTask } from "@/lib/homeTaskProgress";
import styles from "./page.module.css";

const STAGE_WIDTH = 390;
const STAGE_HEIGHT = 844;
const MOUTH_X = 196;
const MOUTH_Y = 408;
const VIEWPORT_PADDING = 20;
const DIALOG_STEP_MS = 500;
const INTRO_SEEN_KEY = "home_intro_seen:v2";
const INTRO_ROUNDS = [
  [
    { speaker: "你", text: "我今年能赚多少？" },
    { speaker: "韭皇", text: "-30%" },
    { speaker: "你", text: "那世界第一交易的神呢？" },
    { speaker: "韭皇", text: "已经很久没有人这么称呼我了" },
  ],
  [
    { speaker: "你", text: "..." },
    { speaker: "你", text: "教练，我想学交易！" },
    { speaker: "韭皇", text: "好的，我给你创造了一个竞技场" },
  ],
  [
    { speaker: "你", text: "竞技场？" },
    {
      speaker: "韭皇",
      text: "没错，交易、判断，赚到就撤，欢迎来到市场...必须要有韭菜...市场才能...保持和平",
    },
  ],
] as const;

type HomeLeaderboardRow = {
  id: string;
  user_id: string;
  total_return_pct: number;
};

type HomeLeaderboardResponse = {
  date_key: string;
  leaderboard: HomeLeaderboardRow[];
};

export default function HomePage() {
  const router = useRouter();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [taskText, setTaskText] = useState("完成一次练习模式");
  const [taskTargetPath, setTaskTargetPath] = useState<"/play?mode=train" | "/play?mode=daily">("/play?mode=train");
  const [homeTopThree, setHomeTopThree] = useState<HomeLeaderboardRow[]>([]);
  const [leaderboardDateKey, setLeaderboardDateKey] = useState("default");
  const [showIntro, setShowIntro] = useState(true);
  const [introStep, setIntroStep] = useState(0);
  const [introVisibleCount, setIntroVisibleCount] = useState(0);
  const [introEntering, setIntroEntering] = useState(false);
  const [introHydrated, setIntroHydrated] = useState(false);
  const introVisibleRef = useRef(0);
  const introDialogListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.body.classList.add("home-mode-body");
    return () => document.body.classList.remove("home-mode-body");
  }, []);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(INTRO_SEEN_KEY) === "1";
      setShowIntro(!seen);
    } catch {
      setShowIntro(true);
    } finally {
      setIntroHydrated(true);
    }
  }, []);

  useEffect(() => {
    const updateScale = () => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const viewportWidth = viewport.clientWidth;
      const viewportHeight = viewport.clientHeight;
      const nextScale = Math.min(
        (viewportWidth - VIEWPORT_PADDING * 2) / STAGE_WIDTH,
        (viewportHeight - VIEWPORT_PADDING * 2) / STAGE_HEIGHT,
        1
      );
      setScale(Math.max(nextScale, 0.35));
    };

    updateScale();

    const resizeObserver = new ResizeObserver(() => updateScale());
    if (viewportRef.current) {
      resizeObserver.observe(viewportRef.current);
    }

    window.addEventListener("orientationchange", updateScale);
    window.visualViewport?.addEventListener("resize", updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("orientationchange", updateScale);
      window.visualViewport?.removeEventListener("resize", updateScale);
    };
  }, []);

  useEffect(() => {
    const syncTaskText = () => {
      const currentTask = resolveCurrentHomeTask(readCachedRunRecords());
      setTaskText(
        currentTask.completed
          ? "全部任务已完成"
          : currentTask.task?.label ?? ""
      );
      setTaskTargetPath(
        currentTask.task?.targetMode === "daily"
          ? "/play?mode=daily"
          : "/play?mode=train"
      );
    };

    syncTaskText();
    window.addEventListener("focus", syncTaskText);
    window.addEventListener("storage", syncTaskText);
    return () => {
      window.removeEventListener("focus", syncTaskText);
      window.removeEventListener("storage", syncTaskText);
    };
  }, []);

  useEffect(() => {
    let canceled = false;

    async function loadHomeLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard");
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.message ?? "加载首页榜单失败");
        }
        if (!canceled) {
          const payload = json as HomeLeaderboardResponse;
          setLeaderboardDateKey(payload.date_key || "default");
          setHomeTopThree((payload.leaderboard ?? []).slice(0, 3));
        }
      } catch {
        if (!canceled) {
          setHomeTopThree([]);
          setLeaderboardDateKey("default");
        }
      }
    }

    void loadHomeLeaderboard();
    return () => {
      canceled = true;
    };
  }, []);

  const stageStyle = useMemo(
    () =>
      ({
        "--runtime-scale": scale,
        transform: `scale(${scale})`,
      }) as CSSProperties,
    [scale]
  );
  const homeTopAliases = useMemo(
    () => pickScholarNames(leaderboardDateKey, 3),
    [leaderboardDateKey]
  );
  const introDialogs = useMemo(
    () => INTRO_ROUNDS.slice(0, introStep + 1).flat(),
    [introStep]
  );
  const introShownDialogs = useMemo(
    () => introDialogs.slice(0, introVisibleCount),
    [introDialogs, introVisibleCount]
  );
  const introRoundFinished = introVisibleCount >= introDialogs.length;

  useEffect(() => {
    if (!showIntro) return;
    let count = introVisibleRef.current;
    if (count >= introDialogs.length) return;
    const timer = window.setInterval(() => {
      count += 1;
      const next = Math.min(count, introDialogs.length);
      introVisibleRef.current = next;
      setIntroVisibleCount(next);
      if (count >= introDialogs.length) {
        window.clearInterval(timer);
      }
    }, DIALOG_STEP_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [introDialogs.length, showIntro]);

  useEffect(() => {
    if (!showIntro) return;
    const el = introDialogListRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [introShownDialogs.length, showIntro]);

  async function enterDaily() {
    if (transitioning || dailyLoading) return;
    setDailyLoading(true);
    router.push("/play?mode=daily");
  }

  function navigate(
    path:
      | "/play?mode=train"
      | "/play?mode=daily"
      | "/record"
      | "/team"
      | "/leaderboard"
  ) {
    if (transitioning || dailyLoading) return;
    router.push(path);
  }

  function handleIntroAdvance(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (!introRoundFinished) return;
    setIntroStep((prev) => Math.min(prev + 1, 2));
  }

  function handleIntroEnter() {
    if (introStep < 2 || !introRoundFinished || introEntering) return;
    setIntroEntering(true);
    window.setTimeout(() => {
      try {
        localStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {
        // ignore storage errors
      }
      setShowIntro(false);
      introVisibleRef.current = 0;
      setIntroVisibleCount(0);
      setIntroEntering(false);
    }, 450);
  }

  return (
    <div ref={viewportRef} className={styles.viewport}>
      <div
        className={`${styles.stageScale} ${transitioning ? styles.sink : ""}`}
        style={stageStyle}
      >
        <div
          className={styles.stage}
          style={{ transformOrigin: `${MOUTH_X}px ${MOUTH_Y}px` }}
        >
          <div className={styles.bg} />

          <div
            className={`${styles.layer} ${styles.titleLayer}`}
          >
            <Image
              src="/assets/title_block.webp"
              alt="title block"
              fill
              sizes="390px"
              priority
            />
          </div>

          <div
            className={`${styles.layer} ${styles.characterLayer}`}
          >
            <Image
              src="/assets/character_daily.webp"
              alt="character and daily tag"
              fill
              sizes="390px"
              priority
            />
          </div>

          <div
            className={`${styles.layer} ${styles.leaderboardLayer}`}
          >
            <Image
              src="/assets/leaderboard.webp"
              alt="leaderboard board"
              fill
              sizes="390px"
            />
          </div>

          {homeTopThree.length > 0 ? (
            <div
              className={`${styles.layer} ${styles.homePodiumLayer}`}
            >
              {homeTopThree.map((row, index) => (
                <div
                  key={row.id}
                  className={`${styles.homePodiumItem} ${styles[`homePodiumItem${index + 1}`]}`}
                >
                  <span className={styles.homePodiumRank}>#{index + 1}</span>
                  <span className={styles.homePodiumName}>
                    {homeTopAliases[index] ?? FINANCE_SCHOLAR_NAMES[index]}
                  </span>
                  <span className={styles.homePodiumReturn}>
                    {(row.total_return_pct * 100).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            className={`${styles.hotspot} ${styles.leaderboardHotspot}`}
            onClick={() => navigate("/leaderboard")}
            disabled={transitioning || dailyLoading}
            aria-label="进入排行榜"
          />

          <div
            className={`${styles.layer} ${styles.taskLayer}`}
          >
            <button
              type="button"
              className={styles.taskButton}
              onClick={() => navigate(taskTargetPath)}
              disabled={transitioning || dailyLoading}
              aria-label={`进入${taskTargetPath === "/play?mode=daily" ? "每日挑战" : "练习模式"}`}
            >
              <span className={styles.taskLabel}>当前任务</span>
              <p className={styles.taskText}>{taskText}</p>
            </button>
          </div>

          <button
            type="button"
            className={`${styles.menuBtn} ${styles.trainingBtn}`}
            onClick={() => navigate("/play?mode=train")}
            disabled={transitioning || dailyLoading}
            aria-label="训练模式"
          >
            <span className={styles.menuBtnInner}>
              <span className={styles.menuBtnKicker}>Practice</span>
              <span className={styles.menuBtnLabel}>韭皇练习场</span>
            </span>
          </button>

          <button
            type="button"
            className={`${styles.menuBtn} ${styles.recordBtn}`}
            onClick={() => navigate("/record")}
            disabled={transitioning || dailyLoading}
            aria-label="我的成绩"
          >
            <span className={styles.menuBtnInner}>
              <span className={styles.menuBtnKicker}>Record</span>
              <span className={styles.menuBtnLabel}>我的成绩</span>
            </span>
          </button>

          <button
            type="button"
            className={`${styles.menuBtn} ${styles.teamBtn}`}
            onClick={() => navigate("/team")}
            disabled={transitioning || dailyLoading}
            aria-label="制作团队"
          >
            <span className={styles.menuBtnInner}>
              <span className={styles.menuBtnKicker}>About</span>
              <span className={styles.menuBtnLabel}>制作团队</span>
            </span>
          </button>

          <button
            type="button"
            className={`${styles.hotspot} ${styles.characterHotspot}`}
            onClick={enterDaily}
            disabled={transitioning || dailyLoading}
            aria-label="进入今日挑战"
          />

          <button
            type="button"
            className={`${styles.hotspot} ${styles.dailyTagHotspot}`}
            onClick={enterDaily}
            disabled={transitioning || dailyLoading}
            aria-label="进入今日挑战"
          />

          {transitioning ? (
            <>
              <div
                className={styles.mouthPulse}
                style={{ left: MOUTH_X, top: MOUTH_Y }}
              />
              <div className={styles.fadeToBlack} />
            </>
          ) : null}
        </div>
      </div>
      {dailyLoading ? (
        <div className={styles.homeLoadingOverlay}>
          <div className="page-loader" role="status" aria-label="页面加载中">
            <span className="page-loader-spinner" />
          </div>
        </div>
      ) : null}
      {introHydrated && showIntro ? (
        <div
          className={styles.introOverlay}
          onClick={handleIntroEnter}
          role={introStep >= 2 && introRoundFinished ? "button" : undefined}
          tabIndex={introStep >= 2 && introRoundFinished ? 0 : -1}
        >
          {introEntering ? (
            <div className={styles.introLoading}>
              <div className="page-loader" role="status" aria-label="页面加载中">
                <span className="page-loader-spinner" />
              </div>
            </div>
          ) : (
            <section className={styles.introPanel}>
              <div ref={introDialogListRef} className={styles.introDialogList}>
                {introShownDialogs.map((dialog, index) => (
                  <div
                    key={`${dialog.speaker}-${index}`}
                    className={`${styles.introDialogItem} ${
                      dialog.speaker === "你" ? styles.introDialogYou : styles.introDialogKing
                    }`}
                  >
                    <span className={styles.introSpeaker}>{dialog.speaker}</span>
                    <span className={styles.introText}>{dialog.text}</span>
                  </div>
                ))}
              </div>
              <div className={styles.introBottomBar}>
                {introStep < 2 ? (
                  <button
                    type="button"
                    className={styles.introAdvanceBtn}
                    onClick={handleIntroAdvance}
                    disabled={!introRoundFinished}
                  >
                    ...
                  </button>
                ) : (
                  <p className={styles.introEnterHint}>轻触页面进入韭皇模拟器</p>
                )}
              </div>
            </section>
          )}
        </div>
      ) : null}
    </div>
  );
}
