import type { Notification } from "@/types/notification";

export const NOTIFICATION_GROUPING_STORAGE_KEY = "ahjoorxmr:notification-grouping";
export const NOTIFICATION_GROUPING_WINDOW_MS = 60 * 60 * 1000;

export interface NotificationGroup {
  id: string;
  notifications: Notification[];
  latest: Notification;
  count: number;
  read: boolean;
}

/**
 * Groups notifications of the same type and circle into fixed windows
 * anchored to the newest notification. Notifications without a circle ID
 * remain separate.
 */
export function selectNotificationGroups(
  notifications: Notification[],
  groupingEnabled = true,
  windowMs = NOTIFICATION_GROUPING_WINDOW_MS,
): NotificationGroup[] {
  const sorted = [...notifications].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );
  const groups: Notification[][] = [];
  const latestGroupByKey = new Map<string, Notification[]>();

  for (const notification of sorted) {
    if (!groupingEnabled || !notification.circleId) {
      groups.push([notification]);
      continue;
    }

    const key = JSON.stringify([notification.type, notification.circleId]);
    const group = latestGroupByKey.get(key);
    if (
      group &&
      group[0].timestamp.getTime() - notification.timestamp.getTime() <= windowMs
    ) {
      group.push(notification);
    } else {
      const newGroup = [notification];
      groups.push(newGroup);
      latestGroupByKey.set(key, newGroup);
    }
  }

  return groups.map((members) => ({
    id: members.length === 1 ? members[0].id : `group:${JSON.stringify(members.map(({ id }) => id))}`,
    notifications: members,
    latest: members[0],
    count: members.length,
    read: members.every(({ read }) => read),
  }));
}
