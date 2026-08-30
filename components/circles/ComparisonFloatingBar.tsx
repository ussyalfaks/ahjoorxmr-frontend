"use client";

import { Columns, X, ArrowRight, Check } from "lucide-react";
import { useCircleComparison } from "@/contexts/CircleComparisonContext";
import { MOCK_CIRCLES, DiscoverCircle } from "@/data/circles";

interface ComparisonFloatingBarProps {
  allCircles?: DiscoverCircle[];
}

export default function ComparisonFloatingBar({
  allCircles = MOCK_CIRCLES,
}: ComparisonFloatingBarProps) {
  const {
    selectedCircleIds,
    removeCircle,
    clearSelection,
    openComparison,
    maxLimit,
  } = useCircleComparison();

  if (selectedCircleIds.length === 0) return null;

  const selectedCircles = allCircles.filter((c) =>
    selectedCircleIds.includes(c.id)
  );

  const canCompare = selectedCircleIds.length >= 2;

  return (
    <aside
      aria-label="Circle comparison bar"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-[var(--modal)] border border-[#4B6B76]/50 shadow-[0_12px_40px_rgba(0,0,0,0.35)] rounded-2xl p-3 sm:p-4 animate-fade-up"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Selected circle pills & counter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--ov-0a)] border border-[var(--ov-10)] shrink-0">
            <Columns size={14} className="text-[#4B6B76]" aria-hidden="true" />
            <span className="text-xs font-bold font-sora text-[var(--text)]">
              {selectedCircleIds.length}/{maxLimit}
            </span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            {selectedCircles.map((circle) => (
              <span
                key={circle.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--content)] border border-[var(--ov-10)] text-xs text-[var(--text)] font-medium max-w-[140px] truncate group"
              >
                <span className="truncate">{circle.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCircle(circle.id);
                  }}
                  className="p-0.5 rounded-full hover:bg-[var(--ov-14)] text-[var(--muted)] hover:text-[var(--text)] focus-visible:outline-none"
                  aria-label={`Remove ${circle.name} from comparison`}
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            type="button"
            onClick={clearSelection}
            className="px-3 py-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-08)] rounded-xl transition-colors focus-visible:outline-none"
          >
            Clear all
          </button>

          <button
            type="button"
            onClick={openComparison}
            disabled={!canCompare}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
              canCompare
                ? "bg-[#4B6B76] hover:bg-[#3D5A64] text-white shadow-[#4B6B76]/20 cursor-pointer"
                : "bg-[var(--ov-0a)] text-[var(--muted)] cursor-not-allowed opacity-60"
            }`}
          >
            <span>
              {canCompare
                ? `Compare (${selectedCircleIds.length})`
                : "Select 1 more"}
            </span>
            <ArrowRight size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
