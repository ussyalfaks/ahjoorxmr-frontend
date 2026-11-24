"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { publicEnv } from "@/lib/env";

/**
 * Issue #217 – Network Switcher Guard (Testnet vs Mainnet Mismatch)
 *
 * Detects whether the connected Freighter wallet's network passphrase
 * matches the app's configured network passphrase.  When there is a
 * mismatch a blocking modal is rendered and all transaction triggers
 * are disabled until the user switches networks.
 *
 * The hook `useNetworkGuard` is exported so any component that initiates
 * a transaction can check `networkMismatch` before proceeding.
 */

// The app's canonical network passphrase comes from the environment.
// Falls back to Stellar testnet so the guard works in development.
const APP_NETWORK_PASSPHRASE = publicEnv.stellarNetworkPassphrase;
const APP_NETWORK_LABEL = publicEnv.stellarNetworkLabel;

// ---------------------------------------------------------------------------
// Freighter browser-extension shim
// ---------------------------------------------------------------------------

interface FreighterAPI {
  getNetworkDetails?: () => Promise<{
    network: string;
    networkPassphrase: string;
    networkUrl: string;
  }>;
  isConnected?: () => Promise<boolean>;
}

function getFreighter(): FreighterAPI | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).freighterApi ?? null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface NetworkGuardState {
  /** true while the first check hasn't resolved yet */
  loading: boolean;
  /** true when wallet network ≠ app network */
  networkMismatch: boolean;
  /** The passphrase the wallet is currently on */
  walletPassphrase: string | null;
  /** Re-run the check (useful after the user says they switched) */
  recheck: () => Promise<void>;
}

export function useNetworkGuard(): NetworkGuardState {
  const [loading, setLoading] = useState(true);
  const [walletPassphrase, setWalletPassphrase] = useState<string | null>(null);

  const check = async () => {
    setLoading(true);
    try {
      const freighter = getFreighter();
      if (!freighter?.getNetworkDetails) {
        // Extension not present – treat as no mismatch so we don't block non-Freighter users.
        setWalletPassphrase(APP_NETWORK_PASSPHRASE);
        return;
      }
      const connected = await freighter.isConnected?.();
      if (!connected) {
        setWalletPassphrase(APP_NETWORK_PASSPHRASE);
        return;
      }
      const details = await freighter.getNetworkDetails();
      setWalletPassphrase(details.networkPassphrase);
    } catch {
      setWalletPassphrase(APP_NETWORK_PASSPHRASE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    check();
    // Re-check whenever the user might switch networks in the extension.
    window.addEventListener("freighter_network_changed", check);
    return () => window.removeEventListener("freighter_network_changed", check);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const networkMismatch =
    !loading &&
    walletPassphrase !== null &&
    walletPassphrase !== APP_NETWORK_PASSPHRASE;

  return { loading, networkMismatch, walletPassphrase, recheck: check };
}

// ---------------------------------------------------------------------------
// Blocking modal
// ---------------------------------------------------------------------------

interface NetworkMismatchModalProps {
  walletPassphrase: string;
  onRecheck: () => Promise<void>;
}

function passphraseToLabel(passphrase: string): string {
  if (passphrase.includes("Public Global Stellar Network")) return "Mainnet";
  if (passphrase.includes("Test SDF Network")) return "Testnet";
  return passphrase.slice(0, 30) + "…";
}

function NetworkMismatchModal({ walletPassphrase, onRecheck }: NetworkMismatchModalProps) {
  const [rechecking, setRechecking] = useState(false);

  const handleRecheck = async () => {
    setRechecking(true);
    await onRecheck();
    setRechecking(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="network-mismatch-title"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#161616] p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/15">
            <AlertTriangle size={24} className="text-amber-400" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              id="network-mismatch-title"
              className="text-lg font-semibold text-white"
            >
              Wrong Network Detected
            </h2>
            <p className="mt-2 text-sm text-[#A1A1AA] leading-relaxed">
              Your Freighter wallet is connected to{" "}
              <span className="font-medium text-amber-300">
                {passphraseToLabel(walletPassphrase)}
              </span>
              , but this app requires{" "}
              <span className="font-medium text-white">{APP_NETWORK_LABEL}</span>.
              Transactions are disabled until you switch.
            </p>

            <div className="mt-4 rounded-xl bg-[#1E1E1E] border border-white/5 p-4 space-y-2 text-sm">
              <p className="text-[#A1A1AA] font-medium">How to switch networks in Freighter:</p>
              <ol className="list-decimal list-inside text-[#A1A1AA] space-y-1">
                <li>Open the Freighter extension.</li>
                <li>Click the network selector in the top-right corner.</li>
                <li>
                  Choose{" "}
                  <span className="text-white font-medium">{APP_NETWORK_LABEL}</span>.
                </li>
                <li>Return here and click &ldquo;I&apos;ve switched&rdquo; below.</li>
              </ol>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleRecheck}
                disabled={rechecking}
                className="flex-1 rounded-xl bg-[#4B6B76] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5a7f8c] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              >
                {rechecking ? "Checking…" : "I've switched"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Guard wrapper
// ---------------------------------------------------------------------------

/**
 * Wrap any subtree that should be blocked during a network mismatch.
 *
 * ```tsx
 * <NetworkGuard>
 *   <SendTransferModal />
 * </NetworkGuard>
 * ```
 */
export default function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { loading, networkMismatch, walletPassphrase, recheck } = useNetworkGuard();

  if (loading) return <>{children}</>;

  return (
    <>
      {children}
      {networkMismatch && walletPassphrase && (
        <NetworkMismatchModal
          walletPassphrase={walletPassphrase}
          onRecheck={recheck}
        />
      )}
    </>
  );
}
