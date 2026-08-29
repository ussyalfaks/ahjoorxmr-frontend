"use client";

import { useEffect, useRef, useState } from "react";
import { Info, ShieldCheck, X, Zap } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import { useToast } from "@/components/ui/Toast";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { disableAutoPay, enableAutoPay, getAutoPayConfig } from "@/lib/autoPay";
import type { AutoPayConfig } from "@/types/autoPay";

interface AutoPaySectionProps {
  circleId: string;
  /** Default authorized amount to pre-fill, e.g. "50 USDT" (the circle's contribution). */
  defaultAmount: string;
  /** Human label for the round cadence, e.g. "2 Days". */
  roundDuration: string;
  /** "compact" renders a single toggle row (circle detail page); "manage" renders
   * the fuller authorization + pause/cancel panel (circle settings page). */
  variant?: "compact" | "manage";
}

function EnableConfirmModal({
  open,
  onClose,
  onConfirm,
  amount,
  setAmount,
  frequencyLabel,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: string;
  setAmount: (v: string) => void;
  frequencyLabel: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open, onClose);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="autopay-confirm-title"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl bg-[var(--modal)] border border-[var(--ov-14)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="autopay-confirm-title" className="flex items-center gap-2 text-lg font-semibold text-[var(--text)]">
            <Zap size={18} aria-hidden="true" />
            Enable Auto-Pay
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-[var(--muted)] hover:text-[var(--text)]">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-[var(--ov-05)] p-3 mb-4">
          <Info size={16} className="mt-0.5 shrink-0 text-[var(--muted)]" aria-hidden="true" />
          <p className="text-xs text-[var(--muted)]">
            Turning this on authorizes your connected wallet to automatically send the
            contribution below each round, without asking you to confirm every time. You can
            revoke this authorization and pause or cancel auto-pay at any time from circle
            settings.
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="autopay-amount" className="block text-xs text-[var(--muted)] mb-1.5">
            Authorized amount per round
          </label>
          <input
            id="autopay-amount"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
          />
        </div>

        <dl className="space-y-2 rounded-xl bg-[var(--ov-05)] p-3 text-xs mb-5">
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Frequency</dt>
            <dd className="text-[var(--text)] font-medium">{frequencyLabel}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Cancellation</dt>
            <dd className="text-[var(--text)] font-medium">Anytime, from circle settings</dd>
          </div>
        </dl>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--ov-1a)] text-[var(--text)] py-2.5 font-medium hover:bg-[var(--ov-0a)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#4B6B76] hover:bg-[#3D5A64] text-white py-2.5 font-semibold transition-colors"
          >
            <ShieldCheck size={16} aria-hidden="true" />
            Authorize
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AutoPaySection({
  circleId,
  defaultAmount,
  roundDuration,
  variant = "compact",
}: AutoPaySectionProps) {
  const { showToast } = useToast();
  const [config, setConfig] = useState<AutoPayConfig | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [amountInput, setAmountInput] = useState(defaultAmount);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const frequencyLabel = `Every round (every ${roundDuration})`;

  useEffect(() => {
    setConfig(getAutoPayConfig(circleId));
  }, [circleId]);

  function handleToggle(next: boolean) {
    if (next) {
      setAmountInput(config?.authorizedAmount ?? defaultAmount);
      setShowConfirm(true);
    } else {
      setConfirmingCancel(true);
    }
  }

  function handleConfirmEnable() {
    const updated = enableAutoPay({ circleId, authorizedAmount: amountInput, frequency: frequencyLabel });
    setConfig(updated);
    setShowConfirm(false);
    showToast({
      title: "Auto-Pay enabled",
      message: `${amountInput} authorized ${frequencyLabel.toLowerCase()}.`,
      variant: "success",
    });
  }

  function handleDisable() {
    disableAutoPay(circleId);
    setConfig((current) => (current ? { ...current, enabled: false } : current));
    setConfirmingCancel(false);
    showToast({ title: "Auto-Pay paused", message: "Your wallet authorization has been revoked.", variant: "success" });
  }

  const enabled = config?.enabled ?? false;

  if (variant === "compact") {
    return (
      <>
        <div className="flex items-center justify-between bg-[var(--content)] p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-[var(--ov-0a)] text-[var(--muted)]"}`}>
              <Zap size={16} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Auto-Pay</p>
              <p className="text-xs text-[var(--muted)]">
                {enabled
                  ? `Authorized ${config?.authorizedAmount} · ${config?.frequency ?? frequencyLabel}`
                  : "Automatically contribute each round without manual confirmation."}
              </p>
            </div>
          </div>
          <Toggle checked={enabled} onChange={handleToggle} id="autopay-toggle-compact" />
        </div>

        {config?.lastAttempt?.status === "failed" && enabled && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-500/10 p-4">
            <Info size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Auto-Pay attempt failed</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {config.lastAttempt.reason ?? "We couldn't complete your automatic contribution this round."}
                {" "}Please make a manual contribution below to avoid missing this round.
              </p>
            </div>
          </div>
        )}

        <EnableConfirmModal
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirmEnable}
          amount={amountInput}
          setAmount={setAmountInput}
          frequencyLabel={frequencyLabel}
        />

        {confirmingCancel && (
          <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" role="dialog" aria-modal="true" onClick={() => setConfirmingCancel(false)}>
            <div className="w-full max-w-sm rounded-2xl bg-[var(--modal)] border border-[var(--ov-14)] p-6" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-base font-semibold text-[var(--text)]">Turn off Auto-Pay?</h4>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Your wallet authorization will be revoked. You&apos;ll need to make contributions manually until you re-enable it.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setConfirmingCancel(false)} className="rounded-lg border border-[var(--ov-14)] px-3.5 py-2 text-sm text-[var(--text)] hover:bg-[var(--ov-0a)] transition-colors">
                  Keep it on
                </button>
                <button type="button" onClick={handleDisable} className="rounded-lg bg-[#FF5B5B] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#e14e4e] transition-colors">
                  Turn off
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // "manage" variant — used in circle settings for pausing/cancelling at any time.
  return (
    <section className="bg-[var(--content)] p-6 rounded-2xl space-y-4">
      <div>
        <h2 className="text-lg font-bold font-sora text-[var(--text)]">Auto-Pay</h2>
        <p className="text-xs text-[var(--muted)] mt-1">
          Manage this circle&apos;s recurring contribution authorization.
        </p>
      </div>

      {enabled ? (
        <>
          <dl className="grid grid-cols-2 gap-4 rounded-xl bg-[var(--ov-05)] p-4 text-sm">
            <div>
              <dt className="text-xs text-[var(--muted)] mb-1">Authorized amount</dt>
              <dd className="font-medium text-[var(--text)]">{config?.authorizedAmount}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)] mb-1">Frequency</dt>
              <dd className="font-medium text-[var(--text)]">{config?.frequency}</dd>
            </div>
          </dl>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmingCancel(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5B5B1a] hover:bg-[#FF5B5B29] text-[#FF5B5B] text-sm font-medium rounded-lg transition-colors"
            >
              Pause / Cancel Auto-Pay
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => {
            setAmountInput(config?.authorizedAmount ?? defaultAmount);
            setShowConfirm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Zap size={16} aria-hidden="true" />
          Enable Auto-Pay
        </button>
      )}

      <EnableConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmEnable}
        amount={amountInput}
        setAmount={setAmountInput}
        frequencyLabel={frequencyLabel}
      />

      {confirmingCancel && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" role="dialog" aria-modal="true" onClick={() => setConfirmingCancel(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-[var(--modal)] border border-[var(--ov-14)] p-6" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-base font-semibold text-[var(--text)]">Pause or cancel Auto-Pay?</h4>
            <p className="mt-2 text-sm text-[var(--muted)]">
              This revokes the wallet authorization immediately. You can re-enable it later from this page.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmingCancel(false)} className="rounded-lg border border-[var(--ov-14)] px-3.5 py-2 text-sm text-[var(--text)] hover:bg-[var(--ov-0a)] transition-colors">
                Keep it on
              </button>
              <button type="button" onClick={handleDisable} className="rounded-lg bg-[#FF5B5B] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#e14e4e] transition-colors">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
