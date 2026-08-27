import Link from "next/link";
import { ArrowLeft, CalendarCheck, Users, Wallet } from "lucide-react";
import { mockCircles } from "@/lib/circles";

function formatSaved(circle: (typeof mockCircles)[number]) {
  if (circle.totalSaved) return circle.totalSaved;
  const amount = Number(circle.contribution.replace(/[^\d.]/g, ""));
  return `${(amount * circle.members.length).toLocaleString()} USDT`;
}

export default function CircleArchivePage() {
  const completedCircles = mockCircles.filter((circle) => circle.status === "completed");

  return (
    <div className="max-w-5xl space-y-8 pb-20 md:pb-0">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/circles"
          className="rounded text-[var(--muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          aria-label="Back to Circles"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">Circle history</p>
          <h1 className="mt-1 text-2xl font-bold font-sora text-[var(--text)]">Completed Circles</h1>
        </div>
      </div>

      {completedCircles.length === 0 ? (
        <section className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--ov-14)] bg-[var(--content)] px-6 py-24 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ov-0a)]" aria-hidden="true">
            <CalendarCheck size={26} className="text-[var(--muted)]" />
          </div>
          <h2 className="text-lg font-bold font-sora text-[var(--text)]">No completed circles yet</h2>
          <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
            Circles will appear here after every round has been paid out.
          </p>
          <Link
            href="/dashboard/circles"
            className="mt-6 rounded-lg bg-[#4B6B76] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3D5A64] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            View active circles
          </Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {completedCircles.map((circle) => (
            <article key={circle.id} className="flex flex-col gap-5 rounded-2xl bg-[var(--content)] p-6">
              <div>
                <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Completed
                </span>
                <h2 className="mt-3 text-lg font-bold font-sora text-[var(--text)]">{circle.name}</h2>
              </div>

              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="mb-1 flex items-center gap-1.5 text-xs text-[var(--muted)]"><Wallet size={13} aria-hidden="true" />Total saved</dt>
                  <dd className="font-semibold text-[var(--text)]">{formatSaved(circle)}</dd>
                </div>
                <div>
                  <dt className="mb-1 flex items-center gap-1.5 text-xs text-[var(--muted)]"><Users size={13} aria-hidden="true" />Participants</dt>
                  <dd className="font-semibold text-[var(--text)]">{circle.members.length}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="mb-1 flex items-center gap-1.5 text-xs text-[var(--muted)]"><CalendarCheck size={13} aria-hidden="true" />Completed</dt>
                  <dd className="font-semibold text-[var(--text)]">{circle.completedAt ?? "All rounds paid out"}</dd>
                </div>
              </dl>

              <div className="mt-auto flex gap-2">
                <Link
                  href={`/dashboard/circles/${circle.id}`}
                  className="flex-1 rounded-lg bg-[#4B6B76] px-3 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#3D5A64] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                >
                  View details
                </Link>
                <Link
                  href={`/dashboard/circles/${circle.id}/analytics`}
                  className="rounded-lg bg-[var(--ov-0a)] px-3 py-2.5 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--ov-14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                >
                  Analytics
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
