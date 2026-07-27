"use client";

import { useMemo, useState } from "react";

type Timeframe = "7D" | "30D" | "All Time";

interface ChartPoint {
  label: string;
  value: number;
  tooltipDate: string;
}

const DATA: Record<Timeframe, ChartPoint[]> = {
  "7D": [
    { label: "Mon", value: 180, tooltipDate: "Mon, Jul 21" },
    { label: "Tue", value: 260, tooltipDate: "Tue, Jul 22" },
    { label: "Wed", value: 340, tooltipDate: "Wed, Jul 23" },
    { label: "Thu", value: 390, tooltipDate: "Thu, Jul 24" },
    { label: "Fri", value: 520, tooltipDate: "Fri, Jul 25" },
    { label: "Sat", value: 610, tooltipDate: "Sat, Jul 26" },
    { label: "Sun", value: 760, tooltipDate: "Sun, Jul 27" },
  ],
  "30D": [
    { label: "W1", value: 180, tooltipDate: "Week of Jun 30" },
    { label: "W2", value: 310, tooltipDate: "Week of Jul 7" },
    { label: "W3", value: 480, tooltipDate: "Week of Jul 14" },
    { label: "W4", value: 690, tooltipDate: "Week of Jul 21" },
    { label: "W5", value: 860, tooltipDate: "Week of Jul 28" },
    { label: "W6", value: 1040, tooltipDate: "Week of Aug 4" },
  ],
  "All Time": [
    { label: "Jan", value: 90, tooltipDate: "January" },
    { label: "Feb", value: 180, tooltipDate: "February" },
    { label: "Mar", value: 260, tooltipDate: "March" },
    { label: "Apr", value: 430, tooltipDate: "April" },
    { label: "May", value: 580, tooltipDate: "May" },
    { label: "Jun", value: 720, tooltipDate: "June" },
    { label: "Jul", value: 980, tooltipDate: "July" },
  ],
};

const TIMEFRAMES: Timeframe[] = ["7D", "30D", "All Time"];

function buildPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";

  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
}

function buildAreaPath(points: Array<{ x: number; y: number }>, baselineY: number) {
  if (points.length === 0) return "";

  const path = buildPath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];

  return `${path} L ${lastPoint.x},${baselineY} L ${firstPoint.x},${baselineY} Z`;
}

export default function SavingsGrowthChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>("30D");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const data = DATA[timeframe];

  const { linePath, areaPath, plottedPoints, maxValue, minValue } = useMemo(() => {
    const width = 100;
    const height = 100;
    const paddingX = 6;
    const paddingY = 12;
    const availableWidth = width - paddingX * 2;
    const availableHeight = height - paddingY * 2;
    const max = Math.max(...data.map((point) => point.value));
    const min = Math.min(...data.map((point) => point.value));
    const range = Math.max(max - min, 1);

    const points = data.map((point, index) => {
      const x =
        data.length === 1
          ? width / 2
          : paddingX + (availableWidth * index) / (data.length - 1);
      const normalized = (point.value - min) / range;
      const y = height - paddingY - normalized * availableHeight;

      return { x, y };
    });

    return {
      linePath: buildPath(points),
      areaPath: buildAreaPath(points, height - paddingY),
      plottedPoints: points,
      maxValue: max,
      minValue: min,
    };
  }, [data]);

  const activePoint = hoveredPoint !== null ? data[hoveredPoint] : null;
  const activeCoords = hoveredPoint !== null ? plottedPoints[hoveredPoint] : null;

  return (
    <section className="rounded-2xl bg-[#1C1C1E] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#9A9A9A]">
            Savings growth
          </p>
          <h2 className="mt-2 text-xl font-bold font-sora text-white">
            Cumulative savings over time
          </h2>
          <p className="mt-2 text-sm text-[#A1A1AA]">
            Track how your USDT savings have grown across the selected timeframe.
          </p>
        </div>

        <div className="inline-flex rounded-full border border-[#ffffff14] bg-[#ffffff07] p-1 self-start">
          {TIMEFRAMES.map((option) => {
            const isActive = option === timeframe;

            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setTimeframe(option);
                  setHoveredPoint(null);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
                  isActive
                    ? "bg-white text-[#111111]"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 relative">
        <div className="absolute right-0 top-0 z-10 rounded-2xl border border-[#ffffff12] bg-[#111111] px-4 py-3 text-right shadow-lg">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#9A9A9A]">{activePoint.label}</p>
          <p className="mt-1 text-lg font-semibold text-white">{activePoint.value.toLocaleString()} USDT</p>
          <p className="text-xs text-[#A1A1AA]">{activePoint.tooltipDate}</p>
        </div>

        <div className="h-[320px] w-full overflow-hidden rounded-[1.5rem] border border-[#ffffff10] bg-[#151516] p-4 sm:p-6">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label={`Cumulative savings chart for ${timeframe}`}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="savings-area-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#5EEAD4" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="savings-line-stroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#5EEAD4" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>

            {[0, 25, 50, 75, 100].map((tick) => (
              <line
                key={tick}
                x1="0"
                x2="100"
                y1={tick}
                y2={tick}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="2 4"
              />
            ))}

            <line x1="0" x2="100" y1="88" y2="88" stroke="rgba(255,255,255,0.14)" />
            <line x1="8" x2="8" y1="0" y2="88" stroke="rgba(255,255,255,0.08)" />

            <path d={areaPath} fill="url(#savings-area-fill)" />
            <path
              d={linePath}
              fill="none"
              stroke="url(#savings-line-stroke)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {plottedPoints.map((point, index) => {
              const isActive = hoveredPoint === index;

              return (
                <g key={data[index].label}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isActive ? 2.8 : 1.8}
                    fill="#E5E7EB"
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={6}
                    fill="transparent"
                    onMouseEnter={() => setHoveredPoint(index)}
                    onFocus={() => setHoveredPoint(index)}
                    tabIndex={0}
                  />
                </g>
              );
            })}
          </svg>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#A1A1AA] sm:grid-cols-4 lg:grid-cols-7">
            {data.map((point) => (
              <div key={point.label} className="text-center">
                <div className="font-medium text-white">{point.label}</div>
                <div>{point.value.toLocaleString()} USDT</div>
              </div>
            ))}
          </div>
        </div>

        {activePoint && activeCoords && (
          <div
            className="pointer-events-none absolute z-20 hidden rounded-xl border border-[#ffffff14] bg-[#111111] px-3 py-2 text-xs text-white shadow-xl sm:block"
            style={{
              left: `calc(${activeCoords.x}% + 12px)`,
              top: `calc(${activeCoords.y}% + 18px)`,
            }}
          >
            <div className="font-medium text-[#5EEAD4]">{activePoint.tooltipDate}</div>
            <div>{activePoint.value.toLocaleString()} USDT</div>
          </div>
        )}

        <div className="mt-3 text-xs text-[#A1A1AA]">
          Range: {minValue.toLocaleString()} to {maxValue.toLocaleString()} USDT
        </div>
      </div>
    </section>
  );
}