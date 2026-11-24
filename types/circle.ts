export interface Circle {
  id: string;
  name: string;
  creator: string;
  members: number;
  contribution: string;
  duration: string;
  currentRound: number;
  totalRounds: number;
  status: "active" | "completed" | "pending";
  isYourTurn?: boolean;
  deadline?: Date | null;
  contributionButtonLabel: string;
  claimButtonVariant: "primary" | "secondary" | "disabled";
  reserve?: ReserveConfig;
}

export type PenaltyType = "fixed" | "percentage";

export interface PenaltyConfig {
  enabled: boolean;
  type: PenaltyType;
  value: string;
}

/** Reserve / emergency fund configuration for a circle. */
export interface ReserveConfig {
  enabled: boolean;
  /** Percentage of each contribution (0-100) set aside into the reserve. */
  percentage: number;
  /** Current reserve balance available to cover missed contributions. */
  balance: number;
}

export type JoinRequestStatus = "pending" | "approved" | "rejected";

export interface CircleJoinRequest {
  id: string;
  circleId: string;
  circleName: string;
  requester: string;
  note: string;
  organizerNote?: string;
  status: JoinRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export type EventType =
  | "contribution_made"
  | "payout_sent"
  | "member_joined"
  | "round_started"
  | "circle_closed"
  | "announcement_sent"
  | "invite_used"
  | "circle_paused"
  | "circle_resumed";

export interface CircleEvent {
  id: string;
  type: EventType;
  actor: string;
  timestamp: Date;
  meta?: Record<string, unknown>;
}
