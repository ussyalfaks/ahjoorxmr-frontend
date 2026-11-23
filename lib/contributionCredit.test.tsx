import { describe, expect, it } from "vitest";
import {
  getContributionAmountDue,
  getContributionCreditBalance,
  recordContributionPayment,
  refundRemainingContributionCredits,
  type ContributionCreditEntry,
} from "./contributionCredit";

const firstPayment = {
  circleId: "circle-1",
  memberAddress: "GABC",
  round: 1,
  requiredAmount: 100,
  paidAmount: 125,
  paymentId: "payment-1",
};

describe("contribution credit ledger", () => {
  it("records overpayment as member credit", () => {
    const result = recordContributionPayment([], firstPayment);

    expect(result.overpayment).toBe(25);
    expect(result.remainingCredit).toBe(25);
    expect(getContributionCreditBalance(result.entries, "circle-1", "gabc")).toBe(25);
  });

  it("automatically applies credit to the next round contribution", () => {
    const initial = recordContributionPayment([], firstPayment);
    const amountDue = getContributionAmountDue(initial.entries, "circle-1", "GABC", 100);
    const next = recordContributionPayment(initial.entries, {
      ...firstPayment,
      round: 2,
      requiredAmount: 100,
      paidAmount: 75,
      paymentId: "payment-2",
    });

    expect(amountDue).toBe(75);
    expect(next.creditApplied).toBe(25);
    expect(next.amountDue).toBe(75);
    expect(next.remainingCredit).toBe(0);
  });

  it("applies full-round credit without requiring an additional payment", () => {
    const initial = recordContributionPayment([], {
      ...firstPayment,
      paidAmount: 225,
    });
    const next = recordContributionPayment(initial.entries, {
      ...firstPayment,
      round: 2,
      paidAmount: 0,
      paymentId: "payment-2",
    });

    expect(next.amountDue).toBe(0);
    expect(next.creditApplied).toBe(100);
    expect(next.remainingCredit).toBe(25);
  });

  it("refunds remaining credit once when the circle completes", () => {
    const initial = recordContributionPayment([], firstPayment);
    const refunded = refundRemainingContributionCredits(initial.entries, "circle-1");
    const repeated = refundRemainingContributionCredits(refunded.entries, "circle-1");

    expect(refunded.refunds).toHaveLength(1);
    expect(refunded.refunds[0]).toMatchObject({ type: "refund", amount: 25, round: null });
    expect(getContributionCreditBalance(refunded.entries, "circle-1", "GABC")).toBe(0);
    expect(repeated.refunds).toHaveLength(0);
  });

  it("keeps balances isolated by member and rejects underpayments or duplicate rounds", () => {
    const initial = recordContributionPayment([], firstPayment);
    expect(getContributionCreditBalance(initial.entries, "circle-1", "other")).toBe(0);
    expect(getContributionCreditBalance(initial.entries, "circle-2", "GABC")).toBe(0);

    expect(() =>
      recordContributionPayment(initial.entries, {
        ...firstPayment,
        round: 2,
        paidAmount: 70,
        paymentId: "underpayment",
      })
    ).toThrow(/below the amount due/);
    expect(() =>
      recordContributionPayment(initial.entries, {
        ...firstPayment,
        paymentId: "duplicate-round",
      })
    ).toThrow(/already been recorded/);
  });

  it("does not mutate the source ledger", () => {
    const entries: ContributionCreditEntry[] = [];
    recordContributionPayment(entries, firstPayment);
    expect(entries).toEqual([]);
  });
});
