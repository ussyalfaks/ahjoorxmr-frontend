"use client";

import { useState, useEffect } from "react";

interface Props {
  deadline: Date | null;
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

export default function CountdownTimer({ deadline }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(
    deadline ? getTimeLeft(deadline) : null
  );

  useEffect(() => {
    if (!deadline) return;
    const update = () => setTimeLeft(getTimeLeft(deadline));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [deadline]);

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

  return (
    <div
      className={`flex items-center gap-1 text-xs font-mono font-medium tabular-nums ${colorClass}`}
      aria-label={`${timeLeft.days} days ${timeLeft.hours} hours ${timeLeft.minutes} minutes ${timeLeft.seconds} seconds remaining`}
      aria-live="off"
    >
      {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
      <span>{pad(timeLeft.hours)}h</span>
      <span>{pad(timeLeft.minutes)}m</span>
      <span>{pad(timeLeft.seconds)}s</span>
    </div>
  );
}
