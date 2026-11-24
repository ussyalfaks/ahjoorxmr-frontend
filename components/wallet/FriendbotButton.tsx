"use client";

/**
 * Issue #218 – Add Friendbot Testnet Funding Button.
 *
 * Renders a "Fund with Friendbot" button only when the active network is
 * "testnet".  Calls the Stellar Friendbot faucet for the connected address,
 * shows a toast on success or failure, and triggers a balance refresh.
 * Hidden entirely on mainnet builds.
 */

import { useState, useCallback } from "react";
import { useWallet } from "@/contexts/WalletContext";

const FRIENDBOT_URL = "https://friendbot.stellar.org";

interface FriendbotButtonProps {
  /** Extra Tailwind classes */
  className?: string;
}

export function FriendbotButton({ className = "" }: FriendbotButtonProps) {
  const { address, isConnected, network, refreshBalance } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFundWithFriendbot = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const url = `${FRIENDBOT_URL}/?addr=${encodeURIComponent(address)}`;
      const res = await fetch(url);
      if (res.ok) {
        showToast("Account funded successfully via Friendbot!", "success");
        await refreshBalance();
      } else {
        const body = await res.text().catch(() => "");
        const detail = body ? ` (${body.slice(0, 80)})` : "";
        showToast(`Friendbot request failed: ${res.status}${detail}`, "error");
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Friendbot request failed",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, refreshBalance]);

  // Only show on testnet. Kept below every hook so the hook order never changes between renders.
  if (network !== "testnet") return null;
  if (!isConnected || !address) return null;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={handleFundWithFriendbot}
        disabled={isLoading}
        className="flex items-center gap-1.5 rounded-md border border-yellow-400 bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-800 transition hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-300 dark:hover:bg-yellow-900/40"
        title="Fund your testnet account with 10 000 XLM via Stellar Friendbot"
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <span aria-hidden="true">⭐</span>
        )}
        {isLoading ? "Funding…" : "Fund with Friendbot"}
      </button>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`absolute left-0 top-full z-50 mt-2 w-72 rounded-md p-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 dark:bg-green-900/40 dark:text-green-200"
              : "bg-red-50 text-red-800 dark:bg-red-900/40 dark:text-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
