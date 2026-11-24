/**
 * Organizer earnings tracking and calculations
 */

export interface CircleEarnings {
  circleId: string;
  circleName: string;
  members: number;
  completedRounds: number;
  totalRounds: number;
  contributionAmount: number;
  currency: string;
  feePercentage: number;
  totalFees: number;
  lastPayoutDate: string;
  status: "active" | "completed" | "paused";
}

export interface EarningTransaction {
  id: string;
  circleId: string;
  circleName: string;
  round: number;
  date: string;
  poolAmount: number;
  feeAmount: number;
  transactionHash: string;
  currency: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  activeCircles: number;
  completedCircles: number;
  totalMembers: number;
  averageFeePercentage: number;
  currency: string;
}

export interface EarningsFilter {
  timeRange: "all" | "30d" | "90d" | "year" | "custom";
  circleId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Calculate total earnings for a specific time period
 */
export function calculatePeriodEarnings(
  transactions: EarningTransaction[],
  filter: EarningsFilter
): number {
  const filtered = filterTransactions(transactions, filter);
  return filtered.reduce((sum, tx) => sum + tx.feeAmount, 0);
}

/**
 * Filter transactions based on criteria
 */
export function filterTransactions(
  transactions: EarningTransaction[],
  filter: EarningsFilter
): EarningTransaction[] {
  let filtered = [...transactions];

  // Filter by circle
  if (filter.circleId && filter.circleId !== "all") {
    filtered = filtered.filter((tx) => tx.circleId === filter.circleId);
  }

  // Filter by time range
  if (filter.timeRange !== "all") {
    const now = new Date();
    const startDate = getStartDateForRange(filter.timeRange, now);

    filtered = filtered.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= now;
    });
  }

  // Custom date range
  if (filter.startDate && filter.endDate) {
    const start = new Date(filter.startDate);
    const end = new Date(filter.endDate);

    filtered = filtered.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate >= start && txDate <= end;
    });
  }

  return filtered;
}

/**
 * Get start date for a time range
 */
function getStartDateForRange(range: string, now: Date): Date {
  const start = new Date(now);

  switch (range) {
    case "30d":
      start.setDate(start.getDate() - 30);
      break;
    case "90d":
      start.setDate(start.getDate() - 90);
      break;
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setFullYear(2000); // Far past date for "all"
  }

  return start;
}

/**
 * Calculate earnings summary from circle data
 */
export function calculateEarningsSummary(circles: CircleEarnings[]): EarningsSummary {
  const totalEarnings = circles.reduce((sum, circle) => sum + circle.totalFees, 0);
  const activeCircles = circles.filter((c) => c.status === "active").length;
  const completedCircles = circles.filter((c) => c.status === "completed").length;
  const totalMembers = circles.reduce((sum, circle) => sum + circle.members, 0);

  const averageFeePercentage =
    circles.length > 0
      ? circles.reduce((sum, circle) => sum + circle.feePercentage, 0) / circles.length
      : 0;

  return {
    totalEarnings,
    activeCircles,
    completedCircles,
    totalMembers,
    averageFeePercentage,
    currency: circles[0]?.currency || "USDT",
  };
}

/**
 * Calculate projected earnings for remaining rounds
 */
export function calculateProjectedEarnings(circle: CircleEarnings): number {
  const remainingRounds = circle.totalRounds - circle.completedRounds;
  if (remainingRounds <= 0) return 0;

  const feePerRound = (circle.contributionAmount * circle.members * circle.feePercentage) / 100;
  return feePerRound * remainingRounds;
}

/**
 * Group transactions by month for charts
 */
export function groupTransactionsByMonth(
  transactions: EarningTransaction[]
): Array<{ month: string; earnings: number; count: number }> {
  const grouped = new Map<string, { earnings: number; count: number }>();

  transactions.forEach((tx) => {
    const date = new Date(tx.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const existing = grouped.get(monthKey) || { earnings: 0, count: 0 };
    grouped.set(monthKey, {
      earnings: existing.earnings + tx.feeAmount,
      count: existing.count + 1,
    });
  });

  return Array.from(grouped.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Calculate average fee per transaction
 */
export function calculateAverageFeePerTransaction(transactions: EarningTransaction[]): number {
  if (transactions.length === 0) return 0;
  const total = transactions.reduce((sum, tx) => sum + tx.feeAmount, 0);
  return total / transactions.length;
}

/**
 * Get top earning circles
 */
export function getTopEarningCircles(circles: CircleEarnings[], limit: number = 5): CircleEarnings[] {
  return [...circles].sort((a, b) => b.totalFees - a.totalFees).slice(0, limit);
}

/**
 * Format transaction for export
 */
export function formatTransactionForExport(tx: EarningTransaction): Record<string, string | number> {
  return {
    Date: tx.date,
    Circle: tx.circleName,
    Round: tx.round,
    "Pool Amount": `${tx.poolAmount} ${tx.currency}`,
    "Fee Earned": `${tx.feeAmount} ${tx.currency}`,
    "Transaction Hash": tx.transactionHash,
  };
}
