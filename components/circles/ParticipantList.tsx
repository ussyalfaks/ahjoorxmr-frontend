"use client";

import { useMemo, useState } from "react";

export interface Participant {
  address: string;
  status: "paid" | "pending" | "your_turn";
  roundsPaid: number;
}

interface ParticipantListProps {
  participants: Participant[];
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

export function ParticipantList({ participants }: ParticipantListProps) {
  const [sortKey, setSortKey] = useState<SortKey>("address");

  const sorted = useMemo(() => {
    const list = [...participants];
    if (sortKey === "address") {
      list.sort((a, b) => a.address.localeCompare(b.address));
    } else {
      list.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    }
    return list;
  }, [participants, sortKey]);

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Participants{" "}
          <span className="font-normal text-gray-500">
            ({participants.length})
          </span>
        </h2>

        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="sortKey" className="text-gray-500">
            Sort by
          </label>
          <select
            id="sortKey"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="address">Address</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Scrollable on mobile, full table on desktop */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
              <th className="px-4 py-2 font-medium">Participant</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Rounds paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((participant) => (
              <tr key={participant.address}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar address={participant.address} />
                    <span className="font-mono text-sm text-gray-800">
                      {truncateAddress(participant.address)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={participant.status} />
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {participant.roundsPaid}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {participants.length === 0 && (
        <p className="px-4 py-6 text-center text-sm text-gray-500">
          No participants yet.
        </p>
      )}
    </section>
  );
}