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
// ---------------------------------------------------------------------------
// Organizer alerts — proactive warnings for circles the user organizes.
// ---------------------------------------------------------------------------

export interface CircleRiskSignals {
  circleId: string;
  circleName: string;
  memberCount: number;
  /** Members currently behind on the active round. */
  lateMembers: number;
  /** Rounds (1-based) whose contribution deadline passed with members unpaid. */
  missedDeadlineRounds: number[];
  /** Leave requests awaiting the organizer's decision. */
  pendingLeaveRequests: number;
}

export type CircleAlertRule = "late-members" | "consecutive-missed-deadlines" | "leave-requests";

export interface CircleHealthAlert {
  /** Stable per circle + rule, so dismiss/snooze survive re-evaluation. */
  id: string;
  /**
   * Changes when the underlying numbers change, so a dismissed alert comes
   * back if the situation gets worse (or different) rather than staying hidden.
   */
  signature: string;
  circleId: string;
  circleName: string;
  rule: CircleAlertRule;
  severity: Exclude<CircleHealthLevel, "healthy">;
  title: string;
  detail: string;
  action: { label: string; href: string };
}

/** Alert when strictly more than this share of members are late. */
export const LATE_MEMBER_ALERT_THRESHOLD = 0.2;

/** True when the list contains two back-to-back round numbers. */
export function hasConsecutiveMissedRounds(rounds: number[]): boolean {
  const sorted = [...new Set(rounds)].sort((a, b) => a - b);
  return sorted.some((round, i) => i > 0 && round - sorted[i - 1] === 1);
}

function latestConsecutivePair(rounds: number[]): [number, number] | null {
  const sorted = [...new Set(rounds)].sort((a, b) => b - a);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i] - sorted[i + 1] === 1) return [sorted[i + 1], sorted[i]];
  }
  return null;
}

export function evaluateCircleAlerts(signals: CircleRiskSignals): CircleHealthAlert[] {
  const { circleId, circleName, memberCount, lateMembers, missedDeadlineRounds, pendingLeaveRequests } = signals;
  const circleHref = `/dashboard/circles/${circleId}`;
  const settingsHref = `${circleHref}/settings`;
  const alerts: CircleHealthAlert[] = [];

  const lateShare = memberCount > 0 ? lateMembers / memberCount : 0;
  if (lateShare > LATE_MEMBER_ALERT_THRESHOLD) {
    alerts.push({
      id: `${circleId}:late-members`,
      signature: `${lateMembers}/${memberCount}`,
      circleId,
      circleName,
      rule: "late-members",
      severity: lateShare >= 0.5 ? "risk" : "attention",
      title: `${Math.round(lateShare * 100)}% of members are late`,
      detail: `${lateMembers} of ${memberCount} members haven't contributed for the current round.`,
      action: { label: "Remind late members", href: circleHref },
    });
  }

  const pair = latestConsecutivePair(missedDeadlineRounds);
  if (pair) {
    alerts.push({
      id: `${circleId}:consecutive-missed-deadlines`,
      signature: pair.join("-"),
      circleId,
      circleName,
      rule: "consecutive-missed-deadlines",
      severity: "risk",
      title: "Deadlines missed two rounds in a row",
      detail: `Rounds ${pair[0]} and ${pair[1]} closed with unpaid contributions.`,
      action: { label: "Review deadlines & penalties", href: settingsHref },
    });
  }

  if (pendingLeaveRequests > 0) {
    alerts.push({
      id: `${circleId}:leave-requests`,
      signature: String(pendingLeaveRequests),
      circleId,
      circleName,
      rule: "leave-requests",
      severity: "attention",
      title: `${pendingLeaveRequests} leave request${pendingLeaveRequests === 1 ? "" : "s"} pending`,
      detail: "Members asking to leave can disrupt the payout order if they aren't replaced.",
      action: { label: "Review requests", href: settingsHref },
    });
  }

  return alerts;
}

const SEVERITY_ORDER: Record<CircleHealthAlert["severity"], number> = { risk: 0, attention: 1 };

export function evaluateOrganizerAlerts(circles: CircleRiskSignals[]): CircleHealthAlert[] {
  return circles
    .flatMap(evaluateCircleAlerts)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.circleName.localeCompare(b.circleName));
}

// Circles the current user organizes, until organizer data comes from an API.
const MOCK_ORGANIZER_SIGNALS: CircleRiskSignals[] = [
  { circleId: "1", circleName: "Family savings", memberCount: 5, lateMembers: 2, missedDeadlineRounds: [2], pendingLeaveRequests: 0 },
  { circleId: "2", circleName: "School fees", memberCount: 6, lateMembers: 1, missedDeadlineRounds: [2, 3], pendingLeaveRequests: 1 },
  { circleId: "5", circleName: "Emergency Pool", memberCount: 4, lateMembers: 0, missedDeadlineRounds: [], pendingLeaveRequests: 0 },
];

export function getMockOrganizerAlerts(): CircleHealthAlert[] {
  return evaluateOrganizerAlerts(MOCK_ORGANIZER_SIGNALS);
}
