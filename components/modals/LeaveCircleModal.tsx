"use client";

import { useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { PenaltyConfig } from "@/types/circle";

interface LeaveCircleModalProps {
  open: boolean;
  onClose: () => void;
  circleName: string;
  contribution: string;
  hasStarted: boolean;
  penalty?: PenaltyConfig;
  blocked: boolean;
  blockedReason?: string;
  onConfirm: () => Promise<void> | void;
}

export default function LeaveCircleModal({
  open,
  onClose,
  circleName,
  contribution,
  hasStarted,
  penalty,
  blocked,
  blockedReason,
  onConfirm,
}: LeaveCircleModalProps) {
  const [leaving, setLeaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, () => !leaving && onClose());

  if (!open) return null;

  async function handleConfirm() {
    setLeaving(true);
    try {
      await onConfirm();
    } finally {
      setLeaving(false);
    }
  }

  const penaltySummary = penalty?.enabled
    ? penalty.type === "percentage"
      ? `${penalty.value}% of your ${contribution} contribution`
      : `${penalty.value} USDT`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={() => !leaving && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-circle-title"
        className="w-full max-w-sm rounded-2xl bg-[var(--modal)] p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={leaving}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded disabled:opacity-50"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-3 pr-6">
          <AlertTriangle
            size={18}
            className={blocked ? "text-amber-500 shrink-0" : "text-[#FF5B5B] shrink-0"}
            aria-hidden="true"
          />
          <h2 id="leave-circle-title" className="text-lg font-bold font-sora text-[var(--text)]">
            {blocked ? "Can't leave right now" : `Leave ${circleName}?`}
          </h2>
        </div>

        {blocked ? (
          <>
            <p className="text-sm text-[var(--muted)]">{blockedReason}</p>
            <button
              onClick={onClose}
              className="mt-5 w-full py-2.5 bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-[var(--text)] text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              Close
            </button>
          </>
        ) : (
          <>
            <ul className="mt-1 space-y-2 text-sm text-[var(--muted)]">
              {hasStarted ? (
                <>
                  <li>Any contribution you&apos;ve already made this round is forfeited and won&apos;t be refunded.</li>
                  <li>
                    {penaltySummary
                      ? `A ${penaltySummary} exit penalty applies per this circle's rules.`
                      : "This circle has no explicit exit penalty configured, but forfeited contributions are non-refundable."}
                  </li>
                  <li>Leaving mid-cycle lowers your trust score and may limit which circles you can join next.</li>
                </>
              ) : (
                <li>
                  This circle hasn&apos;t started its first round yet, so you can leave without forfeiting any
                  funds — you&apos;ll just lose your slot.
                </li>
              )}
            </ul>
            <div className="mt-5 flex gap-3">
              <button
                onClick={onClose}
                disabled={leaving}
                className="flex-1 py-2.5 bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-[var(--text)] text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={leaving}
                className="flex-1 py-2.5 bg-[#FF5B5B] hover:bg-[#e14e4e] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B5B] disabled:opacity-60"
              >
                {leaving ? "Leaving…" : "Leave Circle"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
