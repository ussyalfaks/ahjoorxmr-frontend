"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Loader2, Mail, MessageSquare, Send, Wallet, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import CopyButton from "@/components/ui/CopyButton";
import {
  CIRCLE_INVITES_EVENT,
  INVITE_CHANNEL_LABELS,
  MAX_INVITES_PER_HOUR,
  MAX_RECIPIENTS_PER_SEND,
  getCircleInvites,
  getRemainingInviteQuota,
  parseRecipientList,
  sendCircleInvites,
} from "@/lib/circleInvites";
import { FederationError, resolveFederationAddress, shortenStellarAddress } from "@/lib/stellarFederation";
import type { CircleInvite, InviteChannel, InviteStatus, ParsedRecipient } from "@/types/circleInvite";

const CHANNEL_ICONS: Record<InviteChannel, typeof Mail> = {
  email: Mail,
  sms: MessageSquare,
  stellar: Wallet,
};

function recipientKey(recipient: ParsedRecipient): string {
  return recipient.value ?? recipient.federationAddress ?? recipient.raw;
}

const STATUS_STYLES: Record<InviteStatus, string> = {
  sent: "bg-[var(--ov-0f)] text-[var(--muted)]",
  opened: "bg-[var(--status-pending-bg)] text-[var(--status-pending)]",
  joined: "bg-[var(--status-paid-bg)] text-[var(--status-paid)]",
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
  const resolvingRef = useRef(new Set<string>());

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

  // Resolve federation addresses (name*domain) to account IDs as soon as they
  // become chips, so the organizer sees who they're inviting before sending.
  useEffect(() => {
    for (const recipient of recipients) {
      const address = recipient.federationAddress;
      if (!recipient.resolving || !address || resolvingRef.current.has(address)) continue;
      resolvingRef.current.add(address);
      resolveFederationAddress(address)
        .then((record) => {
          setRecipients((current) => {
            const duplicate = current.some((r) => r.value === record.accountId && r.federationAddress !== address);
            return current.map((r) =>
              r.federationAddress === address
                ? duplicate
                  ? { ...r, resolving: false, error: `Resolves to ${shortenStellarAddress(record.accountId)}, which is already added` }
                  : { ...r, resolving: false, value: record.accountId }
                : r
            );
          });
        })
        .catch((error) => {
          const message = error instanceof FederationError ? error.message : `Couldn't resolve ${address}`;
          setRecipients((current) =>
            current.map((r) => (r.federationAddress === address ? { ...r, resolving: false, error: message } : r))
          );
        })
        .finally(() => resolvingRef.current.delete(address));
    }
  }, [recipients]);

  /** Parses `text` into chips and returns the resulting recipient list. */
  const commitDraft = (text: string = draft): ParsedRecipient[] => {
    if (!text.trim()) return recipients;
    const existing = new Set(recipients.map(recipientKey));
    const next = [
      ...recipients,
      ...parseRecipientList(text).filter((r) => !existing.has(recipientKey(r))),
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
  const resolving = recipients.some((r) => r.resolving);
  const limit = Math.min(MAX_RECIPIENTS_PER_SEND, quota);

  const handleSend = async () => {
    const all = commitDraft();
    const valid = all.filter((r) => r.value && r.channel);
    const invalid = all.filter((r) => r.error);
    if (invalid.length > 0) {
      setFormError("Fix or remove the highlighted entries before sending.");
      return;
    }
    if (all.some((r) => r.resolving)) {
      setFormError("Wait for Stellar federation addresses to finish resolving.");
      return;
    }
    if (valid.length === 0) {
      setFormError("Add at least one email address, phone number or Stellar address.");
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
        valid.map((r) => ({ value: r.value!, channel: r.channel!, federationAddress: r.federationAddress })),
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
        <h2 className="text-lg font-bold font-sora text-[var(--text)]">Invite by Email, SMS or Stellar Address</h2>
        <p className="text-xs text-[var(--muted)] mt-1">
          Send people a link to join this circle. Stellar invites accept a G-address or a federation address (name*domain.com),
          which is looked up before sending. Separate multiple entries with commas or new lines.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--text)]">
          Email addresses, phone numbers or Stellar addresses
        </label>
        <div
          className={`flex flex-wrap gap-2 rounded-xl border bg-[var(--ov-05)] p-2 focus-within:ring-2 focus-within:ring-[#4B6B76] ${
            formError ? "border-red-400" : "border-[var(--ov-1a)]"
          }`}
        >
          {recipients.map((recipient, index) => {
            const Icon = recipient.resolving ? Loader2 : CHANNEL_ICONS[recipient.channel ?? "email"];
            const label = recipient.federationAddress ?? recipient.value ?? recipient.raw;
            return (
              <span
                key={`${recipient.raw}-${index}`}
                title={recipient.error}
                className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
                  recipient.error ? "bg-[var(--status-missed-bg)] text-[var(--status-missed)]" : "bg-[var(--ov-0f)] text-[var(--text)]"
                }`}
              >
                {!recipient.error && (
                  <Icon size={12} className={recipient.resolving ? "animate-spin" : undefined} aria-hidden="true" />
                )}
                <span className="truncate">{label}</span>
                {recipient.federationAddress && recipient.value && (
                  <span className="font-mono text-[var(--muted)]" title={recipient.value}>
                    → {shortenStellarAddress(recipient.value)}
                  </span>
                )}
                {recipient.resolving && <span className="text-[var(--muted)]">resolving…</span>}
                {recipient.error && <span className="sr-only">— {recipient.error}</span>}
                <button
                  type="button"
                  onClick={() => removeRecipient(index)}
                  className="rounded-full p-0.5 hover:bg-[var(--ov-14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                  aria-label={`Remove ${label}`}
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
            placeholder={recipients.length ? "" : "ada@example.com, +234 801 234 5678, ada*lobstr.co"}
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

        <p className="sr-only" aria-live="polite">
          {resolving ? "Resolving Stellar federation address…" : ""}
        </p>
        {invalid.length > 0 && (
          <ul className="space-y-0.5 text-xs text-[var(--status-missed)]">
            {invalid.map((r, i) => (
              <li key={`${r.raw}-${i}`}>
                <span className="font-mono">{r.raw}</span>: {r.error}
              </li>
            ))}
          </ul>
        )}
        {formError && (
          <p id={errorId} role="alert" className="text-xs text-[var(--status-missed)]">
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
          disabled={sending || resolving || quota === 0 || (recipients.length === 0 && !draft.trim())}
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
              const Icon = CHANNEL_ICONS[invite.channel];
              return (
                <li key={invite.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon size={16} className="shrink-0 text-[var(--muted)]" aria-label={INVITE_CHANNEL_LABELS[invite.channel]} />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[var(--text)]" title={invite.recipient}>
                        {invite.federationAddress ?? invite.recipient}
                      </p>
                      {invite.federationAddress && (
                        <p className="truncate font-mono text-xs text-[var(--muted)]">{shortenStellarAddress(invite.recipient)}</p>
                      )}
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
