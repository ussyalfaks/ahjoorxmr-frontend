import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getActiveNotificationSnoozes,
  NOTIFICATION_SNOOZE_OPTIONS,
  NOTIFICATIONS_EVENT,
  snoozeNotification,
} from "./notifications";

describe("notification snoozes", () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("keeps a notification snoozed until its deadline", () => {
    const now = 1_000;
    snoozeNotification("notification-1", NOTIFICATION_SNOOZE_OPTIONS[0].ms, now);

    expect(getActiveNotificationSnoozes(now + 1).snoozedUntil).toEqual({
      "notification-1": now + NOTIFICATION_SNOOZE_OPTIONS[0].ms,
    });
  });

  it("clears expired snoozes and broadcasts IDs for unread restoration", () => {
    const now = 1_000;
    const listener = vi.fn();
    window.addEventListener(NOTIFICATIONS_EVENT, listener);
    snoozeNotification("notification-1", 10, now);
    listener.mockClear();

    expect(getActiveNotificationSnoozes(now + 10)).toEqual({
      snoozedUntil: {},
      expiredIds: ["notification-1"],
    });
    expect((listener.mock.calls[0][0] as CustomEvent<{ expiredIds: string[] }>).detail.expiredIds).toEqual([
      "notification-1",
    ]);

    window.removeEventListener(NOTIFICATIONS_EVENT, listener);
  });
});
