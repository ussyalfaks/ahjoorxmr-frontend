"use client";

import Link from "next/link";
import { Users, DollarSign, Clock } from "lucide-react";
import CopyButton from "@/components/ui/CopyButton";
import { truncateAddress, type DiscoverCircle } from "@/data/circles";
import AutoPayStatusBadge from "@/components/circles/AutoPayStatusBadge";

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

  return (
    <article className="bg-[var(--content)] rounded-2xl p-6 flex flex-col gap-4 hover:bg-[var(--content-hover)] transition-colors">
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
        {/* Slot fill badge */}
        <div className="flex shrink-0 items-center gap-1.5 mt-0.5">
          <AutoPayStatusBadge circleId={circle.id} />
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--ov-0a)] text-[var(--muted)]"
            aria-label={`${fillPct}% full`}
          >
            {fillPct}%
          </span>
        </div>
      </div>

      {/* Creator */}
      <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
        <span>by</span>
        <span className="font-mono truncate max-w-[140px]">
          {truncateAddress(circle.creator)}
        </span>
        <CopyButton value={circle.creator} />
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
