"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import type { Circle } from "@/types/circle";

interface Props {
  circles: Circle[];
}

interface CalendarEntry {
  circleId: string;
  circleName: string;
  date: Date;
  amount: string;
  kind: "due" | "receive";
}

function parseAmount(value: string): number {
  const match = value.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * In this app's rotating-savings model every active member contributes each
 * round, and the round's whole pot goes to whoever's turn it is. So a
 * circle's deadline produces a "due" entry for everyone, plus a "receive"
 * entry (pot = contribution x members) when it's this user's turn.
 */
function buildEntries(circles: Circle[]): CalendarEntry[] {
  const entries: CalendarEntry[] = [];
  for (const circle of circles) {
    if (circle.status !== "active" || !circle.deadline) continue;
    entries.push({
      circleId: circle.id,
      circleName: circle.name,
      date: circle.deadline,
      amount: circle.contribution,
      kind: "due",
    });
    if (circle.isYourTurn) {
      const pot = parseAmount(circle.contribution) * circle.members;
      entries.push({
        circleId: circle.id,
        circleName: circle.name,
        date: circle.deadline,
        amount: `${pot} USDT`,
        kind: "receive",
      });
    }
  }
  return entries;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function UpcomingPayoutsCalendar({ circles }: Props) {
  const activeCircles = useMemo(() => circles.filter((c) => c.status === "active"), [circles]);
  const entries = useMemo(() => buildEntries(circles), [circles]);

  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [openKey, setOpenKey] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const entriesByDay = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const entry of entries) {
      const key = dateKey(entry.date);
      const existing = map.get(key);
      if (existing) existing.push(entry);
      else map.set(key, [entry]);
    }
    return map;
  }, [entries]);

  useEffect(() => {
    if (!openKey) return;
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpenKey(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenKey(null);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openKey]);

  useEffect(() => {
    setOpenKey(null);
  }, [viewDate]);

  if (activeCircles.length === 0) {
    return (
      <div className="bg-[var(--content)] p-6 rounded-2xl">
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-bold font-sora text-[var(--text)] shrink-0">Upcoming Payouts</h2>
          <div className="ml-4 h-px bg-[var(--ov-1a)] w-full" aria-hidden="true" />
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <CalendarDays size={32} className="text-[var(--muted)]" aria-hidden="true" />
          <p className="text-[var(--muted)] text-base">
            You don&apos;t have any active circles yet. Join or create one to see contribution and payout dates here.
          </p>
        </div>
      </div>
    );
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();
  const totalCells = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - leadingBlanks + 1;
    cells.push(dayNum >= 1 && dayNum <= daysInMonth ? new Date(year, month, dayNum) : null);
  }

  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="bg-[var(--content)] p-6 rounded-2xl">
      <div className="flex items-center mb-6">
        <h2 className="text-xl font-bold font-sora text-[var(--text)] shrink-0">Upcoming Payouts</h2>
        <div className="ml-4 h-px bg-[var(--ov-1a)] w-full" aria-hidden="true" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[var(--text)]">{monthLabel}</span>
        </div>
        <div className="flex items-center gap-1 bg-[var(--modal)] rounded-lg border border-[var(--border)] p-1">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-1 rounded hover:bg-[var(--ov-0a)] text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-1 rounded hover:bg-[var(--ov-0a)] text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-[var(--muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FF5B5B]" aria-hidden="true" />
          You owe
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--success)]" aria-hidden="true" />
          You receive
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--faint)] py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, idx) => {
          if (!date) return <div key={`blank-${idx}`} className="aspect-square" />;

          const key = dateKey(date);
          const dayEntries = entriesByDay.get(key) ?? [];
          const hasDue = dayEntries.some((e) => e.kind === "due");
          const hasReceive = dayEntries.some((e) => e.kind === "receive");
          const isToday = dateKey(today) === key;
          const isOpen = openKey === key;

          return (
            <div key={key} className="relative aspect-square">
              <button
                type="button"
                disabled={dayEntries.length === 0}
                onClick={() => setOpenKey(isOpen ? null : key)}
                className={`w-full h-full flex flex-col items-center justify-center rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
                  dayEntries.length > 0
                    ? "hover:bg-[var(--ov-0a)] cursor-pointer text-[var(--text)]"
                    : "text-[var(--muted)] cursor-default"
                } ${isToday ? "ring-1 ring-[#4B6B76]" : ""} ${isOpen ? "bg-[var(--ov-0a)]" : ""}`}
                aria-label={
                  dayEntries.length > 0
                    ? `${date.toDateString()}: ${dayEntries.length} circle event${dayEntries.length > 1 ? "s" : ""}`
                    : date.toDateString()
                }
              >
                <span>{date.getDate()}</span>
                {(hasDue || hasReceive) && (
                  <span className="flex items-center gap-0.5 mt-0.5" aria-hidden="true">
                    {hasDue && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5B5B]" />}
                    {hasReceive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />}
                  </span>
                )}
              </button>

              {isOpen && (
                <div
                  ref={popoverRef}
                  className="absolute z-20 top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-[var(--modal)] border border-[var(--border)] rounded-xl shadow-xl p-3"
                  role="dialog"
                  aria-label={`Events on ${date.toDateString()}`}
                >
                  <p className="text-xs font-semibold text-[var(--text)] mb-2">
                    {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                  <div className="space-y-2">
                    {dayEntries.map((entry, i) => (
                      <Link
                        key={`${entry.circleId}-${entry.kind}-${i}`}
                        href={`/dashboard/circles/${entry.circleId}`}
                        onClick={() => setOpenKey(null)}
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-[var(--ov-05)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                      >
                        {entry.kind === "due" ? (
                          <ArrowUpCircle size={16} className="text-[#FF5B5B] shrink-0 mt-0.5" aria-hidden="true" />
                        ) : (
                          <ArrowDownCircle size={16} className="text-[var(--success)] shrink-0 mt-0.5" aria-hidden="true" />
                        )}
                        <span className="min-w-0">
                          <span className="block text-xs font-medium text-[var(--text)] truncate">{entry.circleName}</span>
                          <span
                            className={`block text-xs ${
                              entry.kind === "due" ? "text-[#FF5B5B]" : "text-[var(--success)]"
                            }`}
                          >
                            {entry.kind === "due" ? "You owe" : "You receive"} {entry.amount}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
