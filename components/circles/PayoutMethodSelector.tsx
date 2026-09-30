"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Banknote, CheckCircle2, Lock, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import GlossaryTerm from "@/components/ui/GlossaryTerm";
import { usePayoutMethod } from "@/hooks/usePayoutMethod";
import { getPayoutMethodOptions } from "@/lib/payoutMethods";
import type { PayoutMethodId } from "@/types/payoutMethod";

const ICONS: Record<PayoutMethodId, typeof Wallet> = {
  wallet: Wallet,
  offramp: Banknote,
};

interface PayoutMethodSelectorProps {
  circleId: string;
  circleName: string;
  /** Token the circle pays out in, e.g. "USDT". */
  currency: string;
  /** Locks the selector once the user's payout is processing. */
  payoutInProgress?: boolean;
}

export default function PayoutMethodSelector({
  circleId,
  circleName,
  currency,
  payoutInProgress = false,
}: PayoutMethodSelectorProps) {
  const { showToast } = useToast();
  const { method: savedMethod, updatedAt, save } = usePayoutMethod(circleId, currency);
  const [selected, setSelected] = useState<PayoutMethodId>(savedMethod);
  const [justSaved, setJustSaved] = useState(false);
  const groupName = useId();
  const options = useMemo(() => getPayoutMethodOptions(currency), [currency]);

  useEffect(() => setSelected(savedMethod), [savedMethod]);

  const dirty = selected !== savedMethod;
  const onlyWallet = options.every((o) => o.id === "wallet" || !o.available);

  const handleSave = () => {
    if (payoutInProgress || !dirty) return;
    save(selected);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 3000);
    const label = options.find((o) => o.id === selected)?.label ?? selected;
    showToast({
      title: "Payout preference saved",
      message: `Your ${circleName} payout will go to: ${label}.`,
      variant: "success",
    });
  };

  return (
    <section className="bg-[var(--content)] p-6 rounded-2xl space-y-4" aria-labelledby={`${groupName}-title`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id={`${groupName}-title`} className="text-lg font-bold font-sora text-[var(--text)]">
            Payout Method
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Choose how you want to receive your <GlossaryTerm term="payout">payout</GlossaryTerm> for this circle.
          </p>
        </div>
        {updatedAt && (
          <p className="shrink-0 text-xs text-[var(--muted)]">
            Updated {new Date(updatedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {payoutInProgress && (
        <p role="status" className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-[var(--text)]">
          <Lock size={14} className="shrink-0 text-amber-400" aria-hidden="true" />
          Your payout is in progress, so the method can&apos;t be changed until it completes.
        </p>
      )}

      <fieldset disabled={payoutInProgress} className="space-y-3">
        <legend className="sr-only">Payout method</legend>
        {options.map((option) => {
          const Icon = ICONS[option.id];
          const disabled = payoutInProgress || !option.available;
          const checked = selected === option.id;
          const reasonId = `${groupName}-${option.id}-reason`;
          return (
            <label
              key={option.id}
              className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                checked ? "border-[#4B6B76] bg-[#4B6B76]/5" : "border-[var(--ov-1a)] bg-[var(--ov-05)]"
              } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-[#4B6B76]/60"}`}
            >
              <input
                type="radio"
                name={groupName}
                value={option.id}
                checked={checked}
                disabled={disabled}
                onChange={() => setSelected(option.id)}
                aria-describedby={option.unavailableReason ? reasonId : undefined}
                className="mt-1 accent-[#4B6B76]"
              />
              <Icon size={18} className="mt-0.5 shrink-0 text-[var(--muted)]" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-sm font-medium text-[var(--text)]">
                  {option.label}
                  {option.id === "offramp" && <GlossaryTerm term="off-ramp" iconOnly />}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-[var(--muted)]">{option.description}</span>
                {option.unavailableReason && (
                  <span id={reasonId} className="mt-1 block text-xs text-amber-400">
                    {option.unavailableReason}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </fieldset>

      {onlyWallet && !payoutInProgress && (
        <p className="text-xs text-[var(--muted)]">Payouts for this circle will go to your connected wallet.</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={payoutInProgress || !dirty}
          className="px-5 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
        >
          Save preference
        </button>
        {justSaved && (
          <span role="status" className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 size={14} aria-hidden="true" />
            Saved
          </span>
        )}
      </div>
    </section>
  );
}
