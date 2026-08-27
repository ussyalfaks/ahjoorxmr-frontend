"use client";

import { useRef, useState } from "react";
import { CheckCircle2, ImagePlus, MessageSquarePlus, X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useToast } from "@/components/ui/Toast";

type FeedbackCategory = "bug" | "feedback" | "idea";

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: "Bug report",
  feedback: "General feedback",
  idea: "Feature idea",
};

const DESCRIPTION_MAX = 1000;

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useFocusTrap(dialogRef, open, () => !submitting && setOpen(false));

  function openWidget() {
    setCategory("bug");
    setDescription("");
    setScreenshot(null);
    setSubmitted(false);
    setSubmitting(false);
    setOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    // Stub the future feedback POST while keeping the interaction realistic.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitting(false);
    setSubmitted(true);
    showToast({
      title: "Thanks for your feedback",
      message: "Your report has been recorded for review.",
      variant: "success",
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openWidget}
        aria-label="Send feedback or report a bug"
        className="fixed bottom-24 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#4B6B76] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 hover:bg-[#3D5A64] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] md:bottom-6 md:right-6"
      >
        <MessageSquarePlus size={21} aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-200 flex items-end justify-center px-4 pb-24 sm:items-center sm:pb-0" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => !submitting && setOpen(false)} aria-hidden="true" />
          <div ref={dialogRef} className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--modal)] p-6 shadow-2xl">
            {submitted ? (
              <div className="py-8 text-center">
                <CheckCircle2 size={42} className="mx-auto text-green-600 dark:text-green-400" aria-hidden="true" />
                <h2 id="feedback-title" className="mt-4 text-xl font-bold font-sora text-[var(--text)]">Feedback received</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">Thanks for helping us make Ahjoor better.</p>
                <button type="button" onClick={() => setOpen(false)} className="mt-6 rounded-lg bg-[#4B6B76] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3D5A64] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]">Done</button>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 id="feedback-title" className="text-lg font-bold font-sora text-[var(--text)]">Send feedback</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">Tell us what happened or what could be better.</p>
                  </div>
                  <button type="button" onClick={() => setOpen(false)} disabled={submitting} aria-label="Close feedback dialog" className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--ov-0a)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                  <label htmlFor="feedback-category" className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Category</label>
                  <select id="feedback-category" value={category} onChange={(event) => setCategory(event.target.value as FeedbackCategory)} className="mb-5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]">
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>

                  <label htmlFor="feedback-description" className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Description</label>
                  <textarea id="feedback-description" required rows={5} maxLength={DESCRIPTION_MAX} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the issue or share your idea..." className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]" />
                  <p className="mt-1 text-right text-[11px] text-[var(--muted)]">{description.length}/{DESCRIPTION_MAX}</p>

                  <label htmlFor="feedback-screenshot" className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)]">
                    <ImagePlus size={16} aria-hidden="true" />
                    {screenshot ? screenshot.name : "Attach a screenshot (optional)"}
                    <input id="feedback-screenshot" type="file" accept="image/*" onChange={(event) => setScreenshot(event.target.files?.[0] ?? null)} className="sr-only" />
                  </label>

                  <div className="mt-6 flex gap-3">
                    <button type="button" onClick={() => setOpen(false)} disabled={submitting} className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--ov-0a)] disabled:opacity-50">Cancel</button>
                    <button type="submit" disabled={submitting || !description.trim()} className="flex-1 rounded-xl bg-[#4B6B76] py-2.5 text-sm font-semibold text-white hover:bg-[#3D5A64] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Sending..." : "Send feedback"}</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}