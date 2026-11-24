"use client";

import { useMemo, useState } from "react";
import { Calendar, CircleDollarSign, Flame, Share2, Trophy } from "lucide-react";
import { calculateAnnualSavingsSummary, getSummaryYears } from "@/lib/annualSummary";
import ShareMilestoneButton from "@/components/ui/ShareMilestoneButton";
import { useContributions } from "@/lib/hooks/useContributions";
import { usePayouts } from "@/lib/hooks/usePayouts";
import { Skeleton } from "@/components/ui/Skeleton";

const currentYear = new Date().getFullYear();

export default function AnnualSavingsSummary() {
  // Sourced from the typed API client (lib/api) via TanStack Query instead
  // of importing data/contributions.ts and data/payouts.ts directly.
  const { data: contributions, isLoading: contributionsLoading, isError: contributionsError } = useContributions();
  const { data: payouts, isLoading: payoutsLoading, isError: payoutsError } = usePayouts();
  const isLoading = contributionsLoading || payoutsLoading;
  const isError = contributionsError || payoutsError;

  const years = useMemo(() => getSummaryYears(), []);
  const [year, setYear] = useState(years.includes(currentYear) ? currentYear : years[0] ?? currentYear);
  const summary = useMemo(
    () => calculateAnnualSavingsSummary(year, contributions ?? [], payouts ?? []),
    [year, contributions, payouts]
  );

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-[var(--ov-10)] bg-[var(--content)] p-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-6 w-64" />
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-2xl border border-[var(--ov-10)] bg-[var(--content)] p-6" role="alert">
        <p className="text-sm text-[var(--muted)]">Couldn&apos;t load your annual savings summary right now.</p>
      </section>
    );
  }
  const shareData = {
    type: "annual_summary" as const,
    circleName: `${summary.year} Savings Wrapped`,
    amount: `${summary.totalContributed.toLocaleString()} USDT`,
    subtitle: `${summary.circlesCompleted} circles · ${summary.longestStreak}-contribution streak · biggest payout ${summary.biggestPayout.toLocaleString()} ${summary.biggestPayoutToken}`,
    date: `Annual summary · ${summary.year}`,
  };

  return (
    <section className="rounded-2xl border border-[var(--ov-10)] bg-[var(--content)] p-6" aria-labelledby="annual-savings-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6c5ce7]">Your year in savings</p>
          <h2 id="annual-savings-title" className="mt-1 text-xl font-bold font-sora text-[var(--text)]">Annual Savings Wrapped</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--muted)]">A transparent snapshot built from your recorded contributions and completed payouts. Partial history is shown as-is.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="summary-year" className="sr-only">Summary year</label>
          <div className="flex items-center gap-1 rounded-lg border border-[var(--ov-10)] bg-[var(--modal)] px-2 text-[var(--muted)]">
            <Calendar size={14} aria-hidden="true" />
            <select id="summary-year" value={year} onChange={(event) => setYear(Number(event.target.value))} className="bg-transparent py-2 text-xs text-[var(--text)] outline-none">
              {[...new Set([currentYear, ...years])].sort((a, b) => b - a).map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <ShareMilestoneButton milestone={shareData} variant="subtle" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={<CircleDollarSign size={17} />} label="Contributed" value={`${summary.totalContributed.toLocaleString()} USDT`} />
        <Metric icon={<Trophy size={17} />} label="Circles completed" value={String(summary.circlesCompleted)} />
        <Metric icon={<Flame size={17} />} label="Longest streak" value={`${summary.longestStreak} on-time`} />
        <Metric icon={<Share2 size={17} />} label="Biggest payout" value={`${summary.biggestPayout.toLocaleString()} ${summary.biggestPayoutToken}`} />
      </div>
      <p className="mt-4 text-[11px] text-[var(--muted)]">Based on {summary.contributionCount} recorded contribution{summary.contributionCount === 1 ? "" : "s"} and {summary.payoutCount} completed payout{summary.payoutCount === 1 ? "" : "s"} in {summary.year}.</p>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border border-[var(--ov-10)] bg-[var(--modal)] p-4"><div className="mb-3 text-[#6c5ce7]">{icon}</div><p className="text-[11px] text-[var(--muted)]">{label}</p><p className="mt-1 truncate text-sm font-semibold text-[var(--text)]">{value}</p></div>;
}
