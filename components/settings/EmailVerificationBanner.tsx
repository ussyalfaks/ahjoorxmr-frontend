"use client";

import { useState } from "react";
import { Mail, AlertCircle, CheckCircle2, Send } from "lucide-react";
import { useEmailVerification } from "@/hooks/useEmailVerification";

function formatCooldown(ms: number): string {
  return `${Math.ceil(ms / 1000)}s`;
}

export default function EmailVerificationBanner() {
  const { email, isVerified, cooldownMs, sendOrResend, devVerificationLink } = useEmailVerification();
  const [draftEmail, setDraftEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "rate-limited">("idle");

  if (isVerified) return null;

  const handleSend = (targetEmail: string) => {
    const result = sendOrResend(targetEmail);
    setStatus(result.ok ? "sent" : "rate-limited");
  };

  const handleSubmitNewEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const target = draftEmail.trim();
    if (!target) return;
    handleSend(target);
  };

  const handleResend = () => {
    if (email) handleSend(email);
  };

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 mb-6 sm:flex-row sm:items-start"
      role="alert"
    >
      <Mail size={20} className="text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          {email ? "Verify your email address" : "Add and verify your email"}
        </p>
        <p className="text-xs text-[var(--muted)] mt-1">
          {email
            ? `We sent a verification link to ${email}. Verify it to unlock creating and joining circles.`
            : "Add an email to receive contribution and payout notifications, and to unlock creating and joining circles."}
        </p>

        {!email ? (
          <form onSubmit={handleSubmitNewEmail} className="flex flex-col sm:flex-row gap-2 mt-3">
            <input
              type="email"
              required
              value={draftEmail}
              onChange={(e) => setDraftEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 h-9 px-3 rounded-lg bg-[var(--modal)] border border-[var(--ov-10)] text-sm text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Email address"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shrink-0"
            >
              <Send size={13} aria-hidden="true" />
              Send verification email
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldownMs > 0}
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Send size={12} aria-hidden="true" />
            {cooldownMs > 0 ? `Resend available in ${formatCooldown(cooldownMs)}` : "Resend verification email"}
          </button>
        )}

        {status === "rate-limited" && (
          <p className="flex items-center gap-1.5 text-xs text-amber-500 mt-2">
            <AlertCircle size={12} aria-hidden="true" />
            Too many requests — please wait before trying again.
          </p>
        )}
        {status === "sent" && (
          <p className="flex items-center gap-1.5 text-xs text-emerald-500 mt-2">
            <CheckCircle2 size={12} aria-hidden="true" />
            Verification email sent.
          </p>
        )}

        {devVerificationLink && (
          <p className="text-[10px] text-[var(--faint)] mt-2 font-mono">
            Dev only (no mail server yet):{" "}
            <a href={devVerificationLink} className="underline">
              {devVerificationLink}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}