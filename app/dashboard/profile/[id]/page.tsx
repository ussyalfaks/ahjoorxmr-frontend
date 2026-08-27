import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleCheck, ShieldCheck, TriangleAlert } from "lucide-react";
import { getParticipantProfile, getTrustScore } from "@/lib/participantProfile";

function formatAddress(address: string) {
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

export default async function ParticipantProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const address = decodeURIComponent(id);
  const profile = getParticipantProfile(address);
  const trust = getTrustScore(profile);
  const onTimePercent = Math.round(trust.onTimeRate * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-20 md:pb-0">
      <Link
        href="/dashboard/leaderboard"
        className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to leaderboard
      </Link>

      <header className="rounded-3xl bg-[var(--content)] p-6 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Public reliability profile</p>
            <h1 className="mt-3 text-3xl font-bold font-sora text-[var(--text)]">{profile.displayName}</h1>
            <p className="mt-2 break-all font-mono text-sm text-[var(--muted)]">{formatAddress(profile.address)}</p>
            <p className="mt-4 text-sm text-[var(--muted)]">Member since {profile.memberSince}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-[var(--modal)] px-4 py-3" aria-label={`Trust score ${trust.score} out of 100, ${trust.label}`}>
            <ShieldCheck size={28} className="text-green-600 dark:text-green-400" aria-hidden="true" />
            <div>
              <p className="text-2xl font-bold text-[var(--text)]">{trust.score}/100</p>
              <p className="text-xs font-semibold text-green-700 dark:text-green-400">{trust.label}</p>
            </div>
          </div>
        </div>
      </header>

      <section aria-labelledby="reliability-heading">
        <h2 id="reliability-heading" className="mb-4 text-lg font-bold font-sora text-[var(--text)]">Reliability at a glance</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-[var(--content)] p-5">
            <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" aria-hidden="true" />
            <p className="mt-4 text-2xl font-bold text-[var(--text)]">{onTimePercent}%</p>
            <p className="mt-1 text-sm text-[var(--muted)]">On-time contributions</p>
            <p className="mt-2 text-xs text-[var(--muted)]">{profile.onTimeContributions} of {profile.totalContributions} contributions</p>
          </div>
          <div className="rounded-2xl bg-[var(--content)] p-5">
            <CircleCheck size={20} className="text-[var(--accent)]" aria-hidden="true" />
            <p className="mt-4 text-2xl font-bold text-[var(--text)]">{profile.circlesCompleted}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Circles completed</p>
          </div>
          <div className="rounded-2xl bg-[var(--content)] p-5">
            <TriangleAlert size={20} className={profile.disputes ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"} aria-hidden="true" />
            <p className="mt-4 text-2xl font-bold text-[var(--text)]">{profile.disputes}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Disputes raised</p>
          </div>
        </div>
      </section>

      <p className="text-xs leading-5 text-[var(--muted)]">Trust scores summarize public contribution history, completed circles, and disputes. They are informational and may change as more activity settles.</p>
    </div>
  );
}