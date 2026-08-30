"use client";

import Link from "next/link";
import { Users, DollarSign, Clock, ArrowRight } from "lucide-react";
import { truncateAddress, type DiscoverCircle } from "@/data/circles";
import AutoPayStatusBadge from "@/components/circles/AutoPayStatusBadge";
import BookmarkButton from "@/components/circles/BookmarkButton";
import { useCircleComparison } from "@/contexts/CircleComparisonContext";

interface CircleListRowProps {
  circle: DiscoverCircle;
  showJoin?: boolean;
  onJoin?: (circle: DiscoverCircle) => void;
  /** Zebra shading — pass true for even rows */
  even?: boolean;
}

export default function CircleListRow({
  circle,
  showJoin = false,
  onJoin,
  even = false,
}: CircleListRowProps) {
  const fillPct = Math.round((circle.members.length / circle.totalSlots) * 100);
  const slotsLeft = circle.totalSlots - circle.members.length;

  const { isSelected, toggleCircle, isMaxSelected } = useCircleComparison();
  const selected = isSelected(circle.id);

  return (
    <div
      className={`grid items-center gap-x-4 gap-y-2 px-4 py-3.5 rounded-xl transition-all duration-150
        hover:bg-[var(--content-hover)]
        ${selected ? "bg-[var(--ov-08)] ring-1 ring-[#4B6B76]/60" : even ? "bg-[var(--ov-03)]" : "bg-transparent"}
        /* Responsive column layout:
           mobile  : stacked (name + meta)
           sm+     : compare | name | contribution | members | round | next payout | action
        */
        grid-cols-[auto_1fr_auto]
        sm:grid-cols-[28px_minmax(160px,2fr)_110px_100px_80px_100px_auto]`}
      role="row"
    >
      {/* ---- Compare checkbox column ---- */}
      <div className="flex items-center justify-center">
        <label
          htmlFor={`compare-list-${circle.id}`}
          className="cursor-pointer p-1"
          title="Select to compare"
        >
          <input
            id={`compare-list-${circle.id}`}
            type="checkbox"
            checked={selected}
            disabled={!selected && isMaxSelected}
            onChange={() => toggleCircle(circle.id)}
            aria-label={`Compare ${circle.name}`}
            className="rounded border-[var(--ov-1a)] text-[#4B6B76] focus:ring-[#4B6B76] w-3.5 h-3.5 cursor-pointer disabled:opacity-40"
          />
        </label>
      </div>

      {/* ---- Name + creator (always visible) ---- */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={`/dashboard/circles/${circle.id}`}
            className="text-sm font-semibold text-[var(--text)] hover:underline truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
          >
            {circle.name}
          </Link>
          <AutoPayStatusBadge circleId={circle.id} />
          {(circle.closed || slotsLeft <= 0) && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                circle.closed
                  ? "bg-[var(--ov-0a)] text-[var(--muted)]"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              {circle.closed ? "Closed" : "Full"}
            </span>
          )}
        </div>
        <span className="text-xs text-[var(--muted)] font-mono truncate">
          {truncateAddress(circle.creator)}
        </span>
      </div>

      {/* ---- Action (always visible, right column on mobile) ---- */}
      <div className="flex items-center justify-end gap-1.5 sm:order-last">
        <BookmarkButton circleId={circle.id} circleName={circle.name} />
        {showJoin ? (
          <button
            type="button"
            onClick={() => onJoin?.(circle)}
            className="px-3 py-1.5 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-xs font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] whitespace-nowrap"
          >
            Join
          </button>
        ) : (
          <Link
            href={`/dashboard/circles/${circle.id}`}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-0a)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            aria-label={`Open ${circle.name}`}
          >
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        )}
      </div>

      {/* ---- Contribution ---- */}
      <div className="hidden sm:flex flex-col gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Contribution
        </span>
        <div className="flex items-center gap-1">
          <DollarSign size={12} className="text-[var(--muted)] shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold text-[var(--text)] tabular-nums">
            {circle.contribution}
          </span>
        </div>
      </div>

      {/* ---- Members + fill bar ---- */}
      <div className="hidden sm:flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Members
        </span>
        <div className="flex items-center gap-1.5">
          <Users size={12} className="text-[var(--muted)] shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold text-[var(--text)] tabular-nums">
            {circle.members.length}/{circle.totalSlots}
          </span>
        </div>
        {/* Mini fill bar */}
        <div
          className="h-0.5 w-full rounded-full bg-[var(--ov-0a)] overflow-hidden"
          role="progressbar"
          aria-valuenow={circle.members.length}
          aria-valuemin={0}
          aria-valuemax={circle.totalSlots}
          aria-label={`${fillPct}% full`}
        >
          <div
            className="h-full rounded-full bg-[#4B6B76]"
            style={{ width: `${fillPct}%` }}
          />
        </div>
        {slotsLeft > 0 && (
          <span className="text-[10px] text-[var(--faint)]">
            {slotsLeft} slot{slotsLeft !== 1 ? "s" : ""} left
          </span>
        )}
      </div>

      {/* ---- Round ---- */}
      <div className="hidden sm:flex flex-col gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Round
        </span>
        {circle.currentRound !== undefined && circle.totalRounds !== undefined ? (
          <span className="text-sm font-semibold text-[var(--text)] tabular-nums">
            {circle.currentRound}/{circle.totalRounds}
          </span>
        ) : (
          <span className="text-sm text-[var(--faint)]">—</span>
        )}
      </div>

      {/* ---- Next payout ---- */}
      <div className="hidden sm:flex flex-col gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Next payout
        </span>
        <div className="flex items-center gap-1">
          <Clock size={12} className="text-[var(--muted)] shrink-0" aria-hidden="true" />
          <span className="text-sm text-[var(--text)]">
            {circle.nextPayout ?? circle.duration}
          </span>
        </div>
      </div>
    </div>
  );
}

