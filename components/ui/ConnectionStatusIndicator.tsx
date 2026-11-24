"use client";

import { RefreshCw } from "lucide-react";
import { useConnectionStatus } from "@/contexts/ConnectionStatusContext";
import type { ConnectionStatus } from "@/lib/connection";

const STATUS_STYLES: Record<ConnectionStatus, { dot: string; label: string }> = {
  connected: { dot: "bg-emerald-400", label: "Live" },
  reconnecting: { dot: "bg-amber-400 animate-pulse", label: "Reconnecting" },
  offline: { dot: "bg-rose-500", label: "Offline" },
};

/**
 * Subtle pill for the dashboard header showing the live-data connection
 * state. Purely informational — it never blocks interaction.
 */
export default function ConnectionStatusIndicator() {
  const { status, attempt, reconnectNow } = useConnectionStatus();
  const styles = STATUS_STYLES[status];

  const description =
    status === "connected"
      ? "Live data connection is active"
      : status === "reconnecting"
        ? `Connection lost, reconnecting (attempt ${attempt})`
        : "You appear to be offline. Data may be out of date.";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={description}
      title={description}
      className="flex items-center gap-2 rounded-full border border-[var(--ov-1a)] bg-[var(--ov-05)] px-3 py-1.5 text-xs font-medium text-[var(--muted2)]"
    >
      <span className={`h-2 w-2 rounded-full ${styles.dot}`} aria-hidden="true" />
      <span className="hidden sm:inline">{styles.label}</span>
      {status !== "connected" && (
        <button
          type="button"
          onClick={reconnectNow}
          className="rounded-full p-0.5 text-[var(--muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          aria-label="Retry connection now"
          title="Retry now"
        >
          <RefreshCw size={12} className={status === "reconnecting" ? "animate-spin" : ""} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
