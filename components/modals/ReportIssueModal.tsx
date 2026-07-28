"use client";

import { useEffect, useRef, useState } from "react";
import { X, Flag } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import {
  DISPUTE_REASON_LABELS,
  type DisputeReason,
} from "@/types/dispute";

export interface ReportIssueSubmission {
  round: number;
  reason: DisputeReason;
  note: string;
}

interface ReportIssueModalProps {
  open: boolean;
  onClose: () => void;
  circleName: string;
  /** Round the report is filed against. */
  round: number;
  onSubmit: (submission: ReportIssueSubmission) => Promise<void> | void;
}

const REASONS: DisputeReason[] = ["missed_payment", "wrong_amount", "other"];
const NOTE_MAX = 500;

export default function ReportIssueModal({
  open,
  onClose,
  circleName,
  round,
  onSubmit,
}: ReportIssueModalProps) {
  const [reason, setReason] = useState<DisputeReason>("missed_payment");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, open, onClose);

  useEffect(() => {
    if (!open) return;
    setReason("missed_payment");
    setNote("");
    setSubmitting(false);
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ round, reason, note: note.trim() });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-issue-title"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !submitting && onClose()}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-md rounded-2xl border border-[#ffffff14] bg-[#1C1C1E] p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF5B5B1a] text-[#FF5B5B]"
              aria-hidden="true"
            >
              <Flag size={16} />
            </span>
            <div>
              <h2
                id="report-issue-title"
                className="font-sora text-lg font-bold text-white"
              >
                Report an Issue
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                {circleName} · Round {round}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close report dialog"
            className="rounded-lg p-1.5 text-[#A1A1AA] transition-colors hover:bg-[#ffffff0f] hover:text-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <fieldset className="mb-5 border-0 p-0">
            <legend className="mb-2 text-xs font-medium text-[#A1A1AA]">
              What went wrong?
            </legend>
            <div className="space-y-2">
              {REASONS.map((value) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                    reason === value
                      ? "border-[#4B6B76] bg-[#4B6B7615] text-white"
                      : "border-[#ffffff14] bg-[#ffffff05] text-[#EBEBEB] hover:bg-[#ffffff0a]"
                  }`}
                >
                  <input
                    type="radio"
                    name="dispute-reason"
                    value={value}
                    checked={reason === value}
                    onChange={() => setReason(value)}
                    className="h-4 w-4 accent-[#4B6B76]"
                  />
                  {DISPUTE_REASON_LABELS[value]}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mb-6">
            <label
              htmlFor="dispute-note"
              className="mb-1.5 block text-xs font-medium text-[#A1A1AA]"
            >
              Additional details{" "}
              <span className="text-[#666]">(optional)</span>
            </label>
            <textarea
              id="dispute-note"
              rows={3}
              maxLength={NOTE_MAX}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add anything the organizer should know…"
              className="w-full resize-none rounded-xl border border-[#ffffff14] bg-[#ffffff0a] px-4 py-3 text-sm text-white placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
            />
            <p className="mt-1 text-right text-[11px] text-[#666]">
              {note.length}/{NOTE_MAX}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-xl border border-[#ffffff1a] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#ffffff0a] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-[#4B6B76] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3D5A64] disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
