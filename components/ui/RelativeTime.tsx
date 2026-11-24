"use client";

import { useSyncExternalStore } from "react";
import { subscribeToClock, getClockSnapshot } from "@/lib/relativeTimeClock";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: "seconds" },
  { amount: 60, unit: "minutes" },
  { amount: 24, unit: "hours" },
  { amount: 7, unit: "days" },
  { amount: 4.34524, unit: "weeks" },
  { amount: 12, unit: "months" },
  { amount: Number.POSITIVE_INFINITY, unit: "years" },
];

/** Formats `date` relative to now, e.g. "2 hours ago" / "in 3 days". */
export function formatRelativeTime(date: Date): string {
  let duration = (date.getTime() - Date.now()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return rtf.format(Math.round(duration), "years");
}

function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export interface RelativeTimeProps {
  /** The moment to render, as a Date or an ISO-8601 string. */
  date: Date | string;
  className?: string;
}

/**
 * Renders a self-updating relative timestamp, e.g. "2 hours ago".
 *
 * Uses `Intl.RelativeTimeFormat` and re-renders once a minute via a single
 * shared clock (see lib/relativeTimeClock.ts) instead of each instance
 * running its own timer. The full date is available as a `title` tooltip,
 * and the underlying `<time>` element always carries the raw ISO date.
 */
export default function RelativeTime({ date, className }: RelativeTimeProps) {
  const value = typeof date === "string" ? new Date(date) : date;

  // Re-renders this component every time the shared minute clock ticks.
  useSyncExternalStore(subscribeToClock, getClockSnapshot, getClockSnapshot);

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return (
    <time dateTime={value.toISOString()} title={formatFullDate(value)} className={className}>
      {formatRelativeTime(value)}
    </time>
  );
}
