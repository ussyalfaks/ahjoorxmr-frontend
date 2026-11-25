export type ContributionCreditEntryType = "payment" | "overpayment" | "applied" | "refund" | "reserve_contribution" | "reserve_coverage" | "reserve_distribution";

export interface ContributionCreditEntry {
  id: string;
  circleId: string;
  memberAddress: string;
  type: ContributionCreditEntryType;
  amount: number;
  round: number | null;
  paymentId?: string;
  /** For reserve entries: which member's missed payment was covered (reserve_coverage) or who received distribution (reserve_distribution) */
  relatedMember?: string;
}

export interface RecordContributionInput {
  circleId: string;
  memberAddress: string;
  round: number;
  requiredAmount: number;
  paidAmount: number;
  paymentId: string;
  /** Reserve percentage (0-100) to split from each contribution. */
  reservePercentage?: number;
  /** Current reserve balance available for coverage. */
  reserveBalance?: number;
  /** Whether this member is missing this round's contribution (reserve coverage). */
  isMissedPayment?: boolean;
  /** Address of the member whose missed payment is being covered (when isMissedPayment is true). */
  coveredMemberAddress?: string;
}

export interface RecordContributionResult {
  entries: ContributionCreditEntry[];
  creditApplied: number;
  amountDue: number;
  overpayment: number;
  remainingCredit: number;
  /** Amount contributed to reserve this payment. */
  reserveContributed: number;
  /** Amount used from reserve to cover a missed payment (if any). */
  reserveUsed: number;
  /** New reserve balance after this transaction. */
  newReserveBalance: number;
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

/** Returns the total reserve balance for a circle from the ledger. */
export function getReserveBalance(
  entries: ContributionCreditEntry[],
  circleId: string
): number {
  const balance = entries
    .filter((entry) => entry.circleId === circleId)
    .reduce((sum, entry) => {
      if (entry.type === "reserve_contribution") return sum + entry.amount;
      if (entry.type === "reserve_coverage") return sum - entry.amount;
      return sum;
    }, 0);
  return roundAmount(balance);
}

/** Returns the total reserve contributed by a specific member. */
export function getMemberReserveContributed(
  entries: ContributionCreditEntry[],
  circleId: string,
  memberAddress: string
): number {
  const address = memberAddress.toLowerCase();
  const balance = entries
    .filter(
      (entry) =>
        entry.circleId === circleId &&
        entry.memberAddress.toLowerCase() === address &&
        entry.type === "reserve_contribution"
    )
    .reduce((sum, entry) => sum + entry.amount, 0);
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
  const {
    circleId,
    memberAddress,
    round,
    requiredAmount,
    paidAmount,
    paymentId,
    reservePercentage = 0,
    reserveBalance = 0,
    isMissedPayment = false,
    coveredMemberAddress,
  } = input;
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

  // --- Reserve coverage for missed payments ---
  // When a member misses a payment, the organizer can use the reserve to
  // cover the shortfall so the payout still goes out on time.
  let reserveUsed = 0;
  let newReserveBalance = getReserveBalance(entries, circleId);

  if (isMissedPayment && coveredMemberAddress) {
    const coveredAddress = coveredMemberAddress.toLowerCase();
    // Check that the caller is authorized (organizer/co-organizer) - handled by caller
    const availableReserve = newReserveBalance;
    const shortfall = normalizedRequiredAmount; // full amount needed to keep payout on time
    reserveUsed = roundAmount(Math.min(availableReserve, shortfall));
    if (reserveUsed > 0) {
      nextEntries.push({
        id: `${paymentId}:reserve-coverage`,
        circleId,
        memberAddress: address,
        type: "reserve_coverage",
        amount: reserveUsed,
        round,
        paymentId,
        relatedMember: coveredAddress,
      });
      newReserveBalance = roundAmount(newReserveBalance - reserveUsed);
    }
  }

  // --- Reserve contribution from this payment ---
  // A small percentage of the actual contribution goes into the reserve.
  let reserveContributed = 0;
  if (reservePercentage > 0 && !isMissedPayment) {
    // Reserve is taken from the actual paid amount (after credit applied)
    const baseForReserve = normalizedPaidAmount;
    reserveContributed = roundAmount(baseForReserve * (reservePercentage / 100));
    if (reserveContributed > 0) {
      nextEntries.push({
        id: `${paymentId}:reserve`,
        circleId,
        memberAddress: address,
        type: "reserve_contribution",
        amount: reserveContributed,
        round,
        paymentId,
      });
      newReserveBalance = roundAmount(newReserveBalance + reserveContributed);
    }
  }

  // --- Standard contribution entries ---
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
    reserveContributed,
    reserveUsed,
    newReserveBalance,
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

/**
 * Distributes leftover reserve back to members at the end of a circle.
 * Each member receives a share proportional to their total reserve contributions.
 * Safe to rerun — checks for existing distributions.
 */
export function distributeReserveBalance(
  entries: ContributionCreditEntry[],
  circleId: string,
  memberAddresses: string[]
): { entries: ContributionCreditEntry[]; distributions: ContributionCreditEntry[] } {
  const nextEntries = [...entries];
  const distributions: ContributionCreditEntry[] = [];
  const currentReserve = getReserveBalance(nextEntries, circleId);

  if (currentReserve <= 0) return { entries: nextEntries, distributions };

  // Calculate total reserve contributions across all members
  const contributions: Record<string, number> = {};
  let totalContributed = 0;
  for (const address of memberAddresses) {
    const normalized = address.toLowerCase();
    const amount = getMemberReserveContributed(nextEntries, circleId, normalized);
    contributions[normalized] = amount;
    totalContributed += amount;
  }

  if (totalContributed <= 0) return { entries: nextEntries, distributions };

  // Distribute proportionally, handling rounding by giving the remainder to the first member
  let distributed = 0;
  const memberList = memberAddresses.map((a) => a.toLowerCase());

  for (let i = 0; i < memberList.length; i++) {
    const address = memberList[i];
    const share = contributions[address];
    if (share <= 0) continue;

    let payout = roundAmount((currentReserve * share) / totalContributed);
    // Last member gets any rounding remainder
    if (i === memberList.length - 1) {
      payout = roundAmount(currentReserve - distributed);
    }
    if (payout <= 0) continue;

    // Check if already distributed
    const existing = nextEntries.some(
      (entry) =>
        entry.circleId === circleId &&
        entry.memberAddress.toLowerCase() === address &&
        entry.type === "reserve_distribution" &&
        entry.round === null
    );
    if (existing) continue;

    const distNumber = nextEntries.filter(
      (entry) =>
        entry.circleId === circleId &&
        entry.type === "reserve_distribution"
    ).length + 1;

    const distribution: ContributionCreditEntry = {
      id: `reserve-distribution:${circleId}:${address}:${distNumber}`,
      circleId,
      memberAddress: address,
      type: "reserve_distribution",
      amount: payout,
      round: null,
    };
    nextEntries.push(distribution);
    distributions.push(distribution);
    distributed = roundAmount(distributed + payout);
  }

  return { entries: nextEntries, distributions };
}
