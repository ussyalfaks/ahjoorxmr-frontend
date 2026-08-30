"use client";

import Link from "next/link";
import { Users, DollarSign, Clock, Check } from "lucide-react";
import CopyButton from "@/components/ui/CopyButton";
import { truncateAddress, type DiscoverCircle } from "@/data/circles";
import AutoPayStatusBadge from "@/components/circles/AutoPayStatusBadge";
import BookmarkButton from "@/components/circles/BookmarkButton";
import { useCircleComparison } from "@/contexts/CircleComparisonContext";

interface CircleGridCardProps {
  circle: DiscoverCircle;
  /** Show the "Join Circle" action (Discover tab) */
  showJoin?: boolean;
  onJoin?: (circle: DiscoverCircle) => void;
}

export default function CircleGridCard({
  circle,
  showJoin = false,
  onJoin,
}: CircleGridCardProps) {
  const fillPct = Math.round((circle.members.length / circle.totalSlots) * 100);
  const isFull = circle.members.length >= circle.totalSlots;

  const { isSelected, toggleCircle, isMaxSelected } = useCircleComparison();
  const selected = isSelected(circle.id);

  return (
    <article
      className={`bg-[var(--content)] rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 ${
        selected
          ? "ring-2 ring-[#4B6B76] border-[#4B6B76] shadow-md bg-[var(--content-hover)]"
          : "hover:bg-[var(--content-hover)]"
      }`}
    >
      {(circle.closed || isFull) && (
        <div
          className={`-mt-2 -mx-1 rounded-lg px-3 py-1.5 text-[11px] font-medium ${
            circle.closed
              ? "bg-[var(--ov-0a)] text-[var(--muted)]"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}
        >
          {circle.closed ? "This circle has closed" : "This circle is now full"}
        </div>
      )}
      {/* Name */}
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/dashboard/circles/${circle.id}`}
          className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
        >
          <h2 className="text-lg font-bold font-sora text-[var(--text)] leading-snug">
            {circle.name}
          </h2>
        </Link>
        {/* Actions & Badges */}
        <div className="flex shrink-0 items-center gap-1.5 mt-0.5">
          <AutoPayStatusBadge circleId={circle.id} />
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--ov-0a)] text-[var(--muted)]"
            aria-label={`${fillPct}% full`}
          >
            {fillPct}%
          </span>
          <BookmarkButton circleId={circle.id} circleName={circle.name} />
        </div>
      </div>

      {/* Creator & Compare Checkbox Row */}
      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
        <div className="flex items-center gap-1.5">
          <span>by</span>
          <span className="font-mono truncate max-w-[120px]">
            {truncateAddress(circle.creator)}
          </span>
          <CopyButton value={circle.creator} />
        </div>

        {/* Compare Checkbox */}
        <label
          htmlFor={`compare-grid-${circle.id}`}
          className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-[var(--muted)] hover:text-[var(--text)] select-none"
        >
          <input
            id={`compare-grid-${circle.id}`}
            type="checkbox"
            checked={selected}
            disabled={!selected && isMaxSelected}
            onChange={() => toggleCircle(circle.id)}
            className="rounded border-[var(--ov-1a)] text-[#4B6B76] focus:ring-[#4B6B76] w-3.5 h-3.5 cursor-pointer disabled:opacity-40"
          />
          <span className={selected ? "text-[#4B6B76] font-semibold" : ""}>
            Compare
          </span>
        </label>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[var(--muted)] text-xs mb-1.5">Members</p>
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-[var(--muted)] shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-[var(--text)]">
              {circle.members.length}/{circle.totalSlots}
            </span>
          </div>
        </div>
        <div>
          <p className="text-[var(--muted)] text-xs mb-1.5">Contribution</p>
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-[var(--muted)] shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-[var(--text)]">
              {circle.contribution}
            </span>
          </div>
        </div>
        <div>
          <p className="text-[var(--muted)] text-xs mb-1.5">Duration</p>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-[var(--muted)] shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-[var(--text)]">
              {circle.duration}
            </span>
          </div>
        </div>
      </div>

      {/* Member fill bar */}
      <div
        className="h-1 w-full rounded-full bg-[var(--ov-0a)] overflow-hidden"
        role="progressbar"
        aria-valuenow={circle.members.length}
        aria-valuemin={0}
        aria-valuemax={circle.totalSlots}
        aria-label={`${circle.members.length} of ${circle.totalSlots} slots filled`}
      >
        <div
          className="h-full rounded-full bg-[#4B6B76] transition-all"
          style={{ width: `${fillPct}%` }}
        />
      </div>

      {showJoin && (
        <button
          type="button"
          onClick={() => onJoin?.(circle)}
          className="mt-auto px-5 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--content)]"
        >
          Join Circle
        </button>
      )}
    </article>
  );
}

