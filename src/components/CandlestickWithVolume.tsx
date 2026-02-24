"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  ColorType,
  createChart,
  HistogramData,
  IChartApi,
  LogicalRange,
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
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const priceContainerRef = useRef<HTMLDivElement | null>(null);
  const volumeContainerRef = useRef<HTMLDivElement | null>(null);
  const priceChartRef = useRef<IChartApi | null>(null);
  const volumeChartRef = useRef<IChartApi | null>(null);

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
    if (!wrapperRef.current || !priceContainerRef.current || !volumeContainerRef.current) {
      return;
    }

    const width = wrapperRef.current.clientWidth;
    const priceHeight = Math.floor(height * 0.75);
    const volumeHeight = Math.max(96, height - priceHeight);

    const priceChart = createChart(priceContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#374151",
      },
      width,
      height: priceHeight,
      rightPriceScale: {
        borderColor: "#e5e7eb",
      },
      timeScale: {
        visible: false,
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
    priceChartRef.current = priceChart;

    const volumeChart = createChart(volumeContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#374151",
      },
      width,
      height: volumeHeight,
      rightPriceScale: {
        borderColor: "#e5e7eb",
      },
      leftPriceScale: {
        visible: false,
      },
      timeScale: {
        borderColor: "#e5e7eb",
      },
      grid: {
        vertLines: { color: "#f8fafc" },
        horzLines: { color: "#f1f5f9" },
      },
      crosshair: {
        vertLine: { color: "#9ca3af" },
        horzLine: { color: "#9ca3af" },
      },
    });
    volumeChartRef.current = volumeChart;

    const candlestickSeries = priceChart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    const volumeSeries = volumeChart.addHistogramSeries({
      color: "#93c5fd",
      priceFormat: { type: "volume" },
    });
    volumeChart.priceScale("right").applyOptions({
      visible: true,
      borderVisible: true,
      scaleMargins: { top: 0.08, bottom: 0.08 },
    });
    priceChart.priceScale("right").applyOptions({
      visible: true,
      borderVisible: true,
      scaleMargins: { top: 0.08, bottom: 0.08 },
    });

    candlestickSeries.setData(klineData);
    volumeSeries.setData(volumeData);
    priceChart.timeScale().fitContent();
    volumeChart.timeScale().fitContent();

    let syncing = false;
    const syncFromPrice = (range: LogicalRange | null) => {
      if (syncing || !range || !volumeChartRef.current) return;
      syncing = true;
      volumeChartRef.current.timeScale().setVisibleLogicalRange(range);
      syncing = false;
    };
    const syncFromVolume = (range: LogicalRange | null) => {
      if (syncing || !range || !priceChartRef.current) return;
      syncing = true;
      priceChartRef.current.timeScale().setVisibleLogicalRange(range);
      syncing = false;
    };

    priceChart.timeScale().subscribeVisibleLogicalRangeChange(syncFromPrice);
    volumeChart.timeScale().subscribeVisibleLogicalRangeChange(syncFromVolume);

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !priceChartRef.current || !volumeChartRef.current) return;
      const nextWidth = Math.floor(entry.contentRect.width);
      priceChartRef.current.applyOptions({
        width: nextWidth,
      });
      volumeChartRef.current.applyOptions({
        width: nextWidth,
      });
    });
    ro.observe(wrapperRef.current);

    return () => {
      priceChart.timeScale().unsubscribeVisibleLogicalRangeChange(syncFromPrice);
      volumeChart
        .timeScale()
        .unsubscribeVisibleLogicalRangeChange(syncFromVolume);
      ro.disconnect();
      priceChart.remove();
      volumeChart.remove();
      priceChartRef.current = null;
      volumeChartRef.current = null;
    };
  }, [height, klineData, volumeData]);

  return (
    <div ref={wrapperRef} style={{ width: "100%", display: "grid", rowGap: 8 }}>
      <div ref={priceContainerRef} style={{ width: "100%" }} />
      <div ref={volumeContainerRef} style={{ width: "100%" }} />
    </div>
  );
}
