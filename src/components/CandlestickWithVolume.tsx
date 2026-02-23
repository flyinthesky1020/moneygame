"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  ColorType,
  createChart,
  HistogramData,
  IChartApi,
  UTCTimestamp,
} from "lightweight-charts";

export type CandlePoint = {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

type Props = {
  candles: CandlePoint[];
  height?: number;
};

function toTs(index: number): UTCTimestamp {
  return (index + 1) as UTCTimestamp;
}

export default function CandlestickWithVolume({ candles, height = 360 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const klineData = useMemo(
    () =>
      candles.map((d, i) => ({
        time: toTs(i),
        open: d.o,
        high: d.h,
        low: d.l,
        close: d.c,
      })),
    [candles]
  );

  const volumeData = useMemo(
    () =>
      candles.map(
        (d, i): HistogramData<UTCTimestamp> => ({
          time: toTs(i),
          value: d.v,
          color: d.c >= d.o ? "#0ea5a4" : "#ef4444",
        })
      ),
    [candles]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#374151",
      },
      width: containerRef.current.clientWidth,
      height,
      rightPriceScale: {
        borderColor: "#e5e7eb",
      },
      timeScale: {
        borderColor: "#e5e7eb",
      },
      grid: {
        vertLines: { color: "#f3f4f6" },
        horzLines: { color: "#f3f4f6" },
      },
      crosshair: {
        vertLine: { color: "#9ca3af" },
        horzLine: { color: "#9ca3af" },
      },
    });
    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    const volumeSeries = chart.addHistogramSeries({
      color: "#93c5fd",
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.75, bottom: 0 },
      borderVisible: false,
    });
    chart.priceScale("right").applyOptions({
      scaleMargins: { top: 0.06, bottom: 0.28 },
    });

    candlestickSeries.setData(klineData);
    volumeSeries.setData(volumeData);
    chart.timeScale().fitContent();

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !chartRef.current) return;
      chartRef.current.applyOptions({
        width: Math.floor(entry.contentRect.width),
      });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [height, klineData, volumeData]);

  return <div ref={containerRef} style={{ width: "100%" }} />;
}
