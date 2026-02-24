"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const STAGE_WIDTH = 390;
const STAGE_HEIGHT = 844;
const MOUTH_X = 196;
const MOUTH_Y = 408;

export default function HomePage() {
  const router = useRouter();
  const [scale, setScale] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      const nextScale = Math.min(
        window.innerWidth / STAGE_WIDTH,
        window.innerHeight / STAGE_HEIGHT
      );
      setScale(nextScale);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "d") {
        setDebug((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const stageStyle = useMemo(
    () =>
      ({
        "--runtime-scale": scale,
        transform: `scale(${scale})`,
      }) as CSSProperties,
    [scale]
  );

  async function enterDaily() {
    if (transitioning) return;
    setTransitioning(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    router.push("/daily");
  }

  function navigate(path: "/train" | "/record" | "/team") {
    if (transitioning) return;
    router.push(path);
  }

  return (
    <div className={styles.viewport}>
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
            className={`${styles.layer} ${styles.titleLayer} ${
              debug ? styles.debug : ""
            }`}
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
            className={`${styles.layer} ${styles.characterLayer} ${
              debug ? styles.debug : ""
            }`}
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
            className={`${styles.layer} ${styles.leaderboardLayer} ${
              debug ? styles.debug : ""
            }`}
          >
            <Image
              src="/assets/leaderboard.webp"
              alt="leaderboard board"
              fill
              sizes="390px"
            />
          </div>

          <button
            type="button"
            className={`${styles.menuBtn} ${styles.trainingBtn} ${
              debug ? styles.debug : ""
            }`}
            onClick={() => navigate("/train")}
            disabled={transitioning}
            aria-label="训练模式"
          >
            <Image
              src="/assets/btn_training.webp"
              alt=""
              fill
              sizes="390px"
              aria-hidden
            />
          </button>

          <button
            type="button"
            className={`${styles.menuBtn} ${styles.recordBtn} ${
              debug ? styles.debug : ""
            }`}
            onClick={() => navigate("/record")}
            disabled={transitioning}
            aria-label="我的成绩"
          >
            <Image src="/assets/btn_record.webp" alt="" fill sizes="390px" aria-hidden />
          </button>

          <button
            type="button"
            className={`${styles.menuBtn} ${styles.teamBtn} ${
              debug ? styles.debug : ""
            }`}
            onClick={() => navigate("/team")}
            disabled={transitioning}
            aria-label="制作团队"
          >
            <Image src="/assets/btn_team.webp" alt="" fill sizes="390px" aria-hidden />
          </button>

          <button
            type="button"
            className={`${styles.hotspot} ${styles.characterHotspot} ${
              debug ? styles.debug : ""
            }`}
            onClick={enterDaily}
            disabled={transitioning}
            aria-label="进入今日挑战"
          />

          <button
            type="button"
            className={`${styles.hotspot} ${styles.dailyTagHotspot} ${
              debug ? styles.debug : ""
            }`}
            onClick={enterDaily}
            disabled={transitioning}
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

      <button
        type="button"
        className={styles.debugToggle}
        onClick={() => setDebug((prev) => !prev)}
      >
        {debug ? "Debug: ON" : "Debug: OFF"}
      </button>
    </div>
  );
}
