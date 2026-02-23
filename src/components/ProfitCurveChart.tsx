"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

type Props = {
  curve: number[];
};

export default function ProfitCurveChart({ curve }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const labels = curve.map((_, i) => i.toString());
    const min = Math.min(...curve, 0);
    const max = Math.max(...curve, 0);
    const padding = Math.max(1, (max - min) * 0.12);

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "累计收益",
            data: curve,
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.15)",
            tension: 0.2,
            fill: true,
            pointRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: "index", intersect: false },
        },
        interaction: {
          mode: "index",
          intersect: false,
        },
        scales: {
          x: {
            title: { display: true, text: "题号" },
            grid: { color: "#f1f5f9" },
          },
          y: {
            beginAtZero: true,
            suggestedMin: min - padding,
            suggestedMax: max + padding,
            title: { display: true, text: "累计收益" },
            grid: { color: "#f1f5f9" },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [curve]);

  return (
    <div style={{ width: "100%", height: 320 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
