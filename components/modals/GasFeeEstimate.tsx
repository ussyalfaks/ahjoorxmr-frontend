import { Loader2, RefreshCw } from "lucide-react";
import type { GasFeeEstimate } from "@/lib/gasFee";

export default function GasFeeEstimate({
  fee,
  loading,
}: {
  fee: GasFeeEstimate | null;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl bg-[var(--ov-05)] p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-[var(--muted)]">Estimated network fee</span>
        {loading && <Loader2 size={14} className="animate-spin text-[var(--muted)]" aria-label="Updating fee estimate" />}
        {!loading && fee && <RefreshCw size={14} className="text-[var(--muted)]" aria-label="Fee estimate updates automatically" />}
      </div>
      {fee ? (
        <p className="mt-1 font-medium text-[var(--text)]">
          {fee.nativeAmount} {fee.nativeToken}{fee.fiatAmount ? ` (${fee.fiatAmount})` : ""}
        </p>
      ) : (
        <p className="mt-1 text-[var(--muted)]">Unavailable. Your wallet will show the final fee.</p>
      )}
      <p className="mt-1 text-xs text-[var(--muted)]">Estimate only. The final fee is set by the wallet and network.</p>
    </div>
  );
}