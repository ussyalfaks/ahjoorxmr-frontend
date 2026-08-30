export type AnnouncementPriority = "normal" | "urgent";

export interface CircleAnnouncement {
  id: string;
  circleId: string;
  circleName: string;
  message: string;
  priority: AnnouncementPriority;
  sentBy: string;
  sentAt: string;
}
