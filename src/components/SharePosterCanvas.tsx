"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { pickSharePosterQuote } from "@/lib/sharePosterQuotes";

type Props = {
  runId: string;
  nickname?: string;
  completedAt?: string;
  totalReturnPct: number;
  totalProfit: number;
  winDays: number;
  lossDays: number;
  idleDays: number;
  curve: number[];
  styleText: string;
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [""];

  const lines: string[] = [];
  let current = "";
  for (const ch of normalized) {
    const next = `${current}${ch}`;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = ch;
  }
  if (current) lines.push(current);
  return lines;
}

function formatDateLabel(value?: string): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return "日期未知";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image load failed"));
    image.src = src;
  });
}

function resolveBadge(totalReturnPct: number): {
  title: string;
  fill: string;
  text: string;
} {
  if (totalReturnPct > 0.1) {
    return {
      title: "技术的神",
      fill: "#f7d8d0",
      text: "#c63d32",
    };
  }
  if (totalReturnPct >= 0.03) {
    return {
      title: "盈利者",
      fill: "#fde8c9",
      text: "#b5651d",
    };
  }
  if (totalReturnPct > -0.03) {
    return {
      title: "平淡是福",
      fill: "#ece5d6",
      text: "#76624b",
    };
  }
  if (totalReturnPct >= -0.1) {
    return {
      title: "亏损者",
      fill: "#dcefdc",
      text: "#2f8a4b",
    };
  }
  return {
    title: "你就是韭皇",
    fill: "#d7ead1",
    text: "#456b2f",
  };
}

