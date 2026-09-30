"use client";

import { Banknote, Wallet } from "lucide-react";
import { usePayoutMethod } from "@/hooks/usePayoutMethod";
import { OFFRAMP_CONFIG } from "@/lib/payoutMethods";

/** Compact "Paid to: …" line for upcoming payout summaries. */
export default function PayoutMethodBadge({ circleId, currency }: { circleId: string; currency: string }) {
  const { method } = usePayoutMethod(circleId, currency);
  const isWallet = method === "wallet";
  const Icon = isWallet ? Wallet : Banknote;

  return (
    <div>
      <p className="text-xs text-[var(--muted)] mb-1">Paid to</p>
      <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--text)]">
        <Icon size={14} className="text-[#4B6B76]" aria-hidden="true" />
        {isWallet ? "Connected wallet" : `Bank account · ${OFFRAMP_CONFIG.partnerName}`}
      </p>
    </div>
  );
}
