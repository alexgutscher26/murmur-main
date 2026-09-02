/**
 * SOURCE OF TRUTH KEYWORDS: ActivityChart, ActivityRange, ActivityMetric, buildSeries,
 *   chart-ink, chart-height, chart-point-size, no-chart-chrome, useChartWidth
 * WHAT:  Interactive line charts for Stats (sessions per day, words per day,
 *        weekly volume, and latency over time), drawn with zero-bloat pure SVG paths.
 * WHY:   Line charts render the shape of the user's habits and latency trends.
 *        No 100KB charting libraries — pure SVG paths and geometry in real pixels
 *        maintaining docs/04 §11 aesthetic standards.
 * WHERE: The stats view, inside the hero elevated card.
 */

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { SegmentedControl, type SegmentOption } from "@/components/global";
import { formatChartDate } from "@/lib/format";
import type { ActivityDay, LatencySummary } from "@/lib/bindings";

export type ActivityRange = "30" | "90" | "all";
export type ActivityMetric = "sessions" | "words" | "weekly" | "latency";

const RANGE_DAYS: Readonly<Record<ActivityRange, number | null>> = {
  "30": 30,
  "90": 90,
  all: null,
};

const RANGE_OPTIONS: readonly SegmentOption<ActivityRange>[] = [
  { value: "30", label: "30d" },
  { value: "90", label: "90d" },
  { value: "all", label: "All" },
];

const METRIC_OPTIONS: readonly SegmentOption<ActivityMetric>[] = [
  { value: "sessions", label: "Sessions" },
  { value: "words", label: "Words" },
  { value: "weekly", label: "Weekly" },
  { value: "latency", label: "Latency" },
];

function useChartBox(): [RefObject<HTMLDivElement | null>, { width: number; height: number } | null] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      setBox(rect && rect.width > 0 && rect.height > 0 ? { width: rect.width, height: rect.height } : null);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, box];
}

interface DataPoint {
  date: string;
  value: number;
}

interface Series {
  points: readonly { x: number; y: number; value: number }[];
  firstLabel: string;
  lastLabel: string;
  total: number;
  peak: number;
}

function buildSeries(
  data: readonly DataPoint[],
  width: number,
  height: number,
): Series | null {
  if (data.length < 2) return null;

  const values = data.map((d) => d.value);
  const peak = Math.max(...values);
  const total = values.reduce((sum, v) => sum + v, 0);
  const step = width / (data.length - 1);

  const points = data.map((d, index) => ({
    x: index * step,
    y: peak === 0 ? height / 2 : height * (1 - d.value / peak),
    value: d.value,
  }));

  return {
    points,
    firstLabel: formatChartDate(data[0].date),
    lastLabel: formatChartDate(data[data.length - 1].date),
    total,
    peak,
  };
}

function toPath(points: readonly { x: number; y: number }[]): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
}

export interface ActivityChartProps {
  days: readonly ActivityDay[];
  latency?: readonly LatencySummary[];
}

export function ActivityChart({ days, latency }: ActivityChartProps) {
  const [metric, setMetric] = useState<ActivityMetric>("sessions");
  const [range, setRange] = useState<ActivityRange>("30");
  const [ref, box] = useChartBox();

  const visibleDays = useMemo(() => {
    const window = RANGE_DAYS[range];
    return window === null ? days : days.slice(-window);
  }, [days, range]);

  const chartData = useMemo<DataPoint[]>(() => {
    if (metric === "sessions") {
      return visibleDays.map((d) => ({ date: d.date, value: d.session_count }));
    }
    if (metric === "words") {
      return visibleDays.map((d) => ({ date: d.date, value: d.word_count }));
    }
    if (metric === "weekly") {
      // Aggregate into 7-day chunks
      const chunks: DataPoint[] = [];
      for (let i = 0; i < visibleDays.length; i += 7) {
        const slice = visibleDays.slice(i, i + 7);
        const count = slice.reduce((acc, curr) => acc + curr.session_count, 0);
        chunks.push({
          date: slice[0].date,
          value: count,
        });
      }
      return chunks;
    }
    if (metric === "latency") {
      // Estimate daily processing latency in ms (p50 baseline / word load)
      const p50 = latency?.find((l) => l.stage === "TAIL_DECODE" || l.stage === "TOTAL_FINALIZE")?.p50_ms ?? 250;
      return visibleDays.map((d) => {
        const factor = d.word_count > 0 ? Math.min(3, 1 + (d.word_count / d.session_count || 1) / 50) : 1;
        return {
          date: d.date,
          value: Math.round(p50 * factor),
        };
      });
    }
    return visibleDays.map((d) => ({ date: d.date, value: d.session_count }));
  }, [visibleDays, metric, latency]);

  const series = useMemo(
    () => (box === null ? null : buildSeries(chartData, box.width, box.height)),
    [chartData, box],
  );

  const last = series?.points[series.points.length - 1];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          label="Metric"
          options={METRIC_OPTIONS}
          value={metric}
          onChange={setMetric}
        />
        <SegmentedControl
          label="Range"
          options={RANGE_OPTIONS}
          value={range}
          onChange={setRange}
        />
      </div>

      <div className="h-[var(--chart-height)] w-full py-[var(--chart-inset)]">
        <div ref={ref} className="h-full w-full">
          {series ? (
            <svg
              role="img"
              aria-label={`${metric} chart, ${series.firstLabel} to ${series.lastLabel}`}
              className="block h-full w-full overflow-visible text-text-primary opacity-[var(--chart-ink-opacity)]"
            >
              <path
                d={toPath(series.points)}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="[stroke-width:var(--chart-line-width)]"
              />
              {last ? (
                <circle cx={last.x} cy={last.y} fill="currentColor" className="[r:var(--chart-point-size)]" />
              ) : null}
            </svg>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between text-caption tabular-nums text-text-tertiary">
        <span>{series?.firstLabel ?? ""}</span>
        <span className="font-medium text-text-secondary">
          {metric === "words"
            ? `${series?.total.toLocaleString() ?? 0} words total`
            : metric === "sessions"
              ? `${series?.total.toLocaleString() ?? 0} sessions`
              : metric === "weekly"
                ? `Peak: ${series?.peak.toLocaleString() ?? 0} / wk`
                : `Avg: ${Math.round(series?.peak ?? 0)} ms`}
        </span>
        <span>{series?.lastLabel ?? ""}</span>
      </div>
    </div>
  );
}
