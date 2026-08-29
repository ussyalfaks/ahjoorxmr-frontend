export type AutoPayFrequency = "per_round";

export interface AutoPayAttempt {
  status: "success" | "failed";
  date: string;
  reason?: string;
}

export interface AutoPayConfig {
  circleId: string;
  enabled: boolean;
  /** Authorized allowance per round, e.g. "50 USDT". */
  authorizedAmount: string;
  /** Human-readable cadence, e.g. "Every round (every 2 Days)". */
  frequency: string;
  createdAt: string;
  lastAttempt: AutoPayAttempt | null;
}
