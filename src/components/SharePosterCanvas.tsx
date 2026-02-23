"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  runId: string;
  totalReturnPct: number;
  curve: number[];
  styleText: string;
};

export default function SharePosterCanvas({
  runId,
  totalReturnPct,
  curve,
  styleText,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");

  const pctText = useMemo(
    () => `${totalReturnPct >= 0 ? "+" : ""}${(totalReturnPct * 100).toFixed(2)}%`,
    [totalReturnPct]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#f8fafc");
    bg.addColorStop(1, "#dbeafe");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#0f172a";
    ctx.font = "600 24px Arial";
    ctx.fillText("虚拟交易战绩", 40, 58);

    ctx.fillStyle = totalReturnPct >= 0 ? "#059669" : "#dc2626";
    ctx.font = "700 86px Arial";
    ctx.fillText(pctText, 40, 170);

    ctx.fillStyle = "#475569";
    ctx.font = "400 24px Arial";
    ctx.fillText("总收益率", 42, 210);

    const chartX = 40;
    const chartY = 250;
    const chartW = w - 80;
    const chartH = 210;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(chartX, chartY, chartW, chartH);
    ctx.strokeStyle = "#cbd5e1";
    ctx.strokeRect(chartX, chartY, chartW, chartH);

    const points = curve.length > 0 ? curve : [0];
    const max = Math.max(...points, 0);
    const min = Math.min(...points, 0);
    const range = Math.max(1, max - min);

    const zeroY = chartY + ((max - 0) / range) * chartH;
    ctx.beginPath();
    ctx.moveTo(chartX, zeroY);
    ctx.lineTo(chartX + chartW, zeroY);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    points.forEach((v, i) => {
      const x = chartX + (i / Math.max(1, points.length - 1)) * chartW;
      const y = chartY + ((max - v) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.font = "400 22px Arial";
    const styleLine = styleText.length > 48 ? `${styleText.slice(0, 48)}...` : styleText;
    ctx.fillText(styleLine, 40, 510);

    ctx.fillStyle = "#334155";
    ctx.font = "400 18px Arial";
    ctx.fillText(`查看挑战：/result/${runId}`, 40, 550);

    const dataUrl = canvas.toDataURL("image/png");
    setDownloadUrl(dataUrl);
  }, [curve, pctText, runId, styleText, totalReturnPct]);

  return (
    <div className="stack">
      <canvas ref={canvasRef} width={900} height={600} className="poster-canvas" />
      <a href={downloadUrl} download={`run-${runId}-poster.png`}>
        <button type="button" disabled={!downloadUrl}>
          下载海报
        </button>
      </a>
    </div>
  );
}
