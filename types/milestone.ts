export type MilestoneType =
  | "circle_completed"
  | "payout_received"
  | "savings_goal"
  | "streak";

export interface MilestoneData {
  type: MilestoneType;
  circleName: string;
  /** Primary metric shown prominently on the card (e.g. "200 USDT", "12 rounds") */
  amount: string;
  /** Optional secondary line (e.g. round number, streak count) */
  subtitle?: string;
  /** ISO date string or formatted label shown at the bottom of the card */
  date?: string;
}
