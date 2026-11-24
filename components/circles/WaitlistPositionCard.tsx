"use client";

import { useEffect, useState } from "react";
import { Clock3, ListOrdered } from "lucide-react";
import {
  JOIN_REQUESTS_UPDATED_EVENT,
  estimateWaitPerSlot,
  formatEstimatedWait,
  getWaitlistPosition,
  leaveWaitlist,
  type WaitlistPosition,
} from "@/lib/joinRequests";

interface Props {
  circleId: string;
  currentWallet: string;
  /** Renders a "you're not on a waitlist" note instead of nothing when there's no pending request. */
  showEmptyState?: boolean;
}

export default function WaitlistPositionCard({ circleId, currentWallet, showEmptyState = false }: Props) {
  const [waitlist, setWaitlist] = useState<WaitlistPosition | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    function sync() {
      setWaitlist(getWaitlistPosition(circleId, currentWallet));
    }
    sync();
    window.addEventListener(JOIN_REQUESTS_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(JOIN_REQUESTS_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [circleId, currentWallet]);

  if (!waitlist) {
    if (!showEmptyState) return null;
    return (
      <div className="rounded-2xl bg-[var(--content)] p-6" aria-live="polite">
        <p className="text-sm text-[var(--muted)]">You&apos;re not currently on a waitlist for this circle.</p>
      </div>
    );
  }

  async function handleLeave() {
    setLeaving(true);
    try {
      leaveWaitlist(circleId, currentWallet);
    } finally {
      setLeaving(false);
    }
  }

  const { estimatedMs, sampleSize } = estimateWaitPerSlot(circleId);
  // Naive scaling: assume roughly one slot needs to open per position ahead of you.
  const scaledEstimate = estimatedMs !== null ? estimatedMs * waitlist.position : null;

  return (
    <section
      className="rounded-2xl bg-[var(--content)] p-6 space-y-4"
      aria-labelledby="waitlist-position-heading"
    >
      <div className="flex items-center gap-2">
        <ListOrdered size={18} className="text-[#4B6B76]" aria-hidden="true" />
        <h2 id="waitlist-position-heading" className="text-lg font-bold font-sora text-[var(--text)]">
          Waitlist Position
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div>
          <p className="text-3xl font-bold font-sora text-[var(--text)]">
            #{waitlist.position}
            <span className="text-base font-normal text-[var(--muted)]"> of {waitlist.totalPending}</span>
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">Your place in the join-request queue</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Clock3 size={16} aria-hidden="true" />
          <div>
            <p className="text-[var(--text)] font-medium">{formatEstimatedWait(scaledEstimate)}</p>
            <p className="text-[10px] uppercase tracking-wide">
              {sampleSize > 0 ? "Estimate based on past turnover" : "Estimate"}
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--muted)]">
        You&apos;ll move up as other requests are approved or as participants ahead of you drop off. This is a
        best-effort estimate, not a guarantee.
      </p>

      <button
        type="button"
        onClick={handleLeave}
        disabled={leaving}
        className="text-sm font-medium text-red-400 hover:text-red-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {leaving ? "Leaving…" : "Leave waitlist"}
      </button>
    </section>
  );
}