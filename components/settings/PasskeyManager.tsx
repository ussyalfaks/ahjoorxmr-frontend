"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Loader2, ShieldAlert, Trash2 } from "lucide-react";
import {
  getPasskeys,
  isPasskeySupported,
  registerPasskey,
  removePasskey,
  type StoredPasskey,
} from "@/lib/passkeys";

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Never used";
}

function getDeviceName(): string {
  if (typeof navigator === "undefined") return "This device";
  const platform = navigator.platform;
  return platform ? `${platform} device` : "This device";
}

export default function PasskeyManager() {
  const [passkeys, setPasskeys] = useState<StoredPasskey[]>([]);
  const [deviceName, setDeviceName] = useState(getDeviceName);
  const [showNameInput, setShowNameInput] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supported = isPasskeySupported();

  useEffect(() => {
    setPasskeys(getPasskeys());
  }, []);

  async function handleRegister() {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const passkey = await registerPasskey(deviceName);
      setPasskeys((current) => [...current.filter((item) => item.id !== passkey.id), passkey]);
      setShowNameInput(false);
      setSuccess(`${passkey.deviceName} is now ready for passkey sign-in.`);
    } catch (registrationError) {
      setError(registrationError instanceof Error ? registrationError.message : "Passkey registration failed.");
    } finally {
      setBusy(false);
    }
  }

  function handleRemove(passkey: StoredPasskey) {
    removePasskey(passkey.id);
    setPasskeys((current) => current.filter((item) => item.id !== passkey.id));
    setSuccess(`${passkey.deviceName} was removed.`);
  }

  return (
    <section className="rounded-2xl border border-[var(--ov-10)] bg-[var(--content)] p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4B6B76]/15 text-[#4B6B76]">
            <KeyRound size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold font-sora text-[var(--text)]">Passkeys</h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
              Sign in with Face ID, a fingerprint, or your device PIN without exposing a password.
            </p>
          </div>
        </div>
        {passkeys.length > 0 && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-500">
            <CheckCircle2 size={12} aria-hidden="true" /> Enabled
          </span>
        )}
      </div>

      {!supported && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-300">
          <ShieldAlert size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>This browser or device does not support passkeys. You can continue using your wallet sign-in.</span>
        </div>
      )}

      {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
      {success && <p role="status" className="text-xs font-medium text-emerald-500">{success}</p>}

      {passkeys.length > 0 && (
        <div className="divide-y divide-[var(--ov-08)] rounded-xl border border-[var(--ov-10)] bg-[var(--modal)]">
          {passkeys.map((passkey) => (
            <div key={passkey.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text)]">{passkey.deviceName}</p>
                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  Added {formatDate(passkey.createdAt)} · Last used {formatDate(passkey.lastUsedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(passkey)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-500/25 px-2.5 py-1.5 text-[11px] font-semibold text-red-500 transition-colors hover:bg-red-500/10"
                aria-label={`Remove ${passkey.deviceName}`}
              >
                <Trash2 size={13} aria-hidden="true" />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {supported && (showNameInput ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="flex-1 text-xs font-medium text-[var(--muted)]">
            Device name
            <input
              value={deviceName}
              onChange={(event) => setDeviceName(event.target.value)}
              maxLength={60}
              className="mt-1 h-10 w-full rounded-xl border border-[var(--ov-10)] bg-[var(--modal)] px-3 text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-[#4B6B76]"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowNameInput(false)}
              className="rounded-xl border border-[var(--ov-14)] px-3 py-2 text-xs font-medium text-[var(--text)] hover:bg-[var(--ov-08)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRegister}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#4B6B76] px-3 py-2 text-xs font-semibold text-white hover:bg-[#3D5A64] disabled:opacity-50"
            >
              {busy && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
              {busy ? "Waiting..." : "Continue"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setSuccess(null);
            setShowNameInput(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#4B6B76] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#3D5A64]"
        >
          <KeyRound size={14} aria-hidden="true" />
          Add a passkey
        </button>
      ))}
    </section>
  );
}
