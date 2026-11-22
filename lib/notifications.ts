import type { Notification, NotificationType } from "@/types/notification";
import { shouldSuppress } from "@/lib/doNotDisturb";
import { alertUser, playNotificationSound, showBrowserNotification } from "@/lib/notificationAlerts";
import { celebrateFromNotification } from "@/lib/milestoneCelebrations";

const NOTIFICATIONS_KEY = "ahjoorxmr:notifications";
const NOTIFICATION_SNOOZES_KEY = "ahjoorxmr:notification-snoozes";

// Notifications held back during Do-Not-Disturb, delivered when quiet hours end.
const DND_QUEUE_KEY = "ahjoorxmr:dnd-queue";

// Fires so the notification bell (mounted separately from the page that
// wrote the notification) can re-read localStorage without a page reload.
export const NOTIFICATIONS_EVENT = "ahjoorxmr:notifications-changed";

export const NOTIFICATION_SNOOZE_OPTIONS = [
  { label: "1 hour", ms: 60 * 60 * 1000 },
  { label: "Tomorrow", ms: 24 * 60 * 60 * 1000 },
  { label: "Next week", ms: 7 * 24 * 60 * 60 * 1000 },
] as const;

type StoredNotification = Omit<Notification, "timestamp"> & { timestamp: string };
type NotificationSnoozes = Record<string, number>;

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

function readSnoozes(): NotificationSnoozes {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(NOTIFICATION_SNOOZES_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, number] =>
        typeof entry[1] === "number" && Number.isFinite(entry[1])
      )
    );
  } catch {
    return {};
  }
}

function writeSnoozes(snoozes: NotificationSnoozes, expiredIds?: string[]) {
  try {
    localStorage.setItem(NOTIFICATION_SNOOZES_KEY, JSON.stringify(snoozes));
    window.dispatchEvent(
      new CustomEvent(NOTIFICATIONS_EVENT, { detail: { expiredIds: expiredIds ?? [] } })
    );
  } catch {
    // Storage may be unavailable; the notification remains visible.
  }
}

export function snoozeNotification(notificationId: string, durationMs: number, now = Date.now()) {
  writeSnoozes({ ...readSnoozes(), [notificationId]: now + durationMs });
}

export function restoreNotification(notificationId: string) {
  const snoozes = readSnoozes();
  delete snoozes[notificationId];
  writeSnoozes(snoozes);
}

/**
 * Returns active snoozes and removes expired ones. Expired IDs are included
 * in the change event so every mounted notification surface can mark them unread.
 */
export function getActiveNotificationSnoozes(now = Date.now()): {
  snoozedUntil: NotificationSnoozes;
  expiredIds: string[];
} {
  const snoozes = readSnoozes();
  const expiredIds = Object.entries(snoozes)
    .filter(([, until]) => until <= now)
    .map(([id]) => id);
  for (const id of expiredIds) delete snoozes[id];
  if (expiredIds.length > 0) writeSnoozes(snoozes, expiredIds);
  return { snoozedUntil: snoozes, expiredIds };
}

export function getExpiredNotificationIds(event: Event): string[] {
  if (!(event instanceof CustomEvent)) return [];
  const detail: unknown = event.detail;
  if (!detail || typeof detail !== "object" || !("expiredIds" in detail)) return [];
  const { expiredIds } = detail as { expiredIds: unknown };
  return Array.isArray(expiredIds) && expiredIds.every((id) => typeof id === "string") ? expiredIds : [];
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
    celebrateFromNotification(input);
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
