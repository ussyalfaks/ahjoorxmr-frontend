"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import type { AddressBookImportPreview } from "@/lib/addressBook";

interface AddressBookImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  preview: AddressBookImportPreview | null;
  onConfirm: () => void;
  isApplying?: boolean;
}

export default function AddressBookImportModal({
  isOpen,
  onClose,
  preview,
  onConfirm,
  isApplying = false,
}: AddressBookImportModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !preview) return null;

  const canConfirm = preview.toAddCount > 0 || preview.toMergeCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-preview-title"
        className="w-full max-w-2xl bg-[var(--modal)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--ov-10)]">
          <div>
            <h3 id="import-preview-title" className="text-lg font-bold font-sora text-[var(--text)]">
              Import Contacts Preview
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Review contacts before merging into your saved address book.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-0a)] transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Summary Badges */}
        <div className="grid grid-cols-3 gap-3 p-5 bg-[var(--ov-03)] border-b border-[var(--ov-10)]">
          <div className="bg-[var(--ov-05)] p-3 rounded-xl border border-[var(--ov-0a)] flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-[var(--success)] shrink-0" />
            <div>
              <p className="text-xs text-[var(--muted)]">New to Add</p>
              <p className="text-lg font-bold text-[var(--text)]">{preview.toAddCount}</p>
            </div>
          </div>
          <div className="bg-[var(--ov-05)] p-3 rounded-xl border border-[var(--ov-0a)] flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-amber-500 shrink-0" />
            <div>
              <p className="text-xs text-[var(--muted)]">Duplicates to Merge</p>
              <p className="text-lg font-bold text-[var(--text)]">{preview.toMergeCount}</p>
            </div>
          </div>
          <div className="bg-[var(--ov-05)] p-3 rounded-xl border border-[var(--ov-0a)] flex items-center gap-2.5">
            <XCircle size={18} className="text-red-500 shrink-0" />
            <div>
              <p className="text-xs text-[var(--muted)]">Invalid / Skipped</p>
              <p className="text-lg font-bold text-[var(--text)]">{preview.skippedCount}</p>
            </div>
          </div>
        </div>

        {/* Contact List */}
        <div className="overflow-y-auto p-5 space-y-2.5 flex-1">
          {preview.rows.map((row, idx) => {
            const isInvalid = row.status === "invalid";
            const isDuplicate = row.status === "duplicate";

            return (
              <div
                key={`preview-${idx}`}
                className={`p-3 rounded-xl border transition-colors ${
                  isInvalid
                    ? "border-red-500/20 bg-red-500/5 text-[var(--muted)]"
                    : isDuplicate
                    ? "border-amber-500/20 bg-amber-500/5"
                    : "border-[var(--ov-10)] bg-[var(--ov-05)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[var(--text)] truncate">
                        {row.label || "Unnamed Contact"}
                      </span>
                      {row.note && (
                        <span className="text-xs text-[var(--muted)] truncate">
                          ({row.note})
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-[var(--muted)] mt-1 break-all">
                      {row.address || "<Empty Address>"}
                    </p>
                    {row.reason && (
                      <p
                        className={`text-xs mt-1 ${
                          isInvalid ? "text-red-500" : isDuplicate ? "text-amber-500" : "text-[var(--faint)]"
                        }`}
                      >
                        {row.reason}
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      isInvalid
                        ? "bg-red-500/15 text-red-500"
                        : isDuplicate
                        ? "bg-amber-500/15 text-amber-500"
                        : "bg-emerald-500/15 text-emerald-500"
                    }`}
                  >
                    {isInvalid ? "Skipped" : isDuplicate ? "Merge" : "Add"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--ov-10)] bg-[var(--modal)]">
          <span className="text-xs text-[var(--muted)]">
            Total {preview.totalCount} records in file
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isApplying}
              className="px-4 py-2 rounded-lg border border-[var(--ov-14)] text-sm text-[var(--text)] hover:bg-[var(--ov-0a)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!canConfirm || isApplying}
              className="px-4 py-2 rounded-lg bg-[#4B6B76] text-white text-sm font-medium hover:bg-[#3D5A64] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplying ? "Importing…" : `Confirm & Import (${preview.toAddCount + preview.toMergeCount})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
