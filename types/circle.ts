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
}

export type PenaltyType = "fixed" | "percentage";

export interface PenaltyConfig {
  enabled: boolean;
  type: PenaltyType;
  value: string;
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
  | "circle_closed";

export interface CircleEvent {
  id: string;
  type: EventType;
  actor: string;
  timestamp: Date;
  meta?: Record<string, unknown>;
}
