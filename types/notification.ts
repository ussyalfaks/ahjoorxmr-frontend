export type NotificationType = "round_complete" | "payout_ready" | "missed_contribution" | "your_turn" | "join_request" | "member_left" | "announcement";
export type NotificationCategory = "all" | "payouts" | "contributions" | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  href: string;
  read: boolean;
}

export const NOTIFICATION_CATEGORIES: Record<NotificationCategory, NotificationType[]> = {
  all: ["round_complete", "payout_ready", "missed_contribution", "your_turn", "join_request", "member_left", "announcement"],
  payouts: ["payout_ready"],
  contributions: ["missed_contribution"],
  system: ["round_complete", "your_turn", "join_request", "member_left", "announcement"],
};
