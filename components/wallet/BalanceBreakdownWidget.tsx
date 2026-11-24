"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Lock, RefreshCw, Wallet as WalletIcon } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { MOCK_LOCKED_FUNDS, getTotalLocked } from "@/data/lockedFunds";
import { fetchHorizonBalances, type HorizonBalance } from "@/lib/horizonBalance";

const REFRESH_INTERVAL_MS = 30_000;

export default function BalanceBreakdownWidget() {
  const [expanded, setExpanded] = useState(false);
  const { linkedWallets, activeWalletAddress } = useWallet();

  const [horizonData, setHorizonData] = useState<HorizonBalance | null>(null);
  const [horizonLoading, setHorizonLoading] = useState(false);
  const [horizonError, setHorizonError] = useState<string | null>(null);

  const activeWallet = linkedWallets.find((w) => w.address === activeWalletAddress);

  const loadBalances = useCallback(async () => {
    if (!activeWalletAddress) return;
    setHorizonLoading(true);
    setHorizonError(null);
    try {
      const data = await fetchHorizonBalances(activeWalletAddress);
      setHorizonData(data);
    } catch {
      setHorizonError("Could not load on-chain balances.");
    } finally {
      setHorizonLoading(false);
    }
  }, [activeWalletAddress]);

  useEffect(() => {
    void loadBalances();
    const timer = setInterval(() => void loadBalances(), REFRESH_INTERVAL_MS);
    const onFocus = () => void loadBalances();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadBalances]);

  const lockedAmount = getTotalLocked();
  const hasLockedFunds = MOCK_LOCKED_FUNDS.length > 0 && lockedAmount > 0;

  // Prefer on-chain data; fall back to wallet context balance while loading
  const totalBalance = horizonData ? horizonData.nativeTotal : (activeWallet?.balance ?? 0);
  const availableAmount = horizonData ? horizonData.nativeAvailable : Math.max(totalBalance - lockedAmount, 0);
  const reservedAmount = horizonData ? horizonData.nativeReserved : lockedAmount;
  const usdcBalance = horizonData?.usdc ?? null;

  const lockedPct = totalBalance > 0 ? Math.min((reservedAmount / totalBalance) * 100, 100) : 0;
  const availablePct = totalBalance > 0 ? 100 - lockedPct : 0;

  return (
    <div className="bg-[var(--modal)] p-6 rounded-2xl border border-[var(--ov-10)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#4B6B76]/15 text-[#4B6B76] flex items-center justify-center">
            <WalletIcon size={16} aria-hidden="true" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Balance Breakdown
          </span>
        </div>
        <button
          type="button"
          onClick={() => void loadBalances()}
          disabled={horizonLoading}
          aria-label="Refresh balances"
          className="text-[var(--muted)] hover:text-[#4B6B76] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={horizonLoading ? "animate-spin" : ""} aria-hidden="true" />
        </button>
      </div>

      {horizonError && (
        <p className="mb-4 text-xs text-amber-500 bg-amber-500/10 px-3 py-2 rounded-lg">
          {horizonError} Showing last known values.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <p className="text-[var(--muted)] text-xs font-medium mb-1">Available XLM</p>
          {horizonLoading && !horizonData ? (
            <div className="h-8 w-24 rounded bg-[var(--ov-0a)] animate-pulse" />
          ) : (
            <p className="text-2xl font-semibold font-sora text-[var(--text)]">
              {availableAmount.toLocaleString(undefined, { maximumFractionDigits: 7 })}
            </p>
          )}
        </div>
        <div>
          <p className="text-[var(--muted)] text-xs font-medium mb-1">Reserved XLM</p>
          {horizonLoading && !horizonData ? (
            <div className="h-8 w-24 rounded bg-[var(--ov-0a)] animate-pulse" />
          ) : (
            <p className="text-2xl font-semibold font-sora text-[var(--text)]">
              {reservedAmount.toLocaleString(undefined, { maximumFractionDigits: 7 })}
            </p>
          )}
        </div>
      </div>

      {usdcBalance !== null && (
        <div className="mb-4">
          <p className="text-[var(--muted)] text-xs font-medium mb-1">USDC</p>
          <p className="text-lg font-semibold font-sora text-[var(--text)]">
            {usdcBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC
          </p>
        </div>
      )}

      <div className="h-2 rounded-full bg-[var(--ov-0a)] overflow-hidden flex mb-4" aria-hidden="true">
        <div className="h-full bg-[#4B6B76]" style={{ width: `${availablePct}%` }} />
        <div className="h-full bg-amber-500" style={{ width: `${lockedPct}%` }} />
      </div>

      {!hasLockedFunds ? (
        <p className="text-sm text-[var(--muted)]">
          You have no funds locked in active circle contributions right now.
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="w-full flex items-center justify-between text-sm font-medium text-[var(--text)] hover:text-[#4B6B76] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded-lg px-1 py-1"
          >
            <span className="flex items-center gap-1.5">
              <Lock size={14} aria-hidden="true" />
              Locked by circle
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {expanded && (
            <ul className="mt-3 space-y-2">
              {MOCK_LOCKED_FUNDS.map((fund) => (
                <li
                  key={fund.id}
                  className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-[var(--ov-05)]"
                >
                  <span className="text-[var(--text)]">{fund.name}</span>
                  <span className="text-[var(--muted)] font-medium">
                    {fund.amount.toLocaleString()} {fund.token}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
