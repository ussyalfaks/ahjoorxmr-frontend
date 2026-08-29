"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { getTwoFactorState, verifyTotpToken } from "@/lib/twoFactor";

interface TwoFactorChallengeModalProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}

/**
 * Gate for any wallet-connect entry point once 2FA is enabled — this app
 * authenticates via wallet connection rather than a username/password login,
 * so this modal is the "login flow" analog described in the 2FA issue.
 */
export default function TwoFactorChallengeModal({ open, onClose, onVerified }: TwoFactorChallengeModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setToken("");
      setError(null);
    }
  }, [open]);

  useFocusTrap(dialogRef, open, onClose);

  if (!open) return null;

  function handleVerify() {
    const secret = getTwoFactorState()?.secret;
    if (!secret || !verifyTotpToken(secret, token)) {
      setError("Invalid code. Check your authenticator app and try again.");
      return;
    }
    onVerified();
  }

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="totp-challenge-title"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-sm rounded-2xl bg-[var(--modal)] border border-[var(--ov-14)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="totp-challenge-title" className="flex items-center gap-2 text-lg font-semibold text-[var(--text)]">
            <ShieldCheck size={18} aria-hidden="true" />
            Enter your 2FA code
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-[var(--muted)] hover:text-[var(--text)]">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-[var(--muted)] mb-4">
          This account has two-factor authentication enabled. Enter the 6-digit code from your
          authenticator app to continue.
        </p>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoFocus
          value={token}
          onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          placeholder="123456"
          className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-2.5 text-center text-lg font-mono tracking-[0.4em] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
        />
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--ov-1a)] text-[var(--text)] py-2.5 font-medium hover:bg-[var(--ov-0a)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            className="flex-1 rounded-xl bg-[#4B6B76] hover:bg-[#3D5A64] text-white py-2.5 font-semibold transition-colors"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
}
