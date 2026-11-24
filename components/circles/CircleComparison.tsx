"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  X,
  Columns,
  DollarSign,
  Clock,
  Users,
  Shield,
  Zap,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Check,
  type LucideIcon,
} from "lucide-react";
import { useCircleComparison } from "@/contexts/CircleComparisonContext";
import { MOCK_CIRCLES, DiscoverCircle, truncateAddress, CURRENT_WALLET } from "@/data/circles";
import CopyButton from "@/components/ui/CopyButton";
import AutoPayStatusBadge from "@/components/circles/AutoPayStatusBadge";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface CircleComparisonProps {
  allCircles?: DiscoverCircle[];
  onJoinCircle?: (circle: DiscoverCircle) => void;
}

/** Parses numeric contribution amount from string like "50 USDT" */
function parseAmount(str: string): number {
  const match = str.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

export default function CircleComparison({
  allCircles = MOCK_CIRCLES,
  onJoinCircle,
}: CircleComparisonProps) {
  const {
    selectedCircleIds,
    isComparisonOpen,
    closeComparison,
    removeCircle,
    clearSelection,
    toggleCircle,
  } = useCircleComparison();

  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, isComparisonOpen, closeComparison);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeComparison();
    }
    if (isComparisonOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isComparisonOpen, closeComparison]);

  if (!isComparisonOpen) return null;

  const selectedCircles = allCircles.filter((c) =>
    selectedCircleIds.includes(c.id)
  );

  const handleSelectRecommended = () => {
    clearSelection();
    // Select first 3 available circles
    allCircles.slice(0, 3).forEach((c) => toggleCircle(c.id));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-dialog-title"
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[var(--modal)] border border-[var(--ov-14)] shadow-2xl overflow-hidden text-[var(--text)]"
      >
        {/* Header Row */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--ov-0f)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4B6B76]/15 text-[#4B6B76] flex items-center justify-center">
              <Columns size={20} aria-hidden="true" />
            </div>
            <div>
              <h2
                id="comparison-dialog-title"
                className="text-xl font-bold font-sora text-[var(--text)]"
              >
                Compare Savings Circles
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Side-by-side comparison of pool terms, contribution amounts, and payout schedules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedCircles.length > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[var(--ov-10)] text-xs text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-08)] transition-colors"
              >
                <RotateCcw size={13} aria-hidden="true" />
                <span>Clear All</span>
              </button>
            )}
            <button
              type="button"
              onClick={closeComparison}
              className="p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-0a)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              aria-label="Close comparison"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {selectedCircles.length < 2 ? (
            /* Empty state when fewer than 2 circles are selected */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--ov-08)] border border-[var(--ov-10)] flex items-center justify-center text-[var(--muted)] mb-4">
                <Columns size={30} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold font-sora text-[var(--text)]">
                Select at least 2 circles to compare
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1.5 max-w-md">
                You currently have {selectedCircles.length} circle selected. Check the &ldquo;Compare&rdquo; box on circle cards in the discovery page to compare up to 3 circles side by side.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectRecommended}
                  className="px-5 py-2.5 rounded-xl bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  Select Sample Circles
                </button>
                <button
                  type="button"
                  onClick={closeComparison}
                  className="px-4 py-2.5 rounded-xl border border-[var(--ov-14)] text-xs font-medium text-[var(--text)] hover:bg-[var(--ov-08)] transition-colors"
                >
                  Back to Discovery
                </button>
              </div>
            </div>
          ) : (
            /* Comparison Grid Table */
            <div className="overflow-x-auto">
              <div
                className="grid gap-4 min-w-[620px]"
                style={{
                  gridTemplateColumns: `180px repeat(${selectedCircles.length}, minmax(200px, 1fr))`,
                }}
              >
                {/* Column Headers (Circle identity) */}
                <div className="flex flex-col justify-end pb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Feature / Metric
                </div>

                {selectedCircles.map((circle) => {
                  const isUserMember = circle.members.includes(CURRENT_WALLET);
                  const isFull = circle.members.length >= circle.totalSlots;
                  return (
                    <div
                      key={circle.id}
                      className="relative p-4 rounded-2xl bg-[var(--content)] border border-[var(--ov-10)] flex flex-col justify-between"
                    >
                      <button
                        type="button"
                        onClick={() => removeCircle(circle.id)}
                        className="absolute top-3 right-3 p-1 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-0a)] transition-colors"
                        title="Remove from comparison"
                        aria-label={`Remove ${circle.name}`}
                      >
                        <X size={15} aria-hidden="true" />
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5 mb-1 pr-6">
                          <AutoPayStatusBadge circleId={circle.id} />
                          {isUserMember && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                              Joined
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/dashboard/circles/${circle.id}`}
                          onClick={closeComparison}
                          className="text-base font-bold font-sora text-[var(--text)] hover:underline block truncate"
                        >
                          {circle.name}
                        </Link>

                        <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mt-1">
                          <span>by</span>
                          <span className="font-mono text-[11px] truncate max-w-[100px]">
                            {truncateAddress(circle.creator)}
                          </span>
                          <CopyButton value={circle.creator} />
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[var(--ov-08)]">
                        {isUserMember ? (
                          <Link
                            href={`/dashboard/circles/${circle.id}`}
                            onClick={closeComparison}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-xs font-semibold text-[var(--text)] transition-colors"
                          >
                            <span>Open Details</span>
                            <ArrowRight size={13} aria-hidden="true" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            disabled={isFull || circle.closed}
                            onClick={() => {
                              closeComparison();
                              onJoinCircle?.(circle);
                            }}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                              isFull || circle.closed
                                ? "bg-[var(--ov-08)] text-[var(--muted)] cursor-not-allowed"
                                : "bg-[#4B6B76] hover:bg-[#3D5A64] text-white cursor-pointer"
                            }`}
                          >
                            {circle.closed
                              ? "Closed"
                              : isFull
                              ? "Circle Full"
                              : "Join Circle"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Row 1: Contribution Amount */}
                <div className="py-3.5 px-2 flex items-center gap-2 border-t border-[var(--ov-08)] text-xs font-semibold text-[var(--muted)]">
                  <DollarSign size={15} className="text-[#4B6B76]" aria-hidden="true" />
                  <span>Contribution</span>
                </div>
                {selectedCircles.map((circle) => (
                  <div
                    key={circle.id}
                    className="py-3.5 px-4 flex items-center border-t border-[var(--ov-08)] font-sora font-bold text-sm text-[var(--text)]"
                  >
                    {circle.contribution}
                  </div>
                ))}

                {/* Row 2: Round Duration */}
                <div className="py-3.5 px-2 flex items-center gap-2 border-t border-[var(--ov-08)] text-xs font-semibold text-[var(--muted)]">
                  <Clock size={15} className="text-[#4B6B76]" aria-hidden="true" />
                  <span>Round Duration</span>
                </div>
                {selectedCircles.map((circle) => (
                  <div
                    key={circle.id}
                    className="py-3.5 px-4 flex items-center border-t border-[var(--ov-08)] text-xs font-medium text-[var(--text)]"
                  >
                    {circle.duration}
                  </div>
                ))}

                {/* Row 3: Estimated Pool Pot */}
                <div className="py-3.5 px-2 flex items-center gap-2 border-t border-[var(--ov-08)] text-xs font-semibold text-[var(--muted)]">
                  <TrendingUp size={15} className="text-[#4B6B76]" aria-hidden="true" />
                  <span>Estimated Total Pot</span>
                </div>
                {selectedCircles.map((circle) => {
                  const pot = parseAmount(circle.contribution) * circle.totalSlots;
                  return (
                    <div
                      key={circle.id}
                      className="py-3.5 px-4 flex items-center border-t border-[var(--ov-08)] text-xs font-bold text-emerald-500 font-mono"
                    >
                      {pot > 0 ? `${pot} USDT` : "—"}
                    </div>
                  );
                })}

                {/* Row 4: Participants & Fill Percentage */}
                <div className="py-3.5 px-2 flex items-center gap-2 border-t border-[var(--ov-08)] text-xs font-semibold text-[var(--muted)]">
                  <Users size={15} className="text-[#4B6B76]" aria-hidden="true" />
                  <span>Participants & Slots</span>
                </div>
                {selectedCircles.map((circle) => {
                  const fillPct = Math.round(
                    (circle.members.length / circle.totalSlots) * 100
                  );
                  return (
                    <div
                      key={circle.id}
                      className="py-3.5 px-4 flex flex-col justify-center gap-1.5 border-t border-[var(--ov-08)]"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[var(--text)]">
                          {circle.members.length} / {circle.totalSlots} members
                        </span>
                        <span className="text-[10px] text-[var(--muted)] font-mono">
                          {fillPct}%
                        </span>
                      </div>
                      <div
                        className="w-full h-1.5 bg-[var(--ov-0a)] rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={fillPct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full bg-[#4B6B76] rounded-full"
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Row 5: Round Progress */}
                <div className="py-3.5 px-2 flex items-center gap-2 border-t border-[var(--ov-08)] text-xs font-semibold text-[var(--muted)]">
                  <Clock size={15} className="text-[#4B6B76]" aria-hidden="true" />
                  <span>Current Round</span>
                </div>
                {selectedCircles.map((circle) => (
                  <div
                    key={circle.id}
                    className="py-3.5 px-4 flex items-center border-t border-[var(--ov-08)] text-xs font-medium text-[var(--text)]"
                  >
                    {circle.currentRound && circle.totalRounds
                      ? `Round ${circle.currentRound} of ${circle.totalRounds}`
                      : "Round 1"}
                  </div>
                ))}

                {/* Row 6: Next Payout */}
                <div className="py-3.5 px-2 flex items-center gap-2 border-t border-[var(--ov-08)] text-xs font-semibold text-[var(--muted)]">
                  <Zap size={15} className="text-[#4B6B76]" aria-hidden="true" />
                  <span>Next Payout</span>
                </div>
                {selectedCircles.map((circle) => (
                  <div
                    key={circle.id}
                    className="py-3.5 px-4 flex items-center border-t border-[var(--ov-08)] text-xs font-medium text-[var(--text)]"
                  >
                    {circle.nextPayout ?? circle.duration}
                  </div>
                ))}

                {/* Row 7: AutoPay Support */}
                <div className="py-3.5 px-2 flex items-center gap-2 border-t border-[var(--ov-08)] text-xs font-semibold text-[var(--muted)]">
                  <Zap size={15} className="text-[#4B6B76]" aria-hidden="true" />
                  <span>AutoPay Capable</span>
                </div>
                {selectedCircles.map((circle) => (
                  <div
                    key={circle.id}
                    className="py-3.5 px-4 flex items-center gap-1.5 border-t border-[var(--ov-08)] text-xs text-emerald-500 font-medium"
                  >
                    <Check size={14} aria-hidden="true" />
                    <span>Enabled</span>
                  </div>
                ))}

                {/* Row 8: Security & Settlement */}
                <div className="py-3.5 px-2 flex items-center gap-2 border-t border-[var(--ov-08)] text-xs font-semibold text-[var(--muted)]">
                  <Shield size={15} className="text-[#4B6B76]" aria-hidden="true" />
                  <span>Settlement Security</span>
                </div>
                {selectedCircles.map((circle) => (
                  <div
                    key={circle.id}
                    className="py-3.5 px-4 flex items-center border-t border-[var(--ov-08)] text-xs text-[var(--muted)]"
                  >
                    Multi-sig Escrow
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="px-6 py-3.5 bg-[var(--ov-05)] border-t border-[var(--ov-0f)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--muted)] shrink-0">
          <span>
            Comparing {selectedCircles.length} of 3 maximum circles.
          </span>
          <button
            type="button"
            onClick={closeComparison}
            className="px-4 py-1.5 rounded-xl border border-[var(--ov-10)] hover:bg-[var(--ov-0a)] text-[var(--text)] transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
