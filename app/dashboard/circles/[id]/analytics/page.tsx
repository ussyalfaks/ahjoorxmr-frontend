"use client";

import { use, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import Link from "next/link";

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
});

function ContributionTrendChart({ rounds }: { rounds: Round[] }) {
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

  return (
    <div className="rounded-2xl bg-[var(--modal)] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Contribution Trend</p>
        <h3 className="mt-2 text-xl font-bold font-sora text-[var(--text)]">Contributions per round over time</h3>
      </div>

      <div className="mt-6 h-[280px] rounded-[1.5rem] border border-[var(--ov-10)] bg-[var(--surface)] p-6">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Contribution trend chart">
          <defs>
            <linearGradient id="contribution-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#5EEAD4" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="contribution-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5EEAD4" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((tick) => (
            <line key={tick} x1="0" x2="100" y1={tick} y2={tick} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />
          ))}

          {/* Axes */}
          <line x1="0" x2="100" y1={height - padding} y2={height - padding} stroke="rgba(255,255,255,0.14)" />
          <line x1={padding} x2={padding} y1="0" y2={height - padding} stroke="rgba(255,255,255,0.08)" />

          {/* Area fill */}
          <path d={`${linePath} L${points[points.length - 1].x},${height - padding} L${padding},${height - padding} Z`} fill="url(#contribution-area)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="url(#contribution-line)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2" fill="#5EEAD4" />
          ))}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {rounds.map((round) => (
          <div key={round.round} className="bg-[var(--content)] rounded-lg p-3">
            <p className="text-xs text-[var(--muted)] font-medium mb-1">Round {round.round}</p>
            <p className="text-sm font-semibold text-[var(--text)]">{round.contributions.toLocaleString()} USDT</p>
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
                <div className="flex-1 h-2 bg-[var(--ov-0a)] rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 dark:bg-green-400" style={{ width: `${onTimePercent}%` }} />
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

function StatCard({ icon: Icon, label, value, subtext }: { icon: React.ComponentType<{ size: number; className: string }>; label: string; value: string; subtext?: string }) {
  return (
    <div className="bg-[var(--content)] rounded-2xl p-6 border border-[var(--ov-05)]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted)]">{label}</p>
          <p className="mt-3 text-2xl font-bold text-[var(--text)]">{value}</p>
          {subtext && <p className="mt-1 text-xs text-[var(--muted)]">{subtext}</p>}
        </div>
        <div className="w-10 h-10 bg-[var(--ov-0a)] rounded-lg flex items-center justify-center">
          <Icon size={20} className="text-[var(--accent)]" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default function CircleAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "all">("all");

  const analytics = useMemo(() => generateMockAnalytics(id), [id]);

  const emptyState = analytics.rounds.length === 0;

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/dashboard/circles/${id}`}
          className="flex items-center gap-2 px-4 py-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-0a)] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span className="text-sm">Back</span>
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BarChart3 size={24} className="text-[var(--accent)]" aria-hidden="true" />
          <h1 className="text-3xl font-bold font-sora text-[var(--text)]">Analytics</h1>
        </div>
        <p className="text-[var(--muted)]">{analytics.circleName} — contribution trends, payouts, and member reliability</p>
      </div>

      {emptyState ? (
        <div className="rounded-2xl border border-[var(--ov-0f)] bg-[var(--surface)] p-12 text-center">
          <BarChart3 size={32} className="mx-auto mb-4 text-[var(--muted)]" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2">No data yet</h2>
          <p className="text-[var(--muted)] max-w-md mx-auto">Complete your first round to see contribution trends, payout history, and member reliability analytics.</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={TrendingUp} label="Total Saved" value={`${analytics.totalSaved} USDT`} subtext="Cumulative contributions" />
            <StatCard icon={DollarSign} label="Total Paid Out" value={`${analytics.totalPaidOut} USDT`} subtext="Distributed to members" />
            <StatCard icon={Users} label="Members" value={analytics.participantReliability.length.toString()} subtext="Active participants" />
            <StatCard icon={BarChart3} label="Completed Rounds" value={analytics.rounds.length.toString()} subtext="Full cycles finished" />
          </div>

          {/* Charts */}
          <div className="space-y-8">
            <ContributionTrendChart rounds={analytics.rounds} />
            <ParticipantReliabilityChart participants={analytics.participantReliability} />
          </div>
        </>
      )}
    </div>
  );
}
