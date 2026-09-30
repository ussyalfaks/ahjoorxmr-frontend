"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Loader2, Mail, MessageSquare, Send, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import CopyButton from "@/components/ui/CopyButton";
import {
  CIRCLE_INVITES_EVENT,
  MAX_INVITES_PER_HOUR,
  MAX_RECIPIENTS_PER_SEND,
  getCircleInvites,
  getRemainingInviteQuota,
  parseRecipientList,
  sendCircleInvites,
} from "@/lib/circleInvites";
import type { CircleInvite, InviteStatus, ParsedRecipient } from "@/types/circleInvite";

const STATUS_STYLES: Record<InviteStatus, string> = {
  sent: "bg-[var(--ov-0f)] text-[var(--muted)]",
  opened: "bg-amber-500/15 text-amber-500",
  joined: "bg-green-500/15 text-green-500",
};

interface CircleInvitePanelProps {
  circleId: string;
  circleName: string;
}

export default function CircleInvitePanel({ circleId, circleName }: CircleInvitePanelProps) {
  const { showToast } = useToast();
  const inputId = useId();
  const errorId = useId();
  const [draft, setDraft] = useState("");
  const [recipients, setRecipients] = useState<ParsedRecipient[]>([]);
  const [invites, setInvites] = useState<CircleInvite[]>([]);
  const [quota, setQuota] = useState(MAX_INVITES_PER_HOUR);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setInvites(getCircleInvites(circleId));
    setQuota(getRemainingInviteQuota(circleId));
  }, [circleId]);

  useEffect(() => {
    refresh();
    window.addEventListener(CIRCLE_INVITES_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CIRCLE_INVITES_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  /** Parses `text` into chips and returns the resulting recipient list. */
  const commitDraft = (text: string = draft): ParsedRecipient[] => {
    if (!text.trim()) return recipients;
    const existing = new Set(recipients.map((r) => r.value ?? r.raw));
    const next = [
      ...recipients,
      ...parseRecipientList(text).filter((r) => !existing.has(r.value ?? r.raw)),
    ];
    setRecipients(next);
    setDraft("");
    setFormError(null);
    return next;
  };

  const removeRecipient = (index: number) => {
    setRecipients((current) => current.filter((_, i) => i !== index));
    setFormError(null);
  };

  const valid = recipients.filter((r) => r.value && r.channel);
  const invalid = recipients.filter((r) => r.error);
  const limit = Math.min(MAX_RECIPIENTS_PER_SEND, quota);

  const handleSend = async () => {
    const all = commitDraft();
    const valid = all.filter((r) => r.value && r.channel);
    const invalid = all.filter((r) => r.error);
    if (invalid.length > 0) {
      setFormError("Fix or remove the highlighted entries before sending.");
      return;
    }
    if (valid.length === 0) {
      setFormError("Add at least one email address or phone number.");
      return;
    }
    if (quota === 0) {
      setFormError(`You've reached the limit of ${MAX_INVITES_PER_HOUR} invites per hour. Try again later.`);
      return;
    }
    if (valid.length > limit) {
      setFormError(`You can send ${limit} more invite${limit === 1 ? "" : "s"} right now.`);
      return;
    }

    setSending(true);
    setFormError(null);
    try {
      const result = await sendCircleInvites(
        circleId,
        circleName,
        valid.map((r) => ({ value: r.value!, channel: r.channel! })),
        window.location.origin
      );
      if (result.sent.length > 0) {
        showToast({
          title: `Sent ${result.sent.length} invite${result.sent.length === 1 ? "" : "s"}`,
          message: `Recipients will get a link to join ${circleName}.`,
          variant: "success",
        });
      }
      if (result.skipped.length > 0) {
        showToast({
          title: `${result.skipped.length} invite${result.skipped.length === 1 ? " was" : "s were"} not sent`,
          message: result.skipped.map((s) => `${s.recipient}: ${s.reason}`).join(" · "),
          variant: "warning",
        });
      }
      const skippedSet = new Set(result.skipped.map((s) => s.recipient));
      setRecipients((current) => current.filter((r) => r.value && skippedSet.has(r.value)));
      refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not send invites. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="bg-[var(--content)] p-6 rounded-2xl space-y-5">
      <div>
        <h2 className="text-lg font-bold font-sora text-[var(--text)]">Invite by Email or SMS</h2>
        <p className="text-xs text-[var(--muted)] mt-1">
          Send people a message with a link to join this circle. Separate multiple entries with commas or new lines.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--text)]">
          Email addresses or phone numbers
        </label>
        <div
          className={`flex flex-wrap gap-2 rounded-xl border bg-[var(--ov-05)] p-2 focus-within:ring-2 focus-within:ring-[#4B6B76] ${
            formError ? "border-red-400" : "border-[var(--ov-1a)]"
          }`}
        >
          {recipients.map((recipient, index) => {
            const Icon = recipient.channel === "sms" ? MessageSquare : Mail;
            return (
              <span
                key={`${recipient.raw}-${index}`}
                title={recipient.error}
                className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
                  recipient.error ? "bg-red-500/15 text-red-400" : "bg-[var(--ov-0f)] text-[var(--text)]"
                }`}
              >
                {!recipient.error && <Icon size={12} aria-hidden="true" />}
                <span className="truncate">{recipient.value ?? recipient.raw}</span>
                {recipient.error && <span className="sr-only">— {recipient.error}</span>}
                <button
                  type="button"
                  onClick={() => removeRecipient(index)}
                  className="rounded-full p-0.5 hover:bg-[var(--ov-14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                  aria-label={`Remove ${recipient.value ?? recipient.raw}`}
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </span>
            );
          })}
          <input
            id={inputId}
            type="text"
            inputMode="email"
            autoComplete="off"
            value={draft}
            disabled={sending}
            placeholder={recipients.length ? "" : "ada@example.com, +234 801 234 5678"}
            aria-describedby={formError ? errorId : undefined}
            aria-invalid={!!formError}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "," || e.key === ";") {
                e.preventDefault();
                commitDraft();
              } else if (e.key === "Backspace" && !draft && recipients.length) {
                removeRecipient(recipients.length - 1);
              }
            }}
            onPaste={(e) => {
              const text = e.clipboardData.getData("text");
              if (/[,;\n]/.test(text)) {
                e.preventDefault();
                commitDraft(draft + text);
              }
            }}
            onBlur={() => commitDraft()}
            className="min-w-[12rem] flex-1 bg-transparent px-1 py-1 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none"
          />
        </div>

        {invalid.length > 0 && (
          <ul className="space-y-0.5 text-xs text-red-400">
            {invalid.map((r, i) => (
              <li key={`${r.raw}-${i}`}>
                <span className="font-mono">{r.raw}</span>: {r.error}
              </li>
            ))}
          </ul>
        )}
        {formError && (
          <p id={errorId} role="alert" className="text-xs text-red-400">
            {formError}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--muted)]">
          {quota} of {MAX_INVITES_PER_HOUR} invites left this hour · up to {MAX_RECIPIENTS_PER_SEND} per send
        </p>
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || quota === 0 || (recipients.length === 0 && !draft.trim())}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4B6B76] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3D5A64] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
        >
          {sending ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Send size={14} aria-hidden="true" />}
          {sending ? "Sending…" : `Send invite${valid.length > 1 ? `s (${valid.length})` : ""}`}
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text)]">Sent invites</h3>
        {invites.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No invites sent yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--ov-14)] rounded-xl border border-[var(--ov-14)]">
            {invites.map((invite) => {
              const Icon = invite.channel === "sms" ? MessageSquare : Mail;
              return (
                <li key={invite.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon size={16} className="shrink-0 text-[var(--muted)]" aria-label={invite.channel === "sms" ? "SMS" : "Email"} />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[var(--text)]">{invite.recipient}</p>
                      <p className="text-xs text-[var(--muted)]">
                        Sent {new Date(invite.sentAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyButton value={invite.link} />
                    <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${STATUS_STYLES[invite.status]}`}>
                      {invite.status}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
