"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, UserPlus, X } from "lucide-react";

export interface LiveActivityEvent {
  id: string;
  actor: string;
  action: string;
  circle: string;
  type: "join" | "payout" | "complete";
}

const MOCK_ACTIVITY: LiveActivityEvent[] = [
  { id: "join-1", actor: "Ada", action: "just joined", circle: "Family Circle", type: "join" },
  { id: "payout-1", actor: "Payout", action: "completed in", circle: "Friends Fund", type: "payout" },
  { id: "complete-1", actor: "Round 4", action: "completed in", circle: "Community Fund", type: "complete" },
  { id: "join-2", actor: "Tunde", action: "just joined", circle: "Student Builders", type: "join" },
  { id: "payout-2", actor: "Payout", action: "completed in", circle: "Holiday Savings", type: "payout" },
];

const ICONS = {
  join: UserPlus,
  payout: CheckCircle2,
  complete: CheckCircle2,
};

interface Props {
  events?: LiveActivityEvent[];
  intervalMs?: number;
}

export default function LiveActivityTicker({ events = MOCK_ACTIVITY, intervalMs = 4500 }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (paused || events.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % events.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [events.length, intervalMs, paused]);

  if (dismissed || events.length === 0) return null;

  const event = events[activeIndex % events.length];
  const Icon = ICONS[event.type];

  return (
    <section
      aria-label="Live platform activity"
      className="border-y border-[var(--ov-0f)] bg-[var(--ov-05)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex w-full items-center justify-between gap-3 px-1 py-2 text-left text-xs text-[var(--muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          aria-expanded="false"
        >
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />Live activity paused</span>
          <ChevronDown size={15} aria-hidden="true" />
        </button>
      ) : (
        <div className="flex min-h-12 items-center gap-3 px-1 py-2">
          <span className="flex shrink-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />Live
          </span>
          <div key={event.id} className="flex min-w-0 flex-1 items-center gap-2 text-sm" aria-live="polite">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4B6B76]/15 text-[#4B6B76]" aria-hidden="true">
              <Icon size={14} />
            </span>
            <p className="truncate text-[var(--muted)]">
              <span className="font-medium text-[var(--text)]">{event.actor}</span>{" "}
              {event.action}{" "}
              <span className="font-medium text-[var(--text)]">{event.circle}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="rounded p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--ov-0a)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              aria-label="Collapse live activity"
              title="Collapse live activity"
            >
              <ChevronUp size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="rounded p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--ov-0a)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              aria-label="Dismiss live activity"
              title="Dismiss live activity"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
