"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DataPoint {
  date: string;
  value: number;
}

type Timeframe = "7D" | "30D" | "ALL";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockData: Record<Timeframe, DataPoint[]> = {
  "7D": [
    { date: "Jul 18", value: 820 },
    { date: "Jul 19", value: 860 },
    { date: "Jul 20", value: 880 },
    { date: "Jul 21", value: 910 },
    { date: "Jul 22", value: 940 },
    { date: "Jul 23", value: 970 },
    { date: "Jul 24", value: 1000 },
  ],
  "30D": [
    { date: "Jun 25", value: 420 },
    { date: "Jun 29", value: 480 },
    { date: "Jul 3",  value: 530 },
    { date: "Jul 7",  value: 600 },
    { date: "Jul 11", value: 660 },
    { date: "Jul 15", value: 730 },
    { date: "Jul 19", value: 800 },
    { date: "Jul 22", value: 880 },
    { date: "Jul 24", value: 950 },
    { date: "Jul 25", value: 1000 },
  ],
  ALL: [
    { date: "Jan",  value: 50 },
    { date: "Feb",  value: 130 },
    { date: "Mar",  value: 220 },
    { date: "Apr",  value: 310 },
    { date: "May",  value: 430 },
    { date: "Jun",  value: 560 },
    { date: "Jul",  value: 700 },
    { date: "Aug",  value: 790 },
    { date: "Sep",  value: 850 },
    { date: "Oct",  value: 900 },
    { date: "Nov",  value: 950 },
    { date: "Dec",  value: 1000 },
  ],
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipInternalProps {
  active?: boolean;
  // recharts 3.x injects the full data point via payload[0].payload
  payload?: Array<{ payload: DataPoint }>;
}

function CustomTooltip({ active, payload }: TooltipInternalProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;

  return (
    <div
      className="bg-[#2A2A2E] border border-[#ffffff1a] rounded-xl px-4 py-3 shadow-xl"
      role="tooltip"
    >
      <p className="text-[#A1A1AA] text-xs mb-1">{point.date}</p>
      <p className="text-white text-sm font-semibold">
        {point.value.toLocaleString()} USDT
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SavingsGrowthChart() {
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>("30D");

  const data = mockData[activeTimeframe];

  const timeframes: Timeframe[] = ["7D", "30D", "ALL"];

  return (
    <div
      className="bg-[#1C1C1E] rounded-2xl p-6"
      aria-label="Savings growth chart"
    >
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold font-sora text-white">
            Savings Growth
          </h2>
          <p className="text-[#A1A1AA] text-sm mt-0.5">
            Cumulative savings over time
          </p>
        </div>

        {/* Timeframe toggle */}
        <div
          className="flex items-center gap-1 bg-[#2A2A2E] rounded-xl p-1 self-start sm:self-auto"
          role="group"
          aria-label="Select timeframe"
        >
          {timeframes.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setActiveTimeframe(tf)}
              aria-pressed={activeTimeframe === tf}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-offset-1 focus-visible:ring-offset-[#2A2A2E] ${
                activeTimeframe === tf
                  ? "bg-[#4B6B76] text-white"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[220px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            {/* Gradient fill */}
            <defs>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4B6B76" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#4B6B76" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff0f"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{ fill: "#A1A1AA", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              dy={8}
            />

            <YAxis
              tick={{ fill: "#A1A1AA", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : String(v)
              }
              width={40}
            />

            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              content={CustomTooltip as any}
              cursor={{ stroke: "#4B6B76", strokeWidth: 1, strokeDasharray: "4 2" }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#4B6B76"
              strokeWidth={2.5}
              fill="url(#savingsGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#4B6B76",
                stroke: "#1C1C1E",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
