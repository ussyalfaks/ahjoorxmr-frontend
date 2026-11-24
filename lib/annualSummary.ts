import { MOCK_CONTRIBUTIONS } from "@/data/contributions";
import { MOCK_PAYOUT_HISTORY } from "@/data/payouts";
import type { ContributionRecord } from "@/types/contribution";

export interface AnnualSavingsSummary {
  year: number;
  totalContributed: number;
  circlesCompleted: number;
  longestStreak: number;
  biggestPayout: number;
  biggestPayoutToken: string;
  contributionCount: number;
  payoutCount: number;
}

function inYear(value: string, year: number) {
  return Boolean(value) && value.slice(0, 4) === String(year);
}

export function getSummaryYears(
  contributions: ContributionRecord[] = MOCK_CONTRIBUTIONS,
  payouts = MOCK_PAYOUT_HISTORY
) {
  const years = new Set<number>();
  contributions.forEach((record) => {
    const date = record.date || record.dueDate;
    if (date) years.add(Number(date.slice(0, 4)));
  });
  payouts.forEach((payout) => years.add(Number(payout.payout_date.slice(0, 4))));
  return [...years].filter(Number.isFinite).sort((a, b) => b - a);
}

export function calculateAnnualSavingsSummary(
  year: number,
  contributions: ContributionRecord[] = MOCK_CONTRIBUTIONS,
  payouts = MOCK_PAYOUT_HISTORY
): AnnualSavingsSummary {
  const yearContributions = contributions.filter((record) =>
    inYear(record.date || record.dueDate, year)
  );
  const completedContributions = yearContributions.filter((record) => record.status !== "missed");
  const completedCircleIds = new Set<string>();
  for (const circleId of new Set(yearContributions.map((record) => record.circleId))) {
    const records = yearContributions.filter((record) => record.circleId === circleId);
    if (records.length > 0 && records.every((record) => record.status !== "missed")) {
      completedCircleIds.add(circleId);
    }
  }

  const chronological = [...completedContributions].sort((a, b) =>
    (a.date || a.dueDate).localeCompare(b.date || b.dueDate)
  );
  let currentStreak = 0;
  let longestStreak = 0;
  for (const record of chronological) {
    if (record.status === "on-time") {
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  const yearPayouts = payouts.filter(
    (payout) => payout.status === "completed" && inYear(payout.payout_date, year)
  );
  const biggestPayout = yearPayouts.reduce(
    (largest, payout) => (payout.amount > largest.amount ? payout : largest),
    { amount: 0, token_symbol: "USDT" }
  );

  return {
    year,
    totalContributed: completedContributions.reduce((total, record) => total + record.amount, 0),
    circlesCompleted: completedCircleIds.size,
    longestStreak,
    biggestPayout: biggestPayout.amount,
    biggestPayoutToken: biggestPayout.token_symbol,
    contributionCount: completedContributions.length,
    payoutCount: yearPayouts.length,
  };
}
