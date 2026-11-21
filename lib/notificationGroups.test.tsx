import { describe, expect, it } from "vitest";
import type { Notification } from "@/types/notification";
import { selectNotificationGroups } from "./notificationGroups";

function notification(
  id: string,
  overrides: Partial<Notification> = {},
): Notification {
  return {
    id,
    type: "join_request",
    title: "Join request",
    description: "A member requested to join.",
    timestamp: new Date("2026-01-01T12:00:00Z"),
    href: "/dashboard/circles/1",
    read: false,
    circleId: "circle-1",
    ...overrides,
  };
}

describe("selectNotificationGroups", () => {
  it("groups matching type and circle notifications within the time window", () => {
    const groups = selectNotificationGroups([
      notification("older", { timestamp: new Date("2026-01-01T11:30:00Z") }),
      notification("newest"),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].notifications.map(({ id }) => id)).toEqual(["newest", "older"]);
    expect(groups[0].count).toBe(2);
    expect(groups[0].read).toBe(false);
  });

  it("keeps other circles, types, and notifications outside the window separate", () => {
    const groups = selectNotificationGroups([
      notification("newest"),
      notification("other-circle", { circleId: "circle-2" }),
      notification("other-type", { type: "member_left" }),
      notification("too-old", { timestamp: new Date("2026-01-01T10:59:59Z") }),
      notification("no-circle", { circleId: undefined }),
    ]);

    expect(groups.map(({ count }) => count)).toEqual([1, 1, 1, 1, 1]);
  });

  it("does not extend a group by chaining notifications beyond the time window", () => {
    const groups = selectNotificationGroups([
      notification("newest", { timestamp: new Date("2026-01-01T12:00:00Z") }),
      notification("middle", { timestamp: new Date("2026-01-01T11:10:00Z") }),
      notification("oldest", { timestamp: new Date("2026-01-01T10:20:00Z") }),
    ]);

    expect(groups.map(({ count }) => count)).toEqual([2, 1]);
  });

  it("returns individual notifications when grouping is disabled", () => {
    const groups = selectNotificationGroups(
      [notification("first"), notification("second")],
      false,
    );

    expect(groups.map(({ id }) => id)).toEqual(["first", "second"]);
  });
});
