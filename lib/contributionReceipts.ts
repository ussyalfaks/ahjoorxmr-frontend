import { MOCK_CONTRIBUTIONS } from "@/data/contributions";
import type { ContributionRecord } from "@/types/contribution";

const RESENT_KEY = "ahjoor:contribution-receipts-resent";

/** Minimum gap between resends of the same receipt, to avoid inbox spam. */
export const RECEIPT_RESEND_COOLDOWN_MS = 60 * 1000;

/** Only contributions with an on-chain payment have a receipt to email. */
export function findContributionReceipt(id: string): ContributionRecord | undefined {
  return MOCK_CONTRIBUTIONS.find((record) => record.id === id && record.transactionHash);
}

export function getContributionReceiptId(record: ContributionRecord): string {
  return `AHJR-C-${(record.transactionHash ?? record.id).replace(/^0x/, "").slice(0, 8).toUpperCase()}`;
}

function readResent(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(RESENT_KEY) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function getReceiptResendCooldownMs(id: string, now = Date.now()): number {
  const lastSentAt = readResent()[id];
  return lastSentAt ? Math.max(0, lastSentAt + RECEIPT_RESEND_COOLDOWN_MS - now) : 0;
}

/**
 * Stand-in for the receipt email API (e.g. POST /api/contributions/:id/receipt).
 * Delivery is simulated; only the resend timestamp is persisted so the
 * cooldown survives a reload.
 */
export async function resendContributionReceipt(id: string): Promise<void> {
  if (!findContributionReceipt(id)) throw new Error("This contribution has no receipt to send.");
  const cooldownMs = getReceiptResendCooldownMs(id);
  if (cooldownMs > 0) {
    throw new Error(`Please wait ${Math.ceil(cooldownMs / 1000)}s before resending.`);
  }
  await new Promise((resolve) => setTimeout(resolve, 600));
  try {
    localStorage.setItem(RESENT_KEY, JSON.stringify({ ...readResent(), [id]: Date.now() }));
  } catch {
    // Storage may be unavailable (private mode); the cooldown just won't persist.
  }
}
