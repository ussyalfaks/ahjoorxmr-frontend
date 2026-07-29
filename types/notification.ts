export type NotificationType = "round_complete" | "payout_ready" | "missed_contribution" | "your_turn";
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
  all: ["round_complete", "payout_ready", "missed_contribution", "your_turn"],
  payouts: ["payout_ready"],
  contributions: ["missed_contribution"],
  system: ["round_complete", "your_turn"],
};
