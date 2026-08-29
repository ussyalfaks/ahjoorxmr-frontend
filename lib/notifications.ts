import type { Notification, NotificationType } from "@/types/notification";

const NOTIFICATIONS_KEY = "ahjoorxmr:notifications";

// Fires so the notification bell (mounted separately from the page that
// wrote the notification) can re-read localStorage without a page reload.
export const NOTIFICATIONS_EVENT = "ahjoorxmr:notifications-changed";

/**
 * Appends a notification to the shared client-side store used across the
 * dashboard (see app/dashboard/notifications/page.tsx and
 * components/layout/NotificationDropdown.tsx). Stand-in for a real
 * per-recipient notification API — every notification in this demo lands
 * in the single connected wallet's inbox regardless of the intended
 * recipient, same as the existing join-request notifications.
 */
export function addNotification(input: {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  href: string;
}) {
  if (typeof window === "undefined") return;
  try {
    const stored = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) ?? "[]") as Array<
      Omit<Notification, "timestamp"> & { timestamp: string }
    >;
    localStorage.setItem(
      NOTIFICATIONS_KEY,
      JSON.stringify([
        ...stored,
        { ...input, timestamp: new Date().toISOString(), read: false },
      ])
    );
    window.dispatchEvent(new Event(NOTIFICATIONS_EVENT));
  } catch {
    // ignore storage errors
  }
}
