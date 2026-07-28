"use client";

import { useState } from "react";
import { ShieldAlert, Check } from "lucide-react";
import {
  DISPUTE_REASON_LABELS,
  DISPUTE_STATUS_LABELS,
  DISPUTE_STATUS_STYLES,
  type Dispute,
} from "@/types/dispute";

interface DisputeListProps {
  disputes: Dispute[];
  /** Organizers get the resolve controls; participants get a read-only view. */
  isOrganizer: boolean;
  /** Used to label the viewer's own reports. */
  currentAddress: string;
  onResolve?: (disputeId: string, resolutionNote: string) => Promise<void> | void;
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function StatusBadge({ status }: { status: Dispute["status"] }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${DISPUTE_STATUS_STYLES[status]}`}
    >
      {DISPUTE_STATUS_LABELS[status]}
    </span>
  );
}

function ResolveForm({
  disputeId,
  onResolve,
  onCancel,
}: {
  disputeId: string;
  onResolve: (id: string, note: string) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onResolve(disputeId, note.trim());
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 border-t border-[#ffffff0f] pt-3">
      <label
        htmlFor={`resolution-${disputeId}`}
        className="mb-1.5 block text-xs font-medium text-[#A1A1AA]"
      >
        Resolution note
      </label>
      <textarea
        id={`resolution-${disputeId}`}
        rows={2}
        required
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Explain how this was resolved…"
        className="w-full resize-none rounded-lg border border-[#ffffff14] bg-[#ffffff0a] px-3 py-2 text-sm text-white placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-lg border border-[#ffffff14] px-3 py-1.5 text-xs text-[#EBEBEB] transition-colors hover:bg-[#ffffff0a] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#4B6B76] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#3D5A64] disabled:opacity-60"
        >
          <Check size={13} aria-hidden="true" />
          {busy ? "Saving…" : "Mark Resolved"}
        </button>
      </div>
    </form>
  );
}

export default function DisputeList({
  disputes,
  isOrganizer,
  currentAddress,
  onResolve,
}: DisputeListProps) {
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Participants only ever see their own reports; organizers see all.
  const visible = isOrganizer
    ? disputes
    : disputes.filter(
        (d) => d.reporter.toLowerCase() === currentAddress.toLowerCase()
      );

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#ffffff1a] bg-[#ffffff05] px-6 py-10 text-center">
        <ShieldAlert
          size={24}
          className="mx-auto mb-3 text-[#555]"
          aria-hidden="true"
        />
        <p className="text-sm text-[#A1A1AA]">
          {isOrganizer
            ? "No disputes have been raised in this circle."
            : "You haven't reported any issues in this circle."}
        </p>
      </div>
    );
  }

  return (
    <ul className="list-none space-y-3 p-0">
      {visible.map((dispute) => {
        const isMine =
          dispute.reporter.toLowerCase() === currentAddress.toLowerCase();
        const canResolve = isOrganizer && dispute.status !== "resolved";

        return (
          <li
            key={dispute.id}
            className="rounded-2xl bg-[#212124] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {DISPUTE_REASON_LABELS[dispute.reason]}
                  </span>
                  <span className="text-xs text-[#A1A1AA]">
                    Round {dispute.round}
                  </span>
                  {isMine && (
                    <span className="rounded-full bg-[#4B6B76] px-2 py-0.5 text-[10px] font-semibold text-white">
                      Your report
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#9A9A9A]">
                  Reported by{" "}
                  <span className="font-mono">
                    {shortAddress(dispute.reporter)}
                  </span>{" "}
                  on {formatDate(dispute.createdAt)}
                </p>
              </div>
              <StatusBadge status={dispute.status} />
            </div>

            {dispute.note && (
              <p className="mt-3 border-l-2 border-[#ffffff14] pl-3 text-sm leading-relaxed text-[#C7C7C7]">
                {dispute.note}
              </p>
            )}

            {dispute.status === "resolved" && dispute.resolutionNote && (
              <div className="mt-3 rounded-lg border border-[#2d5c43] bg-[#1f3b2d55] px-3 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8ef0b0]">
                  Resolution
                  {dispute.resolvedAt && ` · ${formatDate(dispute.resolvedAt)}`}
                </p>
                <p className="mt-1 text-sm text-[#C7C7C7]">
                  {dispute.resolutionNote}
                </p>
              </div>
            )}

            {canResolve &&
              onResolve &&
              (resolvingId === dispute.id ? (
                <ResolveForm
                  disputeId={dispute.id}
                  onResolve={async (id, note) => {
                    await onResolve(id, note);
                    setResolvingId(null);
                  }}
                  onCancel={() => setResolvingId(null)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setResolvingId(dispute.id)}
                  className="mt-3 rounded-lg border border-[#ffffff14] px-3 py-1.5 text-xs font-medium text-[#EBEBEB] transition-colors hover:bg-[#ffffff0a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                >
                  Resolve dispute
                </button>
              ))}
          </li>
        );
      })}
    </ul>
  );
}
