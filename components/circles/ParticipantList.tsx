"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export interface Participant {
  address: string;
  status: "paid" | "pending" | "your_turn";
  roundsPaid: number;
  role?: "organizer" | "co-organizer" | "participant";
}

interface ParticipantListProps {
  participants: Participant[];
  onSendReminder?: (participants: Participant[]) => void | Promise<void>;
}

type SortKey = "address" | "status";

const STATUS_CONFIG: Record<
  Participant["status"],
  { label: string; className: string }
> = {
  paid: {
    label: "Paid",
    className: "bg-green-100 text-green-700",
  },
  pending: {
    label: "Pending",
    className: "bg-gray-100 text-gray-600",
  },
  your_turn: {
    label: "Your Turn",
    // Accent color from the issue: #4B6B76
    className: "text-white",
  },
};

// Sort priority for status sorting: your_turn first, then pending, then paid.
const STATUS_ORDER: Record<Participant["status"], number> = {
  your_turn: 0,
  pending: 1,
  paid: 2,
};

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Deterministic placeholder avatar derived from the address, so each
 * participant gets a stable, distinct color without an external dependency.
 * Swap the inner div for an actual <Jazzicon /> if/when that package is
 * added to the project (e.g. `react-jazzicon`).
 */
function Avatar({ address }: { address: string }) {
  const hue = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      hash = address.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 360;
  }, [address]);

  return (
    <div
      aria-hidden
      className="h-8 w-8 shrink-0 rounded-full"
      style={{ backgroundColor: `hsl(${hue}, 65%, 55%)` }}
    />
  );
}

function StatusBadge({ status }: { status: Participant["status"] }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
      style={status === "your_turn" ? { backgroundColor: "#4B6B76" } : undefined}
    >
      {config.label}
    </span>
  );
}

function exportParticipants(participants: Participant[]) {
  const rows = [
    ["Address", "Status", "Rounds paid"],
    ...participants.map((participant) => [participant.address, participant.status, String(participant.roundsPaid)]),
  ];
  const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `participants-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function ParticipantList({ participants, onSendReminder }: ParticipantListProps) {
  const [sortKey, setSortKey] = useState<SortKey>("address");
  const [selectedAddresses, setSelectedAddresses] = useState<Set<string>>(new Set());
  const [reminderSent, setReminderSent] = useState(false);

  const sorted = useMemo(() => {
    const list = [...participants];
    if (sortKey === "address") {
      list.sort((a, b) => a.address.localeCompare(b.address));
    } else {
      list.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    }
    return list;
  }, [participants, sortKey]);

  const selected = participants.filter((participant) => selectedAddresses.has(participant.address));
  const allSelected = participants.length > 0 && selected.length === participants.length;

  function toggleSelected(address: string) {
    setReminderSent(false);
    setSelectedAddresses((current) => {
      const next = new Set(current);
      if (next.has(address)) next.delete(address);
      else next.add(address);
      return next;
    });
  }

  function toggleAll() {
    setReminderSent(false);
    setSelectedAddresses(allSelected ? new Set() : new Set(participants.map((participant) => participant.address)));
  }

  async function sendReminder() {
    if (!selected.length || !window.confirm(`Send a contribution reminder to ${selected.length} participant${selected.length === 1 ? "" : "s"}?`)) return;
    await onSendReminder?.(selected);
    setSelectedAddresses(new Set());
    setReminderSent(true);
  }

  function exportSelected() {
    if (!selected.length) return;
    exportParticipants(selected);
    setSelectedAddresses(new Set());
  }

  return (
    <section className="rounded-lg border border-gray-200 dark:border-[var(--border)] bg-white dark:bg-[var(--content)]">
      {/* Pre-launch lobby: seats, countdown and start CTA */}
      {(typeof seatsRemaining === "number" || startDate) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-[var(--border)] bg-[var(--ov-0a)] px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            {typeof seatsRemaining === "number" && (
              <span className="text-gray-700 dark:text-[var(--muted)]">
                <span className="font-semibold text-gray-900 dark:text-[var(--text)]">
                  {participants.length}
                </span>{" "}
                joined ·{" "}
                <span className="font-semibold text-gray-900 dark:text-[var(--text)]">
                  {seatsRemaining}
                </span>{" "}
                {seatsRemaining === 1 ? "seat" : "seats"} remaining
              </span>
            )}
            {startDate && (
              <span className="flex items-center gap-2 text-gray-700 dark:text-[var(--muted)]">
                Starts in <StartCountdown startDate={startDate} />
              </span>
            )}
          </div>

          {isOrganizer && seatsFilled && onStartCircle && (
            <button
              type="button"
              onClick={onStartCircle}
              className="rounded-md bg-[#4B6B76] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-offset-2"
            >
              Start circle now
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-[var(--border)] px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-[var(--text)]">
          Participants{" "}
          <span className="font-normal text-gray-500 dark:text-[var(--muted)]">
            ({participants.length})
          </span>
        </h2>

        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="sortKey" className="text-gray-500 dark:text-[var(--muted)]">
            Sort by
          </label>
          <select
            id="sortKey"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-md border border-gray-300 dark:border-[var(--border)] bg-white dark:bg-[var(--content)] text-gray-900 dark:text-[var(--text)] px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="address">Address</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-[var(--ov-03)] px-4 py-3 dark:border-[var(--border)]" role="toolbar" aria-label="Bulk participant actions">
          <span className="mr-auto text-xs font-medium text-[var(--text)]">{selected.length} selected</span>
          <button type="button" onClick={sendReminder} className="rounded-md bg-[#4B6B76] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#3D5A64]">Send reminder</button>
          <button type="button" onClick={exportSelected} className="rounded-md border border-[var(--ov-14)] px-3 py-1.5 text-xs font-medium text-[var(--text)] hover:bg-[var(--ov-07)]">Export selected CSV</button>
        </div>
      )}
      {reminderSent && <p className="border-b border-gray-200 px-4 py-2 text-xs text-green-700 dark:border-[var(--border)] dark:text-green-400" role="status">Reminder queued for the selected participants.</p>}

      {/* Scrollable on mobile, full table on desktop */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-[var(--border)] text-xs uppercase tracking-wide text-gray-400 dark:text-[var(--muted)]">
              <th className="w-10 px-4 py-2 font-medium"><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all participants" /></th>
              <th className="px-4 py-2 font-medium">Participant</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Rounds paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[var(--border)]">
            {sorted.map((participant) => (
              <tr key={participant.address}>
                <td className="px-4 py-3"><input type="checkbox" checked={selectedAddresses.has(participant.address)} onChange={() => toggleSelected(participant.address)} aria-label={`Select ${truncateAddress(participant.address)}`} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar address={participant.address} />
                    <Link href={`/dashboard/profile/${encodeURIComponent(participant.address)}`} className="font-mono text-sm text-gray-800 hover:underline dark:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]">
                      {truncateAddress(participant.address)}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={participant.status} />
                    {participant.role && (
                      <span className="rounded-full bg-[var(--ov-0a)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted)]">
                        {participant.role === "organizer"
                          ? "Organizer"
                          : participant.role === "co-organizer"
                            ? "Co-Organizer"
                            : "Participant"}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-[var(--muted)]">
                  {participant.roundsPaid}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {participants.length === 0 && (
        <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-[var(--muted)]">
          No participants yet.
        </p>
      )}
    </section>
  );
}
