"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type IndicatorMode = "volume" | "macd" | "kdj";

const RISE_COLOR = "#c63d32";
const FALL_COLOR = "#2f8a4b";

function toTs(index: number): UTCTimestamp {
  return (index + 1) as UTCTimestamp;
}

function buildSmaData(candles: CandlePoint[], period: number) {
  const result: Array<{ time: UTCTimestamp; value: number }> = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i += 1) {
    sum += candles[i].c;
    if (i >= period) sum -= candles[i - period].c;
    if (i >= period - 1) {
      result.push({ time: toTs(i), value: sum / period });
    }
  }
  return result;
}

function buildEma(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const alpha = 2 / (period + 1);
  const ema: number[] = [values[0]];
  for (let i = 1; i < values.length; i += 1) {
    ema.push(alpha * values[i] + (1 - alpha) * ema[i - 1]);
  }
  return ema;
}

function buildMacdData(candles: CandlePoint[]) {
  const closes = candles.map((c) => c.c);
  const ema12 = buildEma(closes, 12);
  const ema26 = buildEma(closes, 26);
  const diff = closes.map((_, i) => ema12[i] - ema26[i]);
  const dea = buildEma(diff, 9);
  const hist = diff.map((v, i) => v - dea[i]);

  return {
    diffData: diff.map((v, i) => ({ time: toTs(i), value: v })),
    deaData: dea.map((v, i) => ({ time: toTs(i), value: v })),
    histData: hist.map(
      (v, i): HistogramData<UTCTimestamp> => ({
        time: toTs(i),
        value: v,
        color: v >= 0 ? RISE_COLOR : FALL_COLOR,
      })
    ),
  };
}

function buildKdjData(candles: CandlePoint[]) {
  const period = 9;
  let prevK = 50;
  let prevD = 50;
  const kData: Array<{ time: UTCTimestamp; value: number }> = [];
  const dData: Array<{ time: UTCTimestamp; value: number }> = [];
  const jData: Array<{ time: UTCTimestamp; value: number }> = [];

  for (let i = 0; i < candles.length; i += 1) {
    const start = Math.max(0, i - period + 1);
    let highN = -Infinity;
    let lowN = Infinity;
    for (let j = start; j <= i; j += 1) {
      highN = Math.max(highN, candles[j].h);
      lowN = Math.min(lowN, candles[j].l);
    }
    const range = highN - lowN;
    const rsv = range === 0 ? 50 : ((candles[i].c - lowN) / range) * 100;
    const k = (2 * prevK + rsv) / 3;
    const d = (2 * prevD + k) / 3;
    const j = 3 * k - 2 * d;
    prevK = k;
    prevD = d;

    kData.push({ time: toTs(i), value: k });
    dData.push({ time: toTs(i), value: d });
    jData.push({ time: toTs(i), value: j });
  }

  return { kData, dData, jData };
}