export default function SharePosterCanvas({
  runId,
  nickname,
  completedAt,
  totalReturnPct,
  totalProfit,
  winDays,
  lossDays,
  idleDays,
  curve,
  styleText,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [posterDataUrl, setPosterDataUrl] = useState("");
  const upColor = "#c63d32";
  const downColor = "#2f8a4b";
  const trendColor = totalReturnPct >= 0 ? upColor : downColor;
  const badge = useMemo(() => resolveBadge(totalReturnPct), [totalReturnPct]);

  const displayNickname = useMemo(
    () => (nickname?.trim() ? nickname.trim() : "匿名玩家"),
    [nickname]
  );
  const pctText = useMemo(
    () => `${totalReturnPct >= 0 ? "+" : ""}${(totalReturnPct * 100).toFixed(2)}%`,
    [totalReturnPct]
  );
  const profitText = useMemo(
    () => `${totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)}元`,
    [totalProfit]
  );
  const dateText = useMemo(() => formatDateLabel(completedAt), [completedAt]);
  const posterQuote = useMemo(
    () => pickSharePosterQuote(runId, totalProfit),
    [runId, totalProfit]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const currentCanvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const currentCtx = ctx;
    let canceled = false;

    async function drawPoster() {
      const ctx = currentCtx;
      let qrImage: HTMLImageElement | null = null;
      try {
        qrImage = await loadImage(
          `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent("https://chivesgame.com")}`
        );
      } catch {
        qrImage = null;
      }
      if (canceled) return;

      const w = currentCanvas.width;
      const h = currentCanvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "#f2dfb5";
      ctx.fillRect(0, 0, w, h);

      const paperX = 34;
      const paperY = 34;
      const paperW = w - 68;
      const paperH = h - 68;
      drawRoundedRect(ctx, paperX, paperY, paperW, paperH, 60);
      ctx.fillStyle = "#fffdf5";
      ctx.fill();

      const fontHand =
        "\"HanziPen SC\", \"Kaiti SC\", \"KaiTi\", \"STKaiti\", \"Comic Sans MS\", cursive";
      ctx.fillStyle = "#1d140d";
      ctx.textBaseline = "top";

      ctx.fillStyle = trendColor;
      ctx.font = `700 74px ${fontHand}`;
      ctx.fillText(`收益 ${pctText}`, paperX + 46, paperY + 138);

      ctx.fillStyle = totalProfit >= 0 ? upColor : downColor;
      ctx.font = `600 54px ${fontHand}`;
      ctx.fillText(`本次总收益：${profitText}`, paperX + 46, paperY + 250);

      const titleBoxW = 165;
      const titleBoxH = 72;
      const titleBoxX = paperX + paperW - titleBoxW - 44;
      const titleBoxY = paperY + 58;
      drawRoundedRect(ctx, titleBoxX, titleBoxY, titleBoxW, titleBoxH, 38);
      ctx.fillStyle = badge.fill;
      ctx.fill();
      ctx.fillStyle = badge.text;
      ctx.font = `700 34px ${fontHand}`;
      ctx.fillText(badge.title, titleBoxX + 18, titleBoxY + 18);

      const faceCx = paperX + paperW - 122;
      const faceCy = paperY + 238;
      ctx.fillStyle = "#f6f0de";
      ctx.beginPath();
      ctx.arc(faceCx, faceCy, 51, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#6d7f4f";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = "#1f1a16";
      ctx.beginPath();
      ctx.arc(faceCx - 15, faceCy - 6, 4, 0, Math.PI * 2);
      ctx.arc(faceCx + 15, faceCy - 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.arc(faceCx, faceCy + 16, 15, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.strokeStyle = "#7a9b45";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(faceCx - 12, faceCy - 54);
      ctx.lineTo(faceCx - 20, faceCy - 95);
      ctx.moveTo(faceCx + 6, faceCy - 54);
      ctx.lineTo(faceCx + 12, faceCy - 95);
      ctx.moveTo(faceCx + 21, faceCy - 52);
      ctx.lineTo(faceCx + 33, faceCy - 90);
      ctx.stroke();

      ctx.font = `600 50px ${fontHand}`;
      const statsY = paperY + 360;
      ctx.fillStyle = upColor;
      ctx.fillText(`盈利天数:${winDays}`, paperX + 46, statsY);
      ctx.fillStyle = downColor;
      ctx.fillText(`亏损天数:${lossDays}`, paperX + 332, statsY);
      ctx.fillStyle = "#1d140d";
      ctx.fillText(`未开仓天数:${idleDays}`, paperX + 620, statsY);

      ctx.font = `700 72px ${fontHand}`;
      ctx.fillText("累计收益", paperX + 46, paperY + 472);

      const chartX = paperX + 86;
      const chartY = paperY + 620;
      const chartW = paperW - 168;
      const chartH = 320;

      ctx.strokeStyle = "#2b2119";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(chartX, chartY + chartH);
      ctx.lineTo(chartX, chartY);
      ctx.lineTo(chartX - 14, chartY + 24);
      ctx.moveTo(chartX, chartY);
      ctx.lineTo(chartX + 14, chartY + 24);
      ctx.moveTo(chartX, chartY + chartH);
      ctx.lineTo(chartX + chartW, chartY + chartH);
      ctx.lineTo(chartX + chartW - 24, chartY + chartH - 14);
      ctx.moveTo(chartX + chartW, chartY + chartH);
      ctx.lineTo(chartX + chartW - 24, chartY + chartH + 14);
      ctx.stroke();

      const points = curve.length > 0 ? curve : [0];
      const max = Math.max(...points, 0);
      const min = Math.min(...points, 0);
      const range = Math.max(1, max - min);
      const plotPoints = points.map((v, i) => ({
        x: chartX + 20 + (i / Math.max(1, points.length - 1)) * (chartW - 44),
        y: chartY + 24 + ((max - v) / range) * (chartH - 52),
        v,
      }));
      ctx.lineWidth = 6;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      for (let i = 1; i < plotPoints.length; i += 1) {
        const prev = plotPoints[i - 1];
        const next = plotPoints[i];
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = next.v >= prev.v ? upColor : downColor;
        ctx.stroke();
      }

      ctx.font = `600 46px ${fontHand}`;
      ctx.fillStyle = "#2b2119";
      ctx.fillText("1", chartX + 12, chartY + chartH + 16);
      ctx.fillText(`${Math.max(1, Math.floor(points.length / 3))}`, chartX + chartW * 0.34, chartY + chartH + 16);
      ctx.fillText(`${Math.max(1, Math.floor((points.length * 2) / 3))}`, chartX + chartW * 0.62, chartY + chartH + 16);
      ctx.fillText(`${points.length}`, chartX + chartW - 42, chartY + chartH + 16);

      ctx.font = `600 60px ${fontHand}`;
      const wrapped = wrapText(ctx, posterQuote.text, paperW - 120).slice(0, 3);
      const quoteBaseY = paperY + 1068;
      const quoteLineHeight = 74;
      wrapped.forEach((line, index) => {
        ctx.fillText(line, paperX + 46, quoteBaseY + index * quoteLineHeight);
      });
      ctx.font = `400 28px ${fontHand}`;
      ctx.fillStyle = "#7c6651";
      ctx.textAlign = "right";
      ctx.fillText(
        `—— ${posterQuote.author}`,
        paperX + paperW - 46,
        quoteBaseY + wrapped.length * quoteLineHeight + 16
      );
      ctx.textAlign = "left";

      const footerY = paperY + paperH - 208;
      ctx.fillStyle = "#1d140d";
      ctx.font = `700 58px ${fontHand}`;
      ctx.fillText(displayNickname, paperX + 46, footerY);
      ctx.font = `400 28px "IBM Plex Sans", "PingFang SC", sans-serif`;
      ctx.fillStyle = "#7c6651";
      ctx.fillText(dateText, paperX + 50, footerY + 72);
      ctx.font = `400 24px "IBM Plex Sans", "PingFang SC", sans-serif`;
      ctx.fillText("扫码访问 chivesgame.com", paperX + 50, footerY + 114);

      const qrSize = 170;
      const qrX = paperX + paperW - qrSize - 54;
      const qrY = paperY + paperH - qrSize - 62;
      drawRoundedRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 24);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      if (qrImage) {
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
      } else {
        ctx.strokeStyle = "#1d140d";
        ctx.lineWidth = 3;
        ctx.strokeRect(qrX, qrY, qrSize, qrSize);
      }
      setPosterDataUrl(currentCanvas.toDataURL("image/png"));
    }

    void drawPoster();
    return () => {
      canceled = true;
    };
  }, [
    completedAt,
    curve,
    dateText,
    displayNickname,
    idleDays,
    lossDays,
    pctText,
    posterQuote,
    profitText,
    badge,
    totalProfit,
    totalReturnPct,
    trendColor,
    winDays,
  ]);

  return (
    <div className="result-poster-wrap">
      <canvas ref={canvasRef} width={1080} height={1800} className="result-poster-source" />
      {posterDataUrl ? (
        <Image
          src={posterDataUrl}
          alt="战绩结算海报"
          width={1080}
          height={1800}
          unoptimized
          className="result-poster-canvas"
          draggable={false}
        />
      ) : (
        <div className="result-poster-canvas result-poster-placeholder" />
      )}
      <div className="result-save-btn result-save-hint" aria-label="长按图片保存">
        {posterDataUrl ? (
          <Image
            src={posterDataUrl}
            alt=""
            width={1080}
            height={1800}
            unoptimized
            className="result-save-touch-image"
            draggable={false}
          />
        ) : null}
        <span className="result-save-hint-text">长按图片保存</span>
      </div>
    </div>
  );
}
