export interface CircleHealthMetrics {
  onTimeContributions: number;
  expectedContributions: number;
  completedPayouts: number;
  expectedPayouts: number;
  disputes: number;
}

export type CircleHealthLevel = "healthy" | "attention" | "risk";

export interface CircleHealthScore {
  score: number;
  level: CircleHealthLevel;
  label: string;
  missedContributions: number;
  onTimeRate: number;
  payoutReliability: number;
  disputes: number;
}

// Keep this deliberately small: contributions are 60%, payouts 30%, and each
// dispute removes 5 points (up to two disputes). The UI can stay stable while
// these weights are refined against real on-chain data later.
export function calculateCircleHealth(metrics: CircleHealthMetrics): CircleHealthScore {
  const onTimeRate = metrics.expectedContributions > 0
    ? Math.min(metrics.onTimeContributions / metrics.expectedContributions, 1)
    : 1;
  const payoutReliability = metrics.expectedPayouts > 0
    ? Math.min(metrics.completedPayouts / metrics.expectedPayouts, 1)
    : 1;
  const missedContributions = Math.max(metrics.expectedContributions - metrics.onTimeContributions, 0);
  const score = Math.max(0, Math.min(100, Math.round(onTimeRate * 60 + payoutReliability * 30 - Math.min(metrics.disputes, 2) * 5)));
  const level: CircleHealthLevel = score >= 75 ? "healthy" : score >= 50 ? "attention" : "risk";

  return {
    score,
    level,
    label: level === "healthy" ? "Healthy" : level === "attention" ? "Needs attention" : "At risk",
    missedContributions,
    onTimeRate,
    payoutReliability,
    disputes: metrics.disputes,
  };
}

// These values mirror the contribution, payout, and dispute examples already
// shown by the dashboard until those records come from an API.
const MOCK_HEALTH_BY_CIRCLE: Record<string, CircleHealthMetrics> = {
  "1": { onTimeContributions: 2, expectedContributions: 3, completedPayouts: 1, expectedPayouts: 1, disputes: 2 },
  "2": { onTimeContributions: 2, expectedContributions: 4, completedPayouts: 2, expectedPayouts: 2, disputes: 0 },
  "3": { onTimeContributions: 2, expectedContributions: 3, completedPayouts: 0, expectedPayouts: 1, disputes: 1 },
  "4": { onTimeContributions: 4, expectedContributions: 5, completedPayouts: 3, expectedPayouts: 3, disputes: 0 },
  "5": { onTimeContributions: 2, expectedContributions: 2, completedPayouts: 2, expectedPayouts: 2, disputes: 0 },
};

export function getMockCircleHealth(circleId: string): CircleHealthScore {
  return calculateCircleHealth(
    MOCK_HEALTH_BY_CIRCLE[circleId] ?? {
      onTimeContributions: 0,
      expectedContributions: 0,
      completedPayouts: 0,
      expectedPayouts: 0,
      disputes: 0,
    }
  );
}