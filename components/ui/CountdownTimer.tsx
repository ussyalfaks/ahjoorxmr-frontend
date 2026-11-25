"use client";

import { useState, useEffect } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTimezone } from "@/hooks/useTimezone";
import { formatDateTimeWithTz } from "@/lib/timezone";

interface Props {
  deadline: Date | null;
  /** Circle is paused: the deadline is suspended rather than counting down. */
  paused?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

function getTimeLeft(deadline: Date): TimeLeft | null {
  const diff = deadline.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    totalMs: diff,
  };
}

export default function CountdownTimer({ deadline, paused = false }: Props) {
  const { timezone, timezoneAbbr } = useTimezone();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(
    deadline ? getTimeLeft(deadline) : null
  );
  // Under reduced motion the seconds digits aren't shown and the timer only
  // ticks once a minute, so digits don't flip every second.
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!deadline || paused) return;
    const update = () => setTimeLeft(getTimeLeft(deadline));
    update();
    const id = setInterval(update, reducedMotion ? 60 * 1000 : 1000);
    return () => clearInterval(id);
  }, [deadline, paused, reducedMotion]);

  if (paused) {
    return (
      <span className="text-xs font-medium text-amber-500" aria-label="Deadline suspended while the circle is paused">
        Paused
      </span>
    );
  }

  if (!deadline) {
    return (
      <span className="text-xs font-medium text-[var(--muted)]" aria-label="No fixed deadline">
        Ongoing
      </span>
    );
  }

  if (!timeLeft) {
    return (
      <span className="text-xs font-medium text-red-600 dark:text-red-500" aria-label="Round has ended">
        Round Ended
      </span>
    );
  }

  const isUnderHour = timeLeft.totalMs < 60 * 60 * 1000;
  const isUnder24Hours = timeLeft.totalMs < 24 * 60 * 60 * 1000;
  const colorClass = isUnderHour
    ? "text-red-600 dark:text-red-500"
    : isUnder24Hours
    ? "text-amber-600 dark:text-amber-500"
    : "text-[var(--muted)]";

  const pad = (n: number) => String(n).padStart(2, "0");
  const formattedDeadline = deadline ? formatDateTimeWithTz(deadline, timezone) : "";

  return (
    <div
      className={`flex items-center gap-1 text-xs font-mono font-medium tabular-nums ${colorClass}`}
      role="timer"
      title={formattedDeadline ? `Deadline: ${formattedDeadline}` : undefined}
      aria-label={`${timeLeft.days} days ${timeLeft.hours} hours ${timeLeft.minutes} minutes${reducedMotion ? "" : ` ${timeLeft.seconds} seconds`} remaining (${formattedDeadline})`}
      aria-live="off"
    >
      {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
      <span>{pad(timeLeft.hours)}h</span>
      <span>{pad(timeLeft.minutes)}m</span>
      {!reducedMotion && <span>{pad(timeLeft.seconds)}s</span>}
      <span className="text-[10px] text-[var(--faint)] font-sans ml-0.5">{timezoneAbbr}</span>
    </div>
  );
}
