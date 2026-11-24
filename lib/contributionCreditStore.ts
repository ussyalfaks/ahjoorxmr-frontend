import { safeStorage } from "@/lib/safeStorage";
import {
  recordContributionPayment as recordPayment,
  refundRemainingContributionCredits,
  type ContributionCreditEntry,
  type RecordContributionInput,
} from "@/lib/contributionCredit";

const STORAGE_KEY = "ahjoor:contribution-credits";
export const CONTRIBUTION_CREDITS_UPDATED_EVENT = "ahjoor:contribution-credits-updated";

export function getContributionCreditLedger(): ContributionCreditEntry[] {
  return safeStorage.getJSON<ContributionCreditEntry[]>(STORAGE_KEY, []);
}

function saveLedger(entries: ContributionCreditEntry[]): void {
  if (!safeStorage.setJSON(STORAGE_KEY, entries)) {
    throw new Error("Unable to save contribution credits in this browser.");
  }
  window.dispatchEvent(new Event(CONTRIBUTION_CREDITS_UPDATED_EVENT));
}

export function recordContributionPayment(
  input: Omit<RecordContributionInput, "paymentId">
): ReturnType<typeof recordPayment> {
  const ledger = getContributionCreditLedger();
  const result = recordPayment(ledger, { ...input, paymentId: crypto.randomUUID() });
  saveLedger(result.entries);
  return result;
}

export function refundCompletedCircleCredits(
  circleId: string
): ReturnType<typeof refundRemainingContributionCredits>["refunds"] {
  const ledger = getContributionCreditLedger();
  const result = refundRemainingContributionCredits(ledger, circleId);
  if (result.refunds.length > 0) saveLedger(result.entries);
  return result.refunds;
}
