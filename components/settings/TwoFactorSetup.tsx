"use client";

import { useEffect, useRef, useState } from "react";
import { Download, KeyRound, Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import {
  completeTwoFactorSetup,
  disableTwoFactor,
  generateBackupCodes,
  getTwoFactorState,
  startTwoFactorSetup,
  verifyTotpToken,
  type PendingSetup,
} from "@/lib/twoFactor";

type Step = "idle" | "scan" | "verify" | "backup-codes" | "enabled" | "disabling";

function formatSecret(secret: string) {
  return secret.match(/.{1,4}/g)?.join(" ") ?? secret;
}

export default function TwoFactorSetup({ accountLabel }: { accountLabel: string }) {
  const [step, setStep] = useState<Step>("idle");
  const [pending, setPending] = useState<PendingSetup | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disableToken, setDisableToken] = useState("");
  const [disableError, setDisableError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const codesRef = useRef<string[]>([]);

  useEffect(() => {
    setStep(getTwoFactorState()?.enabled ? "enabled" : "idle");
  }, []);

  async function handleStart() {
    setBusy(true);
    setError(null);
    try {
      const setup = await startTwoFactorSetup(accountLabel);
      setPending(setup);
      setStep("scan");
    } finally {
      setBusy(false);
    }
  }

  function handleVerify() {
    if (!pending) return;
    if (!verifyTotpToken(pending.secret, token)) {
      setError("That code didn't match. Check your authenticator app and try again.");
      return;
    }
    setError(null);
    const codes = generateBackupCodes();
    codesRef.current = codes;
    setBackupCodes(codes);
    setStep("backup-codes");
  }

  async function handleFinish() {
    if (!pending) return;
    setBusy(true);
    try {
      await completeTwoFactorSetup(pending.secret, codesRef.current);
      setStep("enabled");
      setPending(null);
      setToken("");
    } finally {
      setBusy(false);
    }
  }

  function handleDownloadCodes() {
    const blob = new Blob(
      [`Ahjoor 2FA backup codes\nGenerated ${new Date().toLocaleString()}\n\n${backupCodes.join("\n")}\n`],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ahjoor-2fa-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleDisableConfirm() {
    if (!verifyTotpToken(getTwoFactorState()?.secret ?? "", disableToken)) {
      setDisableError("Enter a valid authenticator code to confirm.");
      return;
    }
    disableTwoFactor();
    setStep("idle");
    setDisableToken("");
    setDisableError(null);
  }

  return (
    <section className="rounded-lg border border-gray-200 dark:border-[var(--border)] bg-white dark:bg-[var(--content)] p-5 lg:col-span-2">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-[var(--text)]">
          Two-Factor Authentication
        </h2>
        {step === "enabled" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={11} aria-hidden="true" /> Enabled
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500 dark:text-[var(--muted)]">
        Require a code from an authenticator app in addition to your wallet when you connect.
      </p>

      {step === "idle" && (
        <button
          type="button"
          onClick={handleStart}
          disabled={busy}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
          Enable 2FA
        </button>
      )}

      {step === "scan" && pending && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pending.qrDataUrl}
              alt="Scan this QR code with your authenticator app"
              className="rounded-lg border border-gray-200 dark:border-[var(--border)]"
              width={180}
              height={180}
            />
            <div className="space-y-2">
              <p className="text-sm text-gray-700 dark:text-[var(--text)]">
                Scan with Google Authenticator, Authy, or any TOTP app. Can&apos;t scan? Enter this
                key manually:
              </p>
              <p className="rounded-md bg-gray-100 dark:bg-[var(--modal)] px-3 py-2 font-mono text-xs tracking-wider text-gray-800 dark:text-[var(--text)]">
                {formatSecret(pending.secret)}
              </p>
            </div>
          </div>
          <div>
            <label htmlFor="totp-verify" className="block text-xs font-medium text-gray-500 dark:text-[var(--muted)] mb-1.5">
              Enter the 6-digit code from your app to confirm setup
            </label>
            <input
              id="totp-verify"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-32 rounded-md border border-gray-300 dark:border-[var(--border)] dark:bg-[var(--modal)] dark:text-[var(--text)] px-3 py-2 text-sm font-mono tracking-widest focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setStep("idle");
                setPending(null);
                setToken("");
                setError(null);
              }}
              className="rounded-md border border-gray-300 dark:border-[var(--border)] px-3 py-1.5 text-sm text-gray-700 dark:text-[var(--text)] hover:bg-gray-50 dark:hover:bg-[var(--ov-0a)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleVerify}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Verify & Continue
            </button>
          </div>
        </div>
      )}

      {step === "backup-codes" && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-700 dark:text-[var(--text)]">
            Save these backup codes somewhere safe. Each can be used once to get back in if you
            lose access to your authenticator app. They won&apos;t be shown again.
          </p>
          <div className="grid grid-cols-2 gap-2 rounded-md bg-gray-100 dark:bg-[var(--modal)] p-4 font-mono text-sm text-gray-800 dark:text-[var(--text)]">
            {backupCodes.map((code) => (
              <span key={code}>{code}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownloadCodes}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-[var(--border)] px-3 py-1.5 text-sm text-gray-700 dark:text-[var(--text)] hover:bg-gray-50 dark:hover:bg-[var(--ov-0a)]"
            >
              <Download size={14} /> Download codes
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleFinish}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? "Finishing..." : "I've saved my codes — done"}
            </button>
          </div>
        </div>
      )}

      {step === "enabled" && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setStep("disabling")}
            className="inline-flex items-center gap-2 rounded-md border border-red-300 dark:border-red-800/60 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/15"
          >
            <ShieldOff size={14} /> Disable 2FA
          </button>
        </div>
      )}

      {step === "disabling" && (
        <div className="mt-4 space-y-3 rounded-md border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-500/10 p-4">
          <p className="text-sm text-red-800 dark:text-red-300">
            Re-authenticate to disable 2FA — enter a current code from your authenticator app.
          </p>
          <div className="flex items-center gap-2">
            <KeyRound size={14} className="text-red-500" aria-hidden="true" />
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={disableToken}
              onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-32 rounded-md border border-red-300 dark:border-red-800/60 bg-white dark:bg-[var(--modal)] px-3 py-2 text-sm font-mono tracking-widest text-gray-800 dark:text-[var(--text)]"
            />
          </div>
          {disableError && <p className="text-xs text-red-600 dark:text-red-400">{disableError}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setStep("enabled");
                setDisableToken("");
                setDisableError(null);
              }}
              className="rounded-md border border-gray-300 dark:border-[var(--border)] px-3 py-1.5 text-sm text-gray-700 dark:text-[var(--text)] hover:bg-gray-50 dark:hover:bg-[var(--ov-0a)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDisableConfirm}
              className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-800"
            >
              Confirm disable
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
