"use client";

import { use, useId, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import Link from "next/link";
import ContributionFiatValueChart, { type ContributionRecord } from "@/components/charts/ContributionFiatValueChart";
import ChartDataTable, { ChartViewToggle } from "@/components/charts/ChartDataTable";
import { formatCurrency, formatNumber } from "@/lib/currencyFormat";

interface Round {
  round: number;
  contributions: number;
  contributors: number;
  paidOut: number;
  completedAt: string;
}

interface ParticipantReliability {
  address: string;
  name: string;
  onTimeCount: number;
  lateCount: number;
  reliabilityScore: number;
}

interface AnalyticsData {
  circleId: string;
  circleName: string;
  rounds: Round[];
  participantReliability: ParticipantReliability[];
  totalSaved: number;
  totalPaidOut: number;
  contributions: ContributionRecord[];
}

// Mock analytics data shaped to match on-chain response
const generateMockAnalytics = (circleId: string): AnalyticsData => ({
  circleId,
  circleName: "Family savings",
  rounds: [
    { round: 1, contributions: 100, contributors: 2, paidOut: 100, completedAt: "2024-01-15" },
    { round: 2, contributions: 100, contributors: 2, paidOut: 100, completedAt: "2024-01-22" },
    { round: 3, contributions: 100, contributors: 2, paidOut: 0, completedAt: "2024-01-29" },
  ],
  participantReliability: [
    { address: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b", name: "You", onTimeCount: 3, lateCount: 0, reliabilityScore: 100 },
    { address: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f", name: "Emeka", onTimeCount: 2, lateCount: 1, reliabilityScore: 67 },
  ],
  totalSaved: 300,
  totalPaidOut: 200,
  contributions: [
    { id: "contribution-1", date: "2024-01-15", amount: 50 },
    { id: "contribution-2", date: "2024-01-22", amount: 50 },
    { id: "contribution-3", date: "2024-01-29", amount: 50 },
  ],
});

// Known circle IDs; unknown IDs should render the not-found page.
const KNOWN_CIRCLE_IDS = new Set<string>(["family-savings"]);

function ContributionTrendChart({ rounds }: { rounds: Round[] }) {
  const [showTable, setShowTable] = useState(false);
  const chartId = useId();
  const titleId = `${chartId}-title`;
  const descId = `${chartId}-desc`;
  const tableId = `${chartId}-table`;

  if (rounds.length === 0) {
    return (
      <div className="h-[300px] rounded-2xl border border-[var(--ov-0f)] bg-[var(--surface)] flex items-center justify-center">
        <p className="text-[var(--muted)]">No rounds completed yet</p>
      </div>
    );
  }

  const maxContribution = Math.max(...rounds.map((r) => r.contributions));
  const padding = 40;
  const width = 100;
  const height = 100;
  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;

  const points = rounds.map((round, index) => ({
    x: padding + (availableWidth * index) / Math.max(rounds.length - 1, 1),
    y: height - padding - (round.contributions / maxContribution) * availableHeight,
    contribution: round.contributions,
  }));

  const linePath = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");
  const chartDescription = `Line chart of ${rounds.length} rounds. Contributions ranged from ${formatCurrency(Math.min(...rounds.map((r) => r.contributions)), "USDT")} to ${formatCurrency(maxContribution, "USDT")} per round.`;

  return (
    <div className="rounded-2xl bg-[var(--modal)] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Contribution Trend</p>
          <h3 className="mt-2 text-xl font-bold font-sora text-[var(--text)]">Contributions per round over time</h3>
        </div>
        <div className="self-start">
          <ChartViewToggle showTable={showTable} onToggle={() => setShowTable((value) => !value)} controls={tableId} />
        </div>
      </div>

      {showTable ? (
        <div className="mt-6">
          <ChartDataTable
            id={tableId}
            caption="Contributions per round"
            columns={[
              { key: "round", label: "Round" },
              { key: "contributions", label: "Contributions (USDT)", numeric: true },
              { key: "contributors", label: "Contributors", numeric: true },
              { key: "paidOut", label: "Paid out (USDT)", numeric: true },
              { key: "completedAt", label: "Completed" },
            ]}
            rows={rounds.map((round) => ({
              round: `Round ${round.round}`,
              contributions: formatNumber(round.contributions),
              contributors: round.contributors,
              paidOut: formatNumber(round.paidOut),
              completedAt: round.completedAt,
            }))}
          />
        </div>
      ) : (
        <div className="mt-6 h-[280px] rounded-[1.5rem] border border-[var(--ov-10)] bg-[var(--surface)] p-6">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" role="img" aria-labelledby={titleId} aria-describedby={descId}>
            <title id={titleId}>Contribution trend chart</title>
            <desc id={descId}>{chartDescription}</desc>
            <defs>
              <linearGradient id="contribution-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="contribution-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--chart-1)" />
                <stop offset="100%" stopColor="var(--chart-2)" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((tick) => (
              <line key={tick} x1="0" x2="100" y1={tick} y2={tick} stroke="var(--chart-grid)" strokeDasharray="2 4" />
            ))}

            {/* Axes */}
            <line x1="0" x2="100" y1={height - padding} y2={height - padding} stroke="var(--chart-axis)" />
            <line x1={padding} x2={padding} y1="0" y2={height - padding} stroke="var(--chart-grid)" />

            {/* Area fill */}
            <path d={`${linePath} L${points[points.length - 1].x},${height - padding} L${padding},${height - padding} Z`} fill="url(#contribution-area)" />

            {/* Line */}
            <path d={linePath} fill="none" stroke="url(#contribution-line)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Points */}
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="2" fill="var(--chart-1)" />
            ))}
          </svg>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {rounds.map((round) => (
          <div key={round.round} className="bg-[var(--content)] rounded-lg p-3">
            <p className="text-xs text-[var(--muted)] font-medium mb-1">Round {round.round}</p>
            <p className="text-sm font-semibold text-[var(--text)]">{formatCurrency(round.contributions, "USDT")}</p>
            <p className="text-xs text-[var(--muted)]">{round.contributors} contributors</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ParticipantReliabilityChart({ participants }: { participants: ParticipantReliability[] }) {
  if (participants.length === 0) {
    return (
      <div className="h-[300px] rounded-2xl border border-[var(--ov-0f)] bg-[var(--surface)] flex items-center justify-center">
        <p className="text-[var(--muted)]">No participants yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[var(--modal)] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Reliability Breakdown</p>
        <h3 className="mt-2 text-xl font-bold font-sora text-[var(--text)]">Participant on-time vs late contributions</h3>
      </div>

      <div className="mt-6 space-y-6">
        {participants.map((participant) => {
          const total = participant.onTimeCount + participant.lateCount;
          const onTimePercent = total > 0 ? (participant.onTimeCount / total) * 100 : 0;

          return (
            <div key={participant.address} className="bg-[var(--content)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{participant.name}</p>
                  <p className="text-xs font-mono text-[var(--muted)]">{participant.address.slice(0, 10)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[var(--text)]">{participant.reliabilityScore}%</p>
                  <p className="text-xs text-[var(--muted)]">Reliability</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex-1 h-2 bg-[var(--ov-0a)] rounded-full overflow-hidden"
                  role="img"
                  aria-label={`${participant.name}: ${Math.round(onTimePercent)}% of contributions on time`}
                >
                  <div className="h-full bg-green-700 dark:bg-green-400" style={{ width: `${onTimePercent}%` }} />
                </div>
              </div>

              <div className="flex gap-4 text-xs">
                <div>
                  <span className="text-green-600 dark:text-green-400 font-medium">{participant.onTimeCount}</span>
                  <span className="text-[var(--muted)] ml-1">on-time</span>
                </div>
                <div>
                  <span className="text-red-600 dark:text-red-400 font-medium">{participant.lateCount}</span>
                  <span className="text-[var(--muted)] ml-1">late</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CircleAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  if (!KNOWN_CIRCLE_IDS.has(id)) {
    notFound();
  }

  const analytics = useMemo(() => generateMockAnalytics(id), [id]);
  const [activeTab, setActiveTab] = useState<"overview" | "reliability">("overview");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/circles/${id}`}
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to circle
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold font-sora text-[var(--text)]">{analytics.circleName} Analytics</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Track contributions, payouts, and participant reliability.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[var(--modal)] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-[0.2em]">Total Saved</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-[var(--text)]">{formatCurrency(analytics.totalSaved, "USDT")}</p>
        </div>
        <div className="rounded-2xl bg-[var(--modal)] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-[0.2em]">Total Paid Out</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-[var(--text)]">{formatCurrency(analytics.totalPaidOut, "USDT")}</p>
        </div>
        <div className="rounded-2xl bg-[var(--modal)] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-[0.2em]">Participants</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-[var(--text)]">{analytics.participantReliability.length}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "overview"
              ? "bg-[var(--text)] text-[var(--surface)]"
              : "bg-[var(--content)] text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("reliability")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "reliability"
              ? "bg-[var(--text)] text-[var(--surface)]"
              : "bg-[var(--content)] text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          <Users className="h-4 w-4" />
          Reliability
        </button>
      </div>

      {activeTab === "overview" ? (
        <div className="space-y-6">
          <ContributionTrendChart rounds={analytics.rounds} />
          <ContributionFiatValueChart contributions={analytics.contributions} />
        </div>
      ) : (
        <ParticipantReliabilityChart participants={analytics.participantReliability} />
      )}
    </div>
  );
}
