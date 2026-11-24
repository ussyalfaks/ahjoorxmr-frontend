export type SeatTransferStatus = "pending" | "approved" | "rejected" | "cancelled";

/**
 * Snapshot of what the substitute inherits, captured when the request is
 * made so the organizer reviews the same terms the outgoing member saw.
 */
export interface SeatObligations {
  slot: number;
  contribution: string;
  /** Rounds (including the current one) the substitute must still contribute to. */
  remainingRounds: number;
  /** Payout round assigned to this seat by the draw, if one has been run. */
  payoutRound: number | null;
  /** True when this seat already collected its payout — the substitute pays in without receiving one. */
  payoutAlreadyReceived: boolean;
  /** Whether the outgoing member has already paid the current round. */
  currentRoundPaid: boolean;
}

export interface SeatTransferRequest {
  id: string;
  circleId: string;
  circleName: string;
  fromMember: string;
  toMember: string;
  reason: string;
  obligations: SeatObligations;
  status: SeatTransferStatus;
  organizerNote?: string;
  createdAt: string;
  updatedAt: string;
}
