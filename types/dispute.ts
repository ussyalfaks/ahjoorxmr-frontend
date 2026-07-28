/**
 * Shapes mirror what a future `/api/circles/:id/disputes` endpoint is
 * expected to return, so the mock data can be swapped for a fetch without
 * touching the components.
 */

export type DisputeReason = "missed_payment" | "wrong_amount" | "other";

export type DisputeStatus = "open" | "under_review" | "resolved";

export interface Dispute {
  id: string;
  circleId: string;
  /** Round the dispute refers to. */
  round: number;
  /** Wallet address of the participant who filed it. */
  reporter: string;
  /** Participant the report is about, when applicable. */
  subject?: string;
  reason: DisputeReason;
  note?: string;
  status: DisputeStatus;
  createdAt: Date;
  resolutionNote?: string;
  resolvedAt?: Date;
}

export const DISPUTE_REASON_LABELS: Record<DisputeReason, string> = {
  missed_payment: "Missed Payment",
  wrong_amount: "Wrong Amount",
  other: "Other",
};

export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  open: "Open",
  under_review: "Under Review",
  resolved: "Resolved",
};

export const DISPUTE_STATUS_STYLES: Record<DisputeStatus, string> = {
  open: "bg-[#FF5B5B1a] text-[#FF5B5B] border-[#FF5B5B33]",
  under_review: "bg-[#FBBF241a] text-[#FBBF24] border-[#FBBF2433]",
  resolved: "bg-[#1f3b2d] text-[#8ef0b0] border-[#2d5c43]",
};
