"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, FileText, ImagePlus, LifeBuoy, Loader2, Send, X } from "lucide-react";
import {
  getSupportTickets,
  saveSupportTicket,
  type SupportTicket,
  type SupportTicketCategory,
  type SupportTicketStatus,
} from "@/lib/supportTickets";

const CATEGORY_LABELS: Record<SupportTicketCategory, string> = {
  account: "Account & security",
  wallet: "Wallet connection",
  circle: "Savings circle",
  payment: "Contribution or payout",
  technical: "Technical issue",
  other: "Other",
};

const STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: "Open",
  "in-progress": "In progress",
  resolved: "Resolved",
};

const STATUS_STYLES: Record<SupportTicketStatus, string> = {
  open: "border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-300",
  "in-progress": "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-300",
  resolved: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
};

const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 3000;
const SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024;

type TicketForm = {
  category: SupportTicketCategory;
  subject: string;
  description: string;
  screenshot: File | null;
};

const EMPTY_FORM: TicketForm = {
  category: "technical",
  subject: "",
  description: "",
  screenshot: null,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function readScreenshot(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("We could not read that screenshot."));
    reader.readAsDataURL(file);
  });
}

function StatusBadge({ status }: { status: SupportTicketStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLES[status]}`}>
      {status === "resolved" ? <CheckCircle2 size={12} aria-hidden="true" /> : <Clock3 size={12} aria-hidden="true" />}
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function SupportTicketCenter() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [form, setForm] = useState<TicketForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof TicketForm, string>>>({});
  const [view, setView] = useState<"new" | "history">("new");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    setTickets(getSupportTickets());
  }, []);

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof TicketForm, string>> = {};
    if (!form.subject.trim()) nextErrors.subject = "Enter a subject.";
    else if (form.subject.trim().length < 3) nextErrors.subject = "Subject must be at least 3 characters.";
    if (!form.description.trim()) nextErrors.description = "Describe what happened.";
    else if (form.description.trim().length < DESCRIPTION_MIN) nextErrors.description = `Description must be at least ${DESCRIPTION_MIN} characters.`;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      let screenshotDataUrl: string | null = null;
      if (form.screenshot) screenshotDataUrl = await readScreenshot(form.screenshot);
      const ticket = saveSupportTicket({
        category: form.category,
        subject: form.subject.trim(),
        description: form.description.trim(),
        screenshotName: form.screenshot?.name ?? null,
        screenshotDataUrl,
      });
      setTickets((current) => [ticket, ...current]);
      setSubmittedTicket(ticket);
      setForm(EMPTY_FORM);
      setErrors({});
    } catch (error) {
      setErrors({ screenshot: error instanceof Error ? error.message : "We could not submit your ticket." });
    } finally {
      setSubmitting(false);
    }
  }

  function chooseScreenshot(file: File | null) {
    if (!file) {
      setForm((current) => ({ ...current, screenshot: null }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, screenshot: "Attach an image file." }));
      return;
    }
    if (file.size > SCREENSHOT_MAX_BYTES) {
      setErrors((current) => ({ ...current, screenshot: "Screenshots must be 5 MB or smaller." }));
      return;
    }
    setErrors((current) => ({ ...current, screenshot: undefined }));
    setForm((current) => ({ ...current, screenshot: file }));
  }

  return (
    <section className="mt-16 border-t border-[var(--ov-0f)] pt-12" aria-labelledby="support-ticket-title">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#4B6B76]">
            <LifeBuoy size={20} aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Tracked support</span>
          </div>
          <h2 id="support-ticket-title" className="mt-2 text-2xl font-bold font-sora text-[var(--text)]">Contact support</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Send a detailed request and follow its progress from one place.
          </p>
        </div>
        <div className="flex rounded-xl border border-[var(--ov-10)] bg-[var(--content)] p-1" role="tablist" aria-label="Support ticket views">
          <button type="button" role="tab" aria-selected={view === "new"} onClick={() => { setView("new"); setSubmittedTicket(null); }} className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${view === "new" ? "bg-[#4B6B76] text-white" : "text-[var(--muted)] hover:text-[var(--text)]"}`}>
            New ticket
          </button>
          <button type="button" role="tab" aria-selected={view === "history"} onClick={() => setView("history")} className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${view === "history" ? "bg-[#4B6B76] text-white" : "text-[var(--muted)] hover:text-[var(--text)]"}`}>
            My tickets ({tickets.length})
          </button>
        </div>
      </div>

      {view === "history" ? (
        tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--ov-14)] bg-[var(--content)] p-10 text-center">
            <FileText size={28} className="mx-auto text-[var(--muted)]" aria-hidden="true" />
            <h3 className="mt-3 text-sm font-semibold text-[var(--text)]">No support tickets yet</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">Your submitted requests and their statuses will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <article key={ticket.id} className="rounded-2xl border border-[var(--ov-10)] bg-[var(--content)] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#4B6B76]">{ticket.reference}</span>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-[var(--text)]">{ticket.subject}</h3>
                    <p className="mt-1 text-xs text-[var(--muted)]">{CATEGORY_LABELS[ticket.category]} · Submitted {formatDate(ticket.createdAt)}</p>
                  </div>
                  {ticket.screenshotName && <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]"><ImagePlus size={13} aria-hidden="true" /> Attachment</span>}
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">{ticket.description}</p>
              </article>
            ))}
          </div>
        )
      ) : submittedTicket ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
          <CheckCircle2 size={42} className="mx-auto text-emerald-500" aria-hidden="true" />
          <h3 className="mt-4 text-xl font-bold font-sora text-[var(--text)]">Ticket submitted</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">We&apos;ve recorded your request. Keep this reference number for follow-up.</p>
          <p className="mt-4 inline-flex rounded-lg bg-[var(--modal)] px-4 py-2 font-mono text-sm font-bold text-[var(--text)]">{submittedTicket.reference}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" onClick={() => setSubmittedTicket(null)} className="rounded-xl border border-[var(--ov-14)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--ov-08)]">Submit another</button>
            <button type="button" onClick={() => { setSubmittedTicket(null); setView("history"); }} className="rounded-xl bg-[#4B6B76] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3D5A64]">View my tickets</button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--ov-10)] bg-[var(--content)] p-5 md:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-xs font-medium text-[var(--muted)]">
              Category
              <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as SupportTicketCategory }))} className="mt-1.5 h-11 w-full rounded-xl border border-[var(--ov-10)] bg-[var(--modal)] px-3 text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-[#4B6B76]">
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-xs font-medium text-[var(--muted)]">
              Subject
              <input required minLength={3} maxLength={120} value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} placeholder="Briefly summarize the issue" className="mt-1.5 h-11 w-full rounded-xl border border-[var(--ov-10)] bg-[var(--modal)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--faint)] outline-none focus:ring-2 focus:ring-[#4B6B76]" />
              {errors.subject && <span className="mt-1 block text-[11px] text-red-500">{errors.subject}</span>}
            </label>
          </div>

          <label className="mt-5 block text-xs font-medium text-[var(--muted)]">
            Description
            <textarea required minLength={DESCRIPTION_MIN} maxLength={DESCRIPTION_MAX} rows={6} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Include what you expected, what happened, and any steps that reproduce it." className="mt-1.5 w-full resize-y rounded-xl border border-[var(--ov-10)] bg-[var(--modal)] px-3 py-3 text-sm text-[var(--text)] placeholder:text-[var(--faint)] outline-none focus:ring-2 focus:ring-[#4B6B76]" />
            <span className="mt-1 flex justify-between text-[11px] text-[var(--muted)]"><span>{errors.description ?? "Please include enough detail for us to investigate."}</span><span>{form.description.length}/{DESCRIPTION_MAX}</span></span>
          </label>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <label htmlFor="support-ticket-screenshot" className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--ov-14)] px-3 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--ov-08)]">
                <ImagePlus size={15} aria-hidden="true" />
                {form.screenshot ? form.screenshot.name : "Attach screenshot"}
              </label>
              <input id="support-ticket-screenshot" type="file" accept="image/*" onChange={(event) => chooseScreenshot(event.target.files?.[0] ?? null)} className="sr-only" />
              <p className="mt-1 text-[11px] text-[var(--muted)]">Optional · PNG, JPG, or WEBP up to 5 MB</p>
              {errors.screenshot && <p className="mt-1 text-[11px] text-red-500">{errors.screenshot}</p>}
            </div>
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-[#4B6B76] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#3D5A64] disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
              {submitting ? "Submitting..." : "Submit ticket"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
