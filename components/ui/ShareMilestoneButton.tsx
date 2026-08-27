"use client";

import { useRef, useState, useCallback } from "react";
import {
  Share2,
  Download,
  Copy,
  Check,
  X,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useShareCard } from "@/hooks/useShareCard";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { MilestoneData, MilestoneType } from "@/types/milestone";

// ---------------------------------------------------------------------------
// Milestone type display helpers
// ---------------------------------------------------------------------------
const TYPE_LABELS: Record<MilestoneType, string> = {
  circle_completed: "Circle Completed",
  payout_received: "Payout Received",
  savings_goal: "Savings Goal Hit",
  streak: "Streak Achieved",
};

const TYPE_ACCENT: Record<MilestoneType, string> = {
  circle_completed: "text-[var(--success)]",
  payout_received: "text-[#FBBF24]",
  savings_goal: "text-[var(--accent)]",
  streak: "text-[#FF5B5B]",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ShareMilestoneButtonProps {
  milestone: MilestoneData;
  /** Optional URL to share/copy; defaults to current page URL */
  shareUrl?: string;
  /** Visual variant of the trigger button */
  variant?: "default" | "icon" | "subtle";
  className?: string;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ShareMilestoneButton({
  milestone,
  shareUrl,
  variant = "default",
  className = "",
}: ShareMilestoneButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { status, previewUrl, openShare, download, nativeShare, copyLink, reset, errorMessage } =
    useShareCard();

  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, modalOpen, handleClose);

  function handleClose() {
    reset();
    setModalOpen(false);
  }

  async function handleOpen() {
    setModalOpen(true);
    await openShare(milestone);
  }

  async function handleNativeShare() {
    await nativeShare(milestone, shareUrl);
  }

  async function handleCopyLink() {
    const ok = await copyLink(shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDownload() {
    const slug = milestone.circleName.toLowerCase().replace(/\s+/g, "-");
    download(`ahjoor-${milestone.type}-${slug}.png`);
  }

  const supportsNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  // ---------------------------------------------------------------------------
  // Trigger button styles
  // ---------------------------------------------------------------------------
  const triggerBase =
    "inline-flex items-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]";

  const triggerStyles = {
    default: `${triggerBase} px-4 py-2 text-sm rounded-lg bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-[var(--text)]`,
    icon: `${triggerBase} w-9 h-9 justify-center rounded-lg bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-[var(--muted)] hover:text-[var(--text)]`,
    subtle: `${triggerBase} px-3 py-1.5 text-xs rounded-lg text-[#4B6B76] hover:bg-[var(--ov-0a)]`,
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        className={`${triggerStyles[variant]} ${className}`}
        aria-label={`Share ${TYPE_LABELS[milestone.type]} milestone for ${milestone.circleName}`}
      >
        <Share2 size={variant === "icon" ? 16 : 14} aria-hidden="true" />
        {variant !== "icon" && <span>Share</span>}
      </button>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            className="w-full max-w-lg rounded-2xl border border-[var(--ov-14)] shadow-2xl overflow-hidden"
            style={{ background: "var(--modal)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ov-0f)]">
              <div>
                <h2
                  id="share-modal-title"
                  className="text-sm font-semibold text-[var(--text)]"
                >
                  Share milestone
                </h2>
                <p className={`text-xs mt-0.5 ${TYPE_ACCENT[milestone.type]}`}>
                  {TYPE_LABELS[milestone.type]} · {milestone.circleName}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-0a)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                aria-label="Close share dialog"
              >
                <X size={16} />
              </button>
            </div>

            {/* Card Preview */}
            <div className="px-5 pt-5">
              <div
                className="relative w-full rounded-xl overflow-hidden border border-[var(--ov-0f)]"
                style={{ aspectRatio: "1200 / 630" }}
                aria-label="Share card preview"
              >
                {/* Loading state */}
                {status === "rendering" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg)] gap-3">
                    <Loader2 size={28} className="text-[var(--muted)] animate-spin" aria-hidden="true" />
                    <p className="text-xs text-[var(--muted)]">Generating card…</p>
                  </div>
                )}

                {/* Error state */}
                {status === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg)] gap-3 p-6 text-center">
                    <AlertCircle size={28} className="text-[#FF5B5B]" aria-hidden="true" />
                    <p className="text-xs text-[var(--muted)]">
                      {errorMessage ?? "Could not generate the share card."}
                    </p>
                    <button
                      type="button"
                      onClick={() => openShare(milestone)}
                      className="text-xs text-[#4B6B76] hover:underline focus-visible:outline-none"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* Rendered preview */}
                {previewUrl && status !== "error" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt={`Share card for ${milestone.circleName} ${TYPE_LABELS[milestone.type]}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 pt-4 space-y-3">
              {/* Primary row */}
              <div className="flex gap-2">
                {/* Download */}
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={status === "rendering" || status === "error"}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--accent)] hover:opacity-90 disabled:opacity-40 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--modal)]"
                >
                  <Download size={15} aria-hidden="true" />
                  Download PNG
                </button>

                {/* Native Share (when supported) */}
                {supportsNativeShare && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    disabled={status === "rendering" || status === "sharing" || status === "error"}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text)] bg-[var(--ov-0f)] hover:bg-[var(--ov-1a)] disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                  >
                    {status === "sharing" ? (
                      <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <ExternalLink size={15} aria-hidden="true" />
                    )}
                    Share
                  </button>
                )}
              </div>

              {/* Copy link row */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--muted)] bg-[var(--ov-07)] hover:bg-[var(--ov-0f)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              >
                {copied ? (
                  <>
                    <Check size={15} className="text-[var(--success)]" aria-hidden="true" />
                    <span className="text-[var(--success)]">Link copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={15} aria-hidden="true" />
                    Copy link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
