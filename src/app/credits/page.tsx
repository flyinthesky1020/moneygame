"use client";

import Image from "next/image";
import { useEffect } from "react";
import styles from "./page.module.css";

export default function CreditsPage() {
  useEffect(() => {
    document.body.classList.add("home-like-body");
    return () => {
      document.body.classList.remove("home-like-body");
    };
  }, []);

  return (
    <div className={`stack ${styles.page}`}>
      <section className={styles.hero}>
        <h1 className={styles.title}>制作团队</h1>
        <p className={styles.heroText}>
          &emsp;&emsp;Helo，这里是这个简单的韭菜模拟器的创作者小天，产品数据均来自于对真实世界的采样及清洗打散，希望能帮助大家早日摆脱韭菜情结，建立自己的交易方法；
        </p>
        <p className={styles.heroText}>
          &emsp;&emsp;同时在这里招募志同道合的朋友们，一起探索AI的能力边界，共同在这个所谓的AI年代尝试一些自己喜欢的事务吧。
        </p>
      </section>

      <section className={styles.qrCard}>
        <p className={styles.qrHint}>扫码联系我</p>
        <Image
          src="/assets/erweima.webp"
          alt="联系二维码"
          width={240}
          height={240}
          className={styles.qrImage}
          priority
        />
      </section>
    </div>
  );
}
