"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { getHistoricalUsdRate } from "@/lib/historicalRates";
import { formatCurrency, formatNumber } from "@/lib/currencyFormat";
import ChartDataTable, { ChartViewToggle } from "@/components/charts/ChartDataTable";

export interface ContributionRecord {
  id: string;
  date: string;
  amount: number;
}

interface HistoricalContribution extends ContributionRecord {
  rate: number;
  estimated: boolean;
  fiatValue: number;
}

type DisplayMode = "fiat" | "crypto";

const FALLBACK_RATE = 1;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${date}T00:00:00`));
}

function formatUsd(value: number) {
  return formatCurrency(value, "USD", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ContributionFiatValueChart({ contributions }: { contributions: ContributionRecord[] }) {
  const [mode, setMode] = useState<DisplayMode>("fiat");
  const [rates, setRates] = useState<Record<string, number | null>>({});
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const chartId = useId();
  const titleId = `${chartId}-title`;
  const descId = `${chartId}-desc`;
  const tableId = `${chartId}-table`;

  useEffect(() => {
    let cancelled = false;
    const dates = [...new Set(contributions.map((contribution) => contribution.date))];

    if (dates.length === 0) {
      return () => { cancelled = true; };
    }

    Promise.all(dates.map(async (date) => [date, await getHistoricalUsdRate(date)] as const)).then((results) => {
      if (!cancelled) {
        setRates(Object.fromEntries(results));
      }
    });

    return () => { cancelled = true; };
  }, [contributions]);

  const requestedDates = new Set(contributions.map((contribution) => contribution.date));
  const isLoading = contributions.length > 0 && [...requestedDates].some((date) => !(date in rates));

  const points = useMemo<HistoricalContribution[]>(
    () => contributions.map((contribution) => {
      const rate = rates[contribution.date] ?? FALLBACK_RATE;
      return {
        ...contribution,
        rate,
        estimated: rates[contribution.date] === null,
        fiatValue: contribution.amount * rate,
      };
    }),
    [contributions, rates]
  );

  const maxValue = Math.max(...points.map((point) => mode === "fiat" ? point.fiatValue : point.amount), 1);
  const plottedPoints = points.map((point, index) => ({
    x: points.length === 1 ? 50 : 8 + (84 * index) / (points.length - 1),
    y: 88 - ((mode === "fiat" ? point.fiatValue : point.amount) / maxValue) * 72,
  }));
  const valueLabel = (point: HistoricalContribution) =>
    mode === "fiat" ? formatUsd(point.fiatValue) : formatCurrency(point.amount, "USDT");
  const chartDescription = points.length === 0
    ? "No contributions yet."
    : `Line chart of ${points.length} contributions from ${formatDate(points[0].date)} (${valueLabel(points[0])}) to ${formatDate(points[points.length - 1].date)} (${valueLabel(points[points.length - 1])}).`;
  const linePath = plottedPoints.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");

  return (
    <section className="rounded-2xl bg-[var(--modal)] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.28)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Contribution value</p>
          <h2 className="mt-2 text-xl font-bold font-sora text-[var(--text)]">Value at the time of each contribution</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Historical USDT to USD rates are looked up by contribution date.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">
          <div className="inline-flex rounded-full border border-[var(--ov-14)] bg-[var(--ov-07)] p-1" role="group" aria-label="Contribution value display">
            {(["fiat", "crypto"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={`rounded-full px-3 py-2 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${mode === option ? "bg-[var(--text)] text-[var(--bg)]" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
                aria-pressed={mode === option}
              >
                {option}
              </button>
            ))}
          </div>
          {points.length > 0 && (
            <ChartViewToggle
              showTable={showTable}
              onToggle={() => {
                setShowTable((value) => !value);
                setHoveredPoint(null);
              }}
              controls={tableId}
            />
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 flex h-[280px] items-center justify-center rounded-[1.5rem] border border-[var(--ov-10)] bg-[var(--surface)] text-sm text-[var(--muted)]" role="status">Loading contribution history...</div>
      ) : points.length === 0 ? (
        <div className="mt-6 flex h-[280px] items-center justify-center rounded-[1.5rem] border border-[var(--ov-10)] bg-[var(--surface)] px-6 text-center text-sm text-[var(--muted)]">No contribution history yet. Your historical value will appear after your first contribution.</div>
      ) : showTable ? (
        <div className="mt-6">
          <ChartDataTable
            id={tableId}
            caption="Contribution value at the time of each contribution"
            columns={[
              { key: "date", label: "Date" },
              { key: "amount", label: "Amount (USDT)", numeric: true },
              { key: "fiat", label: "Value (USD)", numeric: true },
              { key: "rate", label: "Rate (USD / USDT)", numeric: true },
            ]}
            rows={points.map((point) => ({
              date: formatDate(point.date),
              amount: formatNumber(point.amount),
              fiat: formatUsd(point.fiatValue),
              rate: `${formatUsd(point.rate)}${point.estimated ? " (estimated)" : ""}`,
            }))}
          />
        </div>
      ) : (
        <>
          <div className="relative mt-6 h-[280px] overflow-hidden rounded-[1.5rem] border border-[var(--ov-10)] bg-[var(--surface)] p-4 sm:p-6">
            {hoveredPoint !== null && points[hoveredPoint] && (
              <div className="absolute right-4 top-4 z-10 rounded-xl border border-[var(--ov-14)] bg-[var(--bg)] px-3 py-2 text-right text-xs shadow-xl sm:right-6 sm:top-6" role="status">
                <p className="font-medium text-[var(--chart-1)]">{formatDate(points[hoveredPoint].date)}</p>
                <p className="mt-1 text-[var(--text)]">{formatCurrency(points[hoveredPoint].amount, "USDT")}</p>
                <p className="text-[var(--text)]">{formatUsd(points[hoveredPoint].fiatValue)}</p>
                <p className="text-[var(--muted)]">Rate: {formatUsd(points[hoveredPoint].rate)} / USDT{points[hoveredPoint].estimated ? " (estimated)" : ""}</p>
              </div>
            )}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img" aria-labelledby={titleId} aria-describedby={descId}>
              <title id={titleId}>{`${mode === "fiat" ? "Fiat value" : "Crypto amount"} of contributions over time`}</title>
              <desc id={descId}>{chartDescription}</desc>
              {[16, 34, 52, 70, 88].map((tick) => <line key={tick} x1="0" x2="100" y1={tick} y2={tick} stroke="var(--chart-grid)" strokeDasharray="2 4" />)}
              <line x1="0" x2="100" y1="88" y2="88" stroke="var(--chart-axis)" />
              <path d={linePath} fill="none" stroke="var(--chart-1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {plottedPoints.map((point, index) => (
                <g key={points[index].id}>
                  <circle cx={point.x} cy={point.y} r="2.5" fill="var(--chart-1)" aria-hidden="true" />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="7"
                    fill="transparent"
                    tabIndex={0}
                    role="img"
                    onMouseEnter={() => setHoveredPoint(index)}
                    onFocus={() => setHoveredPoint(index)}
                    onBlur={() => setHoveredPoint(null)}
                    aria-label={`${formatDate(points[index].date)}: ${points[index].amount} USDT, ${formatUsd(points[index].fiatValue)}, rate ${formatUsd(points[index].rate)} per USDT`}
                  />
                </g>
              ))}
            </svg>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {points.map((point) => (
              <div key={point.id} className="rounded-xl bg-[var(--content)] p-3 text-sm" title={`${formatDate(point.date)}: ${point.amount} USDT, ${formatUsd(point.fiatValue)}, rate ${point.rate.toFixed(4)}`}>
                <div className="flex items-center justify-between gap-2 text-xs text-[var(--muted)]"><span>{formatDate(point.date)}</span>{point.estimated && <span className="text-amber-600 dark:text-amber-400">Estimated</span>}</div>
                <p className="mt-1 font-semibold text-[var(--text)]">{mode === "fiat" ? formatUsd(point.fiatValue) : formatCurrency(point.amount, "USDT")}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{formatCurrency(point.amount, "USDT")} at {formatUsd(point.rate)} / USDT</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">Hover or focus a contribution for its exact amount, fiat value, and rate. Estimated values use a 1.0000 USD fallback when historical data is unavailable.</p>
        </>
      )}
    </section>
  );
}