import { describe, expect, it } from "vitest";
import type { PayoutRecord } from "@/data/payouts";
import { getGoalProgress, getGoalPayouts, type SavingsGoal } from "./savingsGoals";

const goal: SavingsGoal = {
  id: "goal-1",
  name: "Emergency fund",
  targetAmount: 500,
  targetDate: "2027-01-01",
  circleIds: ["1", "5"],
  archived: false,
  createdAt: "2026-01-01T00:00:00Z",
};

const completedPayout: PayoutRecord = {
  transaction_hash: "completed-1",
  circle_name: "Family Savings",
  circleId: "1",
  amount: 50,
  token_symbol: "USDT",
  payout_date: "2026-07-25T16:20:00Z",
  round_number: 3,
  status: "completed",
  recipient: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b",
};

const pendingPayout: PayoutRecord = {
  ...completedPayout,
  transaction_hash: "pending-1",
  circleId: "5",
  amount: 75,
  status: "pending",
};

describe("savings goal payouts", () => {
  it("counts only completed payouts from linked circles", () => {
    const payouts = getGoalPayouts(goal, [completedPayout, pendingPayout]);

    expect(payouts).toEqual([completedPayout]);
  });

  it("adds linked payout amounts to goal progress", () => {
    const progress = getGoalProgress(goal, Date.now(), [completedPayout, pendingPayout]);

    expect(progress.saved).toBe(50);
    expect(progress.percent).toBe(10);
    expect(progress.payouts).toEqual([completedPayout]);
  });

  it("does not include payouts from unlinked circles", () => {
    const payouts = getGoalPayouts(
      { ...goal, circleIds: ["5"] },
      [completedPayout, pendingPayout]
    );

    expect(payouts).toEqual([]);
  });
});