export default function CandlestickWithVolume({ candles, height = 460 }: Props) {
  const [indicatorMode, setIndicatorMode] = useState<IndicatorMode>("volume");
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const priceContainerRef = useRef<HTMLDivElement | null>(null);
  const indicatorContainerRef = useRef<HTMLDivElement | null>(null);
  const priceChartRef = useRef<IChartApi | null>(null);
  const indicatorChartRef = useRef<IChartApi | null>(null);

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
  const ma7Data = useMemo(() => buildSmaData(candles, 7), [candles]);
  const ma30Data = useMemo(() => buildSmaData(candles, 30), [candles]);
  const volumeData = useMemo(
    () =>
      candles.map(
        (d, i): HistogramData<UTCTimestamp> => ({
          time: toTs(i),
          value: d.v,
          color: d.c >= d.o ? RISE_COLOR : FALL_COLOR,
        })
      ),
    [candles]
  );
  const macdData = useMemo(() => buildMacdData(candles), [candles]);
  const kdjData = useMemo(() => buildKdjData(candles), [candles]);

  useEffect(() => {
    if (!wrapperRef.current || !priceContainerRef.current || !indicatorContainerRef.current) {
      return;
    }

    const width = wrapperRef.current.clientWidth;
    const priceHeight = Math.floor(height * 0.72);
    const indicatorHeight = Math.max(120, height - priceHeight);

    const priceChart = createChart(priceContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#4b5563",
        attributionLogo: false,
      },
      width,
      height: priceHeight,
      rightPriceScale: { borderColor: "#e5e7eb" },
      timeScale: { visible: false, borderColor: "#e5e7eb" },
      grid: {
        vertLines: { color: "#eceff3" },
        horzLines: { color: "#eceff3" },
      },
      crosshair: {
        vertLine: { color: "#9aa5b5" },
        horzLine: { color: "#9aa5b5" },
      },
    });
    priceChartRef.current = priceChart;

    const indicatorChart = createChart(indicatorContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#4b5563",
        attributionLogo: false,
      },
      width,
      height: indicatorHeight,
      rightPriceScale: { borderColor: "#e5e7eb" },
      leftPriceScale: { visible: false },
      timeScale: { borderColor: "#e5e7eb" },
      grid: {
        vertLines: { color: "#f2f4f7" },
        horzLines: { color: "#eceff3" },
      },
      crosshair: {
        vertLine: { color: "#9aa5b5" },
        horzLine: { color: "#9aa5b5" },
      },
    });
    indicatorChartRef.current = indicatorChart;

    const candlestickSeries = priceChart.addCandlestickSeries({
      upColor: RISE_COLOR,
      downColor: FALL_COLOR,
      borderVisible: false,
      wickUpColor: RISE_COLOR,
      wickDownColor: FALL_COLOR,
    });
    const ma7Series = priceChart.addLineSeries({
      color: "#e69138",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    const ma30Series = priceChart.addLineSeries({
      color: "#3d85c6",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    candlestickSeries.setData(klineData);
    ma7Series.setData(ma7Data);
    ma30Series.setData(ma30Data);
    priceChart.priceScale("right").applyOptions({
      visible: true,
      borderVisible: true,
      scaleMargins: { top: 0.08, bottom: 0.08 },
    });

    if (indicatorMode === "volume") {
      const volumeSeries = indicatorChart.addHistogramSeries({
        color: "#8fa2b7",
        priceFormat: { type: "volume" },
      });
      volumeSeries.setData(volumeData);
    } else if (indicatorMode === "macd") {
      const histSeries = indicatorChart.addHistogramSeries({
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const diffSeries = indicatorChart.addLineSeries({
        color: "#e69138",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      const deaSeries = indicatorChart.addLineSeries({
        color: "#3d85c6",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      histSeries.setData(macdData.histData);
      diffSeries.setData(macdData.diffData);
      deaSeries.setData(macdData.deaData);
    } else {
      const kSeries = indicatorChart.addLineSeries({
        color: "#e69138",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      const dSeries = indicatorChart.addLineSeries({
        color: "#3d85c6",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      const jSeries = indicatorChart.addLineSeries({
        color: "#6aa84f",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      kSeries.setData(kdjData.kData);
      dSeries.setData(kdjData.dData);
      jSeries.setData(kdjData.jData);
    }

    priceChart.timeScale().fitContent();
    indicatorChart.timeScale().fitContent();

    let syncing = false;
    const syncFromPrice = (range: LogicalRange | null) => {
      if (syncing || !range || !indicatorChartRef.current) return;
      syncing = true;
      indicatorChartRef.current.timeScale().setVisibleLogicalRange(range);
      syncing = false;
    };
    const syncFromIndicator = (range: LogicalRange | null) => {
      if (syncing || !range || !priceChartRef.current) return;
      syncing = true;
      priceChartRef.current.timeScale().setVisibleLogicalRange(range);
      syncing = false;
    };

    priceChart.timeScale().subscribeVisibleLogicalRangeChange(syncFromPrice);
    indicatorChart.timeScale().subscribeVisibleLogicalRangeChange(syncFromIndicator);

    const ro = new ResizeObserver((entries) => {
      const entry = entries.at(0);
      if (!entry || !priceChartRef.current || !indicatorChartRef.current) return;
      const nextWidth = Math.floor(entry.contentRect.width);
      priceChartRef.current.applyOptions({ width: nextWidth });
      indicatorChartRef.current.applyOptions({ width: nextWidth });
    });
    ro.observe(wrapperRef.current);

    return () => {
      priceChart.timeScale().unsubscribeVisibleLogicalRangeChange(syncFromPrice);
      indicatorChart.timeScale().unsubscribeVisibleLogicalRangeChange(syncFromIndicator);
      ro.disconnect();
      priceChart.remove();
      indicatorChart.remove();
      priceChartRef.current = null;
      indicatorChartRef.current = null;
    };
  }, [
    candles,
    height,
    indicatorMode,
    kdjData.dData,
    kdjData.jData,
    kdjData.kData,
    klineData,
    ma7Data,
    ma30Data,
    macdData.deaData,
    macdData.diffData,
    macdData.histData,
    volumeData,
  ]);

  const indicatorLabel = useMemo(() => {
    if (indicatorMode === "volume") return <span>成交量</span>;
    if (indicatorMode === "macd") {
      return (
        <span>
          MACD（<span style={{ color: "#e69138", fontWeight: 600 }}>DIFF</span>
          {" / "}
          <span style={{ color: "#3d85c6", fontWeight: 600 }}>DEA</span>）
        </span>
      );
    }
    return (
      <span>
        KDJ（<span style={{ color: "#e69138", fontWeight: 600 }}>K</span>
        {" / "}
        <span style={{ color: "#3d85c6", fontWeight: 600 }}>D</span>
        {" / "}
        <span style={{ color: "#6aa84f", fontWeight: 600 }}>J</span>）
      </span>
    );
  }, [indicatorMode]);

  const modeBtnStyle = (active: boolean) => ({
    padding: "4px 8px",
    fontSize: 12,
    minHeight: 28,
    width: "auto",
    borderColor: active ? "#1f3a5f" : "#d1d5db",
    background: active ? "#1f3a5f" : "#ffffff",
    color: active ? "#f8fafc" : "#334155",
  });

  return (
    <div ref={wrapperRef} style={{ width: "100%", display: "grid", rowGap: 8 }}>
      <div style={{ fontSize: 12, color: "#4b5563" }}>
        每日价格（
        <span style={{ color: "#e69138", fontWeight: 600 }}>MA7</span>
        {" / "}
        <span style={{ color: "#3d85c6", fontWeight: 600 }}>MA30</span>
        ）
      </div>
      <div ref={priceContainerRef} style={{ width: "100%" }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginTop: 2,
        }}
      >
        <div style={{ fontSize: 12, color: "#4b5563" }}>{indicatorLabel}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setIndicatorMode("volume")}
            style={modeBtnStyle(indicatorMode === "volume")}
          >
            成交量
          </button>
          <button
            type="button"
            onClick={() => setIndicatorMode("macd")}
            style={modeBtnStyle(indicatorMode === "macd")}
          >
            MACD
          </button>
          <button
            type="button"
            onClick={() => setIndicatorMode("kdj")}
            style={modeBtnStyle(indicatorMode === "kdj")}
          >
            KDJ
          </button>
        </div>
      </div>
      <div ref={indicatorContainerRef} style={{ width: "100%" }} />
    </div>
  );
}
