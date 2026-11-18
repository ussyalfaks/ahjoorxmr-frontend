"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/components/ui/Toast";

// #217: in a real integration this whole component would be driven by
// `Horizon.loadAccount(address).balances.some(b => b.asset_code === USDC_CODE
// && b.asset_issuer === USDC_ISSUER)` (both from env config) instead of the
// mock `hasUsdcTrustline` flag on the wallet record — see
// contexts/WalletContext.tsx's LinkedWallet type and
// config/network.ts-style env sourcing. The check-on-connect /
// banner-on-missing / one-click-add / explain-the-reserve / dismiss-on-
// success flow below is written exactly as it would be against the real
// thing.
export default function TrustlineBanner() {
  const { activeWalletAddress, linkedWallets, addUsdcTrustline } = useWallet();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const activeWallet = linkedWallets.find((w) => w.address === activeWalletAddress);
  if (!activeWallet || activeWallet.hasUsdcTrustline) return null;
  const walletAddress = activeWallet.address;

  async function handleAddTrustline() {
    setSubmitting(true);
    try {
      // Stand-in for building + signing a changeTrust operation and
      // submitting it to Horizon. The 0.5 XLM is real Stellar protocol
      // behavior (the base reserve per trustline/subentry), not a
      // Konfirm/Ahjoor fee — worth saying explicitly since "the app is
      // charging me" is the natural first read of a reserve requirement.
      await new Promise((resolve) => setTimeout(resolve, 1200));
      addUsdcTrustline(walletAddress);
      showToast({
        title: "USDC trustline added",
        message: "You can now receive USDC payouts from your circles.",
        variant: "success",
      });
    } catch {
      showToast({
        title: "Couldn't add the trustline",
        message: "Please try again.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex gap-3">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">USDC trustline required</p>
          <p className="mt-0.5 text-sm text-[var(--muted)]">
            Your wallet can&apos;t receive USDC payouts yet. Adding a trustline is a one-time Stellar
            transaction that reserves <strong className="text-[var(--text)]">0.5 XLM</strong> from your
            balance (Stellar&apos;s base reserve for holding a new asset) — it stays locked while the
            trustline exists, and isn&apos;t a Konfirm or Ahjoor fee.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleAddTrustline}
        disabled={submitting}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#4B6B76] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3D5A64] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
        {submitting ? "Adding…" : "Add USDC trustline"}
      </button>
    </div>
  );
}
