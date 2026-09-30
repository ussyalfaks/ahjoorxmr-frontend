import type { Notification, NotificationType } from "@/types/notification";
import { shouldSuppress } from "@/lib/doNotDisturb";
import { alertUser, playNotificationSound, showBrowserNotification } from "@/lib/notificationAlerts";

const NOTIFICATIONS_KEY = "ahjoorxmr:notifications";

// Notifications held back during Do-Not-Disturb, delivered when quiet hours end.
const DND_QUEUE_KEY = "ahjoorxmr:dnd-queue";

// Fires so the notification bell (mounted separately from the page that
// wrote the notification) can re-read localStorage without a page reload.
export const NOTIFICATIONS_EVENT = "ahjoorxmr:notifications-changed";

type StoredNotification = Omit<Notification, "timestamp"> & { timestamp: string };

interface NotificationInput {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  href: string;
}

function readList(key: string): StoredNotification[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Appends a notification to the shared client-side store used across the
 * dashboard (see app/dashboard/notifications/page.tsx and
 * components/layout/NotificationDropdown.tsx). Stand-in for a real
 * per-recipient notification API — every notification in this demo lands
 * in the single connected wallet's inbox regardless of the intended
 * recipient, same as the existing join-request notifications.
 *
 * During Do-Not-Disturb quiet hours, non-exempt notifications are queued
 * (no push, no sound) and moved into the inbox by `flushDndQueue` once the
 * quiet period ends.
 */
export function addNotification(input: NotificationInput) {
  if (typeof window === "undefined") return;
  const entry: StoredNotification = { ...input, timestamp: new Date().toISOString(), read: false };
  try {
    if (shouldSuppress(input.type)) {
      localStorage.setItem(DND_QUEUE_KEY, JSON.stringify([...readList(DND_QUEUE_KEY), entry]));
      return;
    }
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([...readList(NOTIFICATIONS_KEY), entry]));
    window.dispatchEvent(new Event(NOTIFICATIONS_EVENT));
    alertUser(input.type, input.title, input.description);
  } catch {
    // ignore storage errors
  }
}

export function getDndQueueSize(): number {
  if (typeof window === "undefined") return 0;
  return readList(DND_QUEUE_KEY).length;
}

/**
 * Moves notifications held during quiet hours into the notification center
 * (keeping their original timestamps) and sends one summary alert.
 * Returns how many were delivered.
 */
export function flushDndQueue(): number {
  if (typeof window === "undefined") return 0;
  try {
    const queued = readList(DND_QUEUE_KEY);
    if (queued.length === 0) return 0;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([...readList(NOTIFICATIONS_KEY), ...queued]));
    localStorage.removeItem(DND_QUEUE_KEY);
    window.dispatchEvent(new Event(NOTIFICATIONS_EVENT));

    if (queued.length === 1) {
      showBrowserNotification(queued[0].type, queued[0].title, queued[0].description);
    } else {
      showBrowserNotification(
        queued[0].type,
        `${queued.length} notifications while Do Not Disturb was on`,
        queued.map((n) => n.title).slice(0, 3).join(" · ")
      );
    }
    playNotificationSound();
    return queued.length;
  } catch {
    return 0;
  }
}
