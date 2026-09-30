"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Sparkles, TrendingUp, Users } from "lucide-react";
import type { DiscoverCircle } from "@/data/circles";
import {
  LEFT_CIRCLES_EVENT,
  getCircleRecommendations,
  getLeftCircleIds,
} from "@/lib/circleRecommendations";

// Re-rank periodically so picks stay fresh while the page is open.
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

interface SuggestedCirclesWidgetProps {
  circles: DiscoverCircle[];
  wallet: string;
  onJoin: (circle: DiscoverCircle) => void;
}

/**
 * Personalized "Suggested for you" picks on the Discover tab. Separate from
 * the Live Activity Ticker, which shows real-time events rather than picks.
 */
export default function SuggestedCirclesWidget({ circles, wallet, onJoin }: SuggestedCirclesWidgetProps) {
  const [leftIds, setLeftIds] = useState<string[]>([]);
  const [rotation, setRotation] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const refresh = useCallback((rotate: boolean) => {
    setLeftIds(getLeftCircleIds());
    if (rotate) setRotation((r) => r + 1);
    setUpdatedAt(Date.now());
  }, []);

  useEffect(() => {
    refresh(false);
    const interval = window.setInterval(() => refresh(true), REFRESH_INTERVAL_MS);
    const onLeft = () => refresh(false);
    const onVisible = () => document.visibilityState === "visible" && refresh(false);
    window.addEventListener(LEFT_CIRCLES_EVENT, onLeft);
    window.addEventListener("storage", onLeft);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener(LEFT_CIRCLES_EVENT, onLeft);
      window.removeEventListener("storage", onLeft);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const recommendations = useMemo(
    () => getCircleRecommendations(circles, wallet, { leftIds, rotation }),
    [circles, wallet, leftIds, rotation]
  );

  if (recommendations.length === 0) return null;

  const allFallback = recommendations.every((r) => r.fallback);

  return (
    <section aria-labelledby="suggested-circles-title" className="rounded-2xl border border-[var(--ov-0f)] bg-[var(--content)] p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="suggested-circles-title" className="flex items-center gap-2 text-base font-bold font-sora text-[var(--text)]">
            {allFallback ? <TrendingUp size={18} aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}
            {allFallback ? "Trending circles" : "Suggested for you"}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            {allFallback
              ? "Join a circle and we'll personalize these picks for you."
              : "Based on the circles you've joined, their amounts and categories."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refresh(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--ov-0a)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          aria-label="Refresh suggestions"
          title={updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString()}` : undefined}
        >
          <RefreshCw size={13} aria-hidden="true" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <ul className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-5">
        {recommendations.map(({ circle, reasons }) => {
          const seatsLeft = circle.totalSlots - circle.members.length;
          return (
            <li
              key={circle.id}
              className="flex w-64 shrink-0 snap-start flex-col gap-3 rounded-xl border border-[var(--ov-0f)] bg-[var(--ov-05)] p-4 sm:w-auto"
            >
              <div className="min-w-0">
                <Link
                  href={`/dashboard/circles/${circle.id}`}
                  className="block truncate text-sm font-semibold text-[var(--text)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
                >
                  {circle.name}
                </Link>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  {circle.contribution} · {circle.duration}
                </p>
              </div>

              <p className="flex-1 text-xs leading-5 text-[var(--muted2)]">
                <span className="sr-only">Why this was suggested: </span>
                {reasons[0]}
                {reasons.length > 1 && (
                  <span className="block text-[var(--muted)]">+ {reasons.slice(1).join(" · ")}</span>
                )}
              </p>

              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                  <Users size={12} aria-hidden="true" />
                  {seatsLeft} seat{seatsLeft === 1 ? "" : "s"} left
                </span>
                <button
                  type="button"
                  onClick={() => onJoin(circle)}
                  className="rounded-lg bg-[#4B6B76] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#3D5A64] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                  aria-label={`Join ${circle.name}`}
                >
                  Join
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
