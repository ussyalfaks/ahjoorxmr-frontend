import type { PayoutMethodId, PayoutMethodOption, PayoutMethodPreference } from "@/types/payoutMethod";

/**
 * Off-ramp (crypto → bank) partner configuration. The integration itself is
 * stubbed; set NEXT_PUBLIC_OFFRAMP_ENABLED=false to hide it and fall back to
 * wallet-only payouts everywhere.
 */
export const OFFRAMP_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_OFFRAMP_ENABLED !== "false",
  partnerName: process.env.NEXT_PUBLIC_OFFRAMP_PARTNER ?? "Bank transfer partner",
  supportedCurrencies: ["USDT", "USDC"],
  feeLabel: "~1% conversion fee",
};

export const DEFAULT_PAYOUT_METHOD: PayoutMethodId = "wallet";

/** Once the payout is this close, the recipient's method is locked in. */
export const PAYOUT_LOCK_WINDOW_MS = 24 * 60 * 60 * 1000;

const STORAGE_KEY = "ahjoorxmr:payout-method-preferences";

export const PAYOUT_METHOD_UPDATED_EVENT = "ahjoorxmr:payout-method-updated";

/** Pulls the token symbol out of a contribution label like "50 USDT". */
export function getCircleCurrency(contribution: string): string {
  return contribution.replace(/[\d.,\s]/g, "").toUpperCase() || "USDT";
}

export function getPayoutMethodOptions(currency: string): PayoutMethodOption[] {
  const offrampReason = !OFFRAMP_CONFIG.enabled
    ? "Bank payouts aren't available yet. Payouts go to your connected wallet."
    : !OFFRAMP_CONFIG.supportedCurrencies.includes(currency.toUpperCase())
      ? `${OFFRAMP_CONFIG.partnerName} doesn't support ${currency} yet. Supported: ${OFFRAMP_CONFIG.supportedCurrencies.join(", ")}.`
      : undefined;

  return [
    {
      id: "wallet",
      label: "Connected wallet",
      description: "Receive the payout directly in your active wallet. No extra fees beyond the network fee.",
      available: true,
    },
    {
      id: "offramp",
      label: "Bank account",
      description: `Converted to local currency and sent to your bank via ${OFFRAMP_CONFIG.partnerName} (${OFFRAMP_CONFIG.feeLabel}).`,
      available: !offrampReason,
      unavailableReason: offrampReason,
    },
  ];
}

/**
 * True when the payout for this circle is (or is about to be) processing for
 * the current user, so their method can no longer be changed.
 */
export function isPayoutInProgress(isNextRecipient: boolean, nextPayoutDeadline: Date | null): boolean {
  if (!isNextRecipient || !nextPayoutDeadline) return false;
  return nextPayoutDeadline.getTime() - Date.now() <= PAYOUT_LOCK_WINDOW_MS;
}

function readAll(): Record<string, PayoutMethodPreference> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getPayoutMethodPreference(circleId: string): PayoutMethodPreference | null {
  return readAll()[circleId] ?? null;
}

/**
 * The method that will actually be used. A saved off-ramp preference falls
 * back to the wallet if the off-ramp is no longer available for this circle.
 */
export function getEffectivePayoutMethod(circleId: string, currency: string): PayoutMethodId {
  const saved = getPayoutMethodPreference(circleId)?.method ?? DEFAULT_PAYOUT_METHOD;
  const option = getPayoutMethodOptions(currency).find((o) => o.id === saved);
  return option?.available ? saved : DEFAULT_PAYOUT_METHOD;
}

export function savePayoutMethodPreference(circleId: string, method: PayoutMethodId): PayoutMethodPreference {
  const pref: PayoutMethodPreference = { circleId, method, updatedAt: new Date().toISOString() };
  if (typeof window === "undefined") return pref;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readAll(), [circleId]: pref }));
    window.dispatchEvent(new CustomEvent(PAYOUT_METHOD_UPDATED_EVENT, { detail: pref }));
  } catch {
    // Storage may be unavailable (private mode); preference won't persist.
  }
  return pref;
}
