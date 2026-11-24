import { CURRENT_WALLET } from "@/data/circles";
import { MOCK_CONTRIBUTIONS } from "@/data/contributions";
import { MOCK_PAYOUT_HISTORY } from "@/data/payouts";

export const ACCOUNT_EXPORT_RATE_LIMIT_MS = 5 * 60 * 1000;
export const ACCOUNT_EXPORT_STORAGE_KEY = "ahjoorxmr:account-export:last";

export interface AccountExportPayload {
  exportedAt: string;
  profile: { walletAddress: string; settings: unknown };
  contributions: typeof MOCK_CONTRIBUTIONS;
  payouts: typeof MOCK_PAYOUT_HISTORY;
  notificationPreferences: unknown;
}

export function buildAccountExport(settings: unknown, notificationPreferences: unknown, exportedAt = new Date().toISOString()): AccountExportPayload {
  return {
    exportedAt,
    profile: { walletAddress: CURRENT_WALLET, settings },
    contributions: MOCK_CONTRIBUTIONS,
    payouts: MOCK_PAYOUT_HISTORY,
    notificationPreferences,
  };
}

export function getExportRetryAt(now = Date.now()) {
  if (typeof window === "undefined") return null;
  const last = Number(window.localStorage.getItem(ACCOUNT_EXPORT_STORAGE_KEY));
  if (!Number.isFinite(last) || last <= 0 || now - last >= ACCOUNT_EXPORT_RATE_LIMIT_MS) return null;
  return last + ACCOUNT_EXPORT_RATE_LIMIT_MS;
}

export function markExportRequested(now = Date.now()) {
  window.localStorage.setItem(ACCOUNT_EXPORT_STORAGE_KEY, String(now));
}
