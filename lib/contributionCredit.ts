export type ContributionCreditEntryType = "payment" | "overpayment" | "applied" | "refund";

export interface ContributionCreditEntry {
  id: string;
  circleId: string;
  memberAddress: string;
  type: ContributionCreditEntryType;
  amount: number;
  round: number | null;
  paymentId?: string;
}

export interface RecordContributionInput {
  circleId: string;
  memberAddress: string;
  round: number;
  requiredAmount: number;
  paidAmount: number;
  paymentId: string;
}

export interface RecordContributionResult {
  entries: ContributionCreditEntry[];
  creditApplied: number;
  amountDue: number;
  overpayment: number;
  remainingCredit: number;
}

function roundAmount(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function validateAmount(label: string, amount: number, allowZero = true): void {
  if (!Number.isFinite(amount) || amount < 0 || (!allowZero && amount === 0)) {
    throw new RangeError(`${label} must be a ${allowZero ? "non-negative" : "positive"} finite amount.`);
  }
}

export function getContributionCreditBalance(
  entries: ContributionCreditEntry[],
  circleId: string,
  memberAddress: string
): number {
  const address = memberAddress.toLowerCase();
  const balance = entries.reduce((sum, entry) => {
    if (entry.circleId !== circleId || entry.memberAddress.toLowerCase() !== address) return sum;
    if (entry.type === "overpayment") return sum + entry.amount;
    if (entry.type === "applied" || entry.type === "refund") return sum - entry.amount;
    return sum;
  }, 0);
  return roundAmount(balance);
}

/** Returns the amount the member needs to pay after automatically applying credit. */
export function getContributionAmountDue(
  entries: ContributionCreditEntry[],
  circleId: string,
  memberAddress: string,
  requiredAmount: number
): number {
  validateAmount("Required contribution", requiredAmount, false);
  const creditApplied = Math.max(
    0,
    Math.min(getContributionCreditBalance(entries, circleId, memberAddress), requiredAmount)
  );
  return roundAmount(requiredAmount - creditApplied);
}

export function recordContributionPayment(
  entries: ContributionCreditEntry[],
  input: RecordContributionInput
): RecordContributionResult {
  const { circleId, memberAddress, round, requiredAmount, paidAmount, paymentId } = input;
  validateAmount("Required contribution", requiredAmount, false);
  validateAmount("Payment", paidAmount);
  const normalizedRequiredAmount = roundAmount(requiredAmount);
  const normalizedPaidAmount = roundAmount(paidAmount);
  if (!circleId || !memberAddress || !paymentId || !Number.isInteger(round) || round < 1) {
    throw new Error("Circle, member, payment ID, and a positive round are required.");
  }
  if (entries.some((entry) => entry.paymentId === paymentId)) {
    throw new Error("This payment has already been recorded.");
  }

  const address = memberAddress.toLowerCase();
  if (entries.some(
    (entry) =>
      entry.type === "payment" &&
      entry.circleId === circleId &&
      entry.memberAddress.toLowerCase() === address &&
      entry.round === round
  )) {
    throw new Error("A contribution for this member and round has already been recorded.");
  }

  const balance = getContributionCreditBalance(entries, circleId, memberAddress);
  const creditApplied = roundAmount(Math.max(0, Math.min(balance, normalizedRequiredAmount)));
  const amountDue = roundAmount(normalizedRequiredAmount - creditApplied);
  if (normalizedPaidAmount < amountDue) {
    throw new RangeError(`Payment is below the amount due (${amountDue}).`);
  }

  const overpayment = roundAmount(normalizedPaidAmount - amountDue);
  const nextEntries = [...entries];
  if (creditApplied > 0) {
    nextEntries.push({
      id: `${paymentId}:applied`,
      circleId,
      memberAddress,
      type: "applied",
      amount: creditApplied,
      round,
      paymentId,
    });
  }
  nextEntries.push({
    id: `${paymentId}:payment`,
    circleId,
    memberAddress,
    type: "payment",
    amount: normalizedPaidAmount,
    round,
    paymentId,
  });
  if (overpayment > 0) {
    nextEntries.push({
      id: `${paymentId}:credit`,
      circleId,
      memberAddress,
      type: "overpayment",
      amount: overpayment,
      round,
      paymentId,
    });
  }

  return {
    entries: nextEntries,
    creditApplied,
    amountDue,
    overpayment,
    remainingCredit: getContributionCreditBalance(nextEntries, circleId, memberAddress),
  };
}

/** Records one refund for each member's positive credit balance. Safe to rerun. */
export function refundRemainingContributionCredits(
  entries: ContributionCreditEntry[],
  circleId: string
): { entries: ContributionCreditEntry[]; refunds: ContributionCreditEntry[] } {
  const addresses = new Set(
    entries
      .filter((entry) => entry.circleId === circleId)
      .map((entry) => entry.memberAddress.toLowerCase())
  );
  const nextEntries = [...entries];
  const refunds: ContributionCreditEntry[] = [];

  for (const memberAddress of addresses) {
    const balance = getContributionCreditBalance(nextEntries, circleId, memberAddress);
    if (balance <= 0) continue;

    const refundNumber = nextEntries.filter(
      (entry) =>
        entry.circleId === circleId &&
        entry.memberAddress.toLowerCase() === memberAddress &&
        entry.type === "refund"
    ).length + 1;
    const refund: ContributionCreditEntry = {
      id: `refund:${circleId}:${memberAddress}:${refundNumber}`,
      circleId,
      memberAddress,
      type: "refund",
      amount: balance,
      round: null,
    };
    nextEntries.push(refund);
    refunds.push(refund);
  }

  return { entries: nextEntries, refunds };
}
