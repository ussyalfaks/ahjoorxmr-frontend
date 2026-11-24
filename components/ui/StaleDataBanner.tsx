"use client";

import { useEffect, useState } from "react";
import { TriangleAlert, WifiOff } from "lucide-react";
import { useConnectionStatus } from "@/contexts/ConnectionStatusContext";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Inline (non-modal) banner shown while the live connection is down, warning
 * that the dashboard may be showing stale data. Content stays fully usable.
 */
export default function StaleDataBanner() {
  const { status, nextRetryAt, lastConnectedAt, reconnectNow } = useConnectionStatus();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status === "connected") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  if (status === "connected") return null;

  const secondsUntilRetry = nextRetryAt ? Math.max(0, Math.ceil((nextRetryAt - now) / 1000)) : null;
  const Icon = status === "offline" ? WifiOff : TriangleAlert;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-[var(--text)]"
    >
      <Icon size={16} className="shrink-0 text-amber-400" aria-hidden="true" />
      <p className="min-w-0 flex-1">
        <span className="font-medium">
          {status === "offline" ? "You're offline." : "Connection interrupted."}
        </span>{" "}
        <span className="text-[var(--muted)]">
          Data shown may be out of date
          {lastConnectedAt ? ` (last updated ${formatTime(lastConnectedAt)})` : ""}.
          {secondsUntilRetry !== null && ` Retrying in ${secondsUntilRetry}s.`}
        </span>
      </p>
      <button
        type="button"
        onClick={reconnectNow}
        className="rounded-lg border border-[var(--ov-1a)] px-3 py-1 text-xs font-medium text-[var(--text)] transition-colors hover:bg-[var(--ov-0a)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
      >
        Retry now
      </button>
    </div>
  );
}
