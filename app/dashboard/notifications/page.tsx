"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useUndoableRemoval } from "@/hooks/useUndoableRemoval";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Clock,
  Trash2,
  MailOpen,
  UserPlus,
  UserMinus,
  Megaphone,
  Repeat,
  Send,
  PauseCircle,
  PlayCircle,
  AlarmClock,
} from "lucide-react";
import type { Notification, NotificationType, NotificationCategory } from "@/types/notification";
import { NOTIFICATION_CATEGORIES } from "@/types/notification";
import { MOCK_NOTIFICATIONS } from "@/data/notifications";
import RelativeTime from "@/components/ui/RelativeTime";
import { useLoadMore } from "@/hooks/useLoadMore";
import {
  getActiveNotificationSnoozes,
  getExpiredNotificationIds,
  NOTIFICATION_SNOOZE_OPTIONS,
  NOTIFICATIONS_EVENT,
  restoreNotification,
  snoozeNotification,
} from "@/lib/notifications";

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ComponentType<{ size?: number; className?: string }>; color: string }
> = {
  round_complete: { icon: CheckCircle2, color: "text-[var(--success)]" },
  payout_ready: { icon: DollarSign, color: "text-[#FBBF24]" },
  missed_contribution: { icon: AlertCircle, color: "text-[#FF5B5B]" },
  your_turn: { icon: Clock, color: "text-[#4B6B76]" },
  join_request: { icon: UserPlus, color: "text-[#4B6B76]" },
  member_left: { icon: UserMinus, color: "text-[#FF5B5B]" },
  announcement: { icon: Megaphone, color: "text-[#4B6B76]" },
  seat_transfer: { icon: Repeat, color: "text-[#4B6B76]" },
  circle_invite: { icon: Send, color: "text-[#4B6B76]" },
  circle_paused: { icon: PauseCircle, color: "text-[#FBBF24]" },
  circle_resumed: { icon: PlayCircle, color: "text-[var(--success)]" },
};


function getFilterLabel(filter: NotificationCategory): string {
  const labels: Record<NotificationCategory, string> = {
    all: "All Notifications",
    payouts: "Payouts",
    contributions: "Contributions",
    system: "System",
    snoozed: "Snoozed",
  };
  return labels[filter];
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [selectedFilter, setSelectedFilter] = useState<NotificationCategory>("all");
  const [snoozedUntil, setSnoozedUntil] = useState<Record<string, number>>({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("ahjoorxmr:notifications") ?? "[]") as Array<Omit<Notification, "timestamp"> & { timestamp: string }>;
    if (stored.length > 0) {
      // Notifications are persisted client-side until the API is available.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotifications((current) => [...stored.map((notification) => ({ ...notification, timestamp: new Date(notification.timestamp) })), ...current]);
    }
  }, []);

  useEffect(() => {
    const syncSnoozes = (event?: Event) => {
      const { snoozedUntil: activeSnoozes, expiredIds } = getActiveNotificationSnoozes();
      const returnedIds = event ? getExpiredNotificationIds(event) : [];
      setSnoozedUntil(activeSnoozes);
      const unreadIds = new Set([...expiredIds, ...returnedIds]);
      if (unreadIds.size > 0) {
        setNotifications((current) =>
          current.map((notification) =>
            unreadIds.has(notification.id) ? { ...notification, read: false } : notification
          )
        );
      }
    };
    const handleChange = (event: Event) => syncSnoozes(event);
    syncSnoozes();
    const interval = setInterval(() => syncSnoozes(), 30 * 1000);
    window.addEventListener(NOTIFICATIONS_EVENT, handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener(NOTIFICATIONS_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  // #245: dismissing a notification is destructive (there's no "view
  // deleted notifications" anywhere), so it goes through the shared
  // undo-toast flow instead of filtering `notifications` directly —
  // `pendingIds` hides it from view immediately, but the real removal
  // from `notifications` only happens if the 5s undo window closes.
  const { remove: removeWithUndo, isPending } = useUndoableRemoval<string>();

  const snoozedIds = useMemo(() => new Set(Object.keys(snoozedUntil)), [snoozedUntil]);
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read && !snoozedIds.has(n.id)).length,
    [notifications, snoozedIds]
  );

  // Filter notifications based on selected category
  const filteredNotifications = useMemo(() => {
    if (selectedFilter === "snoozed") {
      return notifications.filter((n) => snoozedIds.has(n.id) && !isPending(n.id));
    }
    const types = NOTIFICATION_CATEGORIES[selectedFilter];
    return notifications.filter((n) => types.includes(n.type) && !snoozedIds.has(n.id) && !isPending(n.id));
  }, [notifications, selectedFilter, isPending, snoozedIds]);

  // Sort by date descending (newest first)
  const sortedNotifications = useMemo(
    () => [...filteredNotifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [filteredNotifications]
  );

  const { visibleCount, hasMore, loadMore, sentinelRef, announcement } = useLoadMore(
    sortedNotifications.length,
    `dashboard:notifications:${selectedFilter}`
  );
  const visibleNotifications = sortedNotifications.slice(0, visibleCount);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const deleteNotification = useCallback(
    (id: string) => {
      const target = notifications.find((n) => n.id === id);
      removeWithUndo(id, {
        title: "Notification dismissed",
        message: target?.title,
        commit: () => setNotifications((prev) => prev.filter((n) => n.id !== id)),
      });
    },
    [notifications, removeWithUndo],
  );

  const handleSnooze = (notificationId: string, value: string) => {
    const option = NOTIFICATION_SNOOZE_OPTIONS.find((candidate) => candidate.label === value);
    if (option) snoozeNotification(notificationId, option.ms);
  };

  const handleRestore = (notificationId: string) => restoreNotification(notificationId);

  const handleFilterChange = (filter: NotificationCategory) => {
    setSelectedFilter(filter);
  };

  if (notifications.length === 0) {
    return (
      <div className="space-y-8 pb-20 md:pb-0">
        <div className="flex items-center mb-6">
          <h1 className="text-3xl font-bold font-sora text-[var(--text)] shrink-0">Notifications</h1>
          <div className="ml-4 h-px bg-[var(--ov-1a)] w-full" aria-hidden="true" />
        </div>

        {/* Empty State */}
        <div className="bg-[var(--content)] p-12 rounded-3xl flex flex-col items-center justify-center min-h-[500px] text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--ov-0a)] flex items-center justify-center mb-6">
            <Bell size={40} className="text-[var(--muted)]" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold font-sora text-[var(--text)] mb-3">
            All caught up
          </h2>
          <p className="text-[var(--muted)] mb-8 max-w-md">
            No notifications yet. You&apos;ll be notified about important circle events, payouts, and your turns.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold font-sora text-[var(--text)]">Notifications</h1>
          <div className="h-px bg-[var(--ov-1a)] w-40" aria-hidden="true" />
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#4B6B76] bg-[var(--ov-0a)] hover:bg-[var(--ov-1a)] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            <MailOpen size={16} aria-hidden="true" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(["all", "payouts", "contributions", "system", "snoozed"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
              selectedFilter === filter
                ? "bg-white text-black"
                : "bg-[var(--ov-0a)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {getFilterLabel(filter)}
          </button>
        ))}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted)]">
          Showing {visibleNotifications.length} of{" "}
          {sortedNotifications.length} notification{sortedNotifications.length !== 1 ? "s" : ""}
        </p>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--ov-0a)] rounded-lg text-sm font-medium text-[var(--muted)]">
            <span className="w-2 h-2 rounded-full bg-[#4B6B76]" />
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2 bg-[var(--content)] rounded-3xl overflow-hidden">
        {visibleNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Bell size={32} className="text-[var(--muted)] mb-3" aria-hidden="true" />
            <p className="text-[var(--muted)]">No notifications in this category</p>
          </div>
        ) : (
          visibleNotifications.map((notification) => {
            const { icon: Icon, color } = TYPE_CONFIG[notification.type];
            return (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 md:p-5 border-b border-[var(--ov-0f)] last:border-b-0 hover:bg-[var(--modal)] transition-colors ${
                  !notification.read ? "bg-[var(--ov-03)]" : ""
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-lg bg-[var(--ov-0a)] flex items-center justify-center shrink-0 mt-0.5 ${color}`}
                >
                  <Icon size={18} aria-hidden="true" />
                </div>

                {/* Content */}
                <Link
                  href={notification.href}
                  onClick={() => markAsRead(notification.id)}
                  className="flex-1 min-w-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="text-sm font-semibold text-[var(--text)] group-hover:text-[#4B6B76] transition-colors">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span
                        className="w-2.5 h-2.5 rounded-full bg-[#4B6B76] shrink-0 mt-1"
                        aria-label="Unread"
                      />
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)] line-clamp-2 mb-2">
                    {notification.description}
                  </p>
                  <p className="text-xs text-[var(--faint)]">
                    <RelativeTime date={notification.timestamp} className="text-[var(--faint)]" />
                  </p>
                </Link>

                <div className="flex shrink-0 items-center gap-1">
                  {snoozedIds.has(notification.id) ? (
                    <button
                      onClick={() => handleRestore(notification.id)}
                      className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-0a)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                      aria-label={`Unsnooze notification: ${notification.title}`}
                    >
                      <AlarmClock size={16} aria-hidden="true" />
                    </button>
                  ) : (
                    <select
                      value=""
                      onChange={(event) => handleSnooze(notification.id, event.target.value)}
                      aria-label={`Snooze notification: ${notification.title}`}
                      className="cursor-pointer rounded-lg border border-[var(--ov-14)] bg-transparent px-2.5 py-1.5 text-xs text-[var(--muted)] hover:bg-[var(--ov-0a)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                    >
                      <option value="" disabled>
                        Snooze…
                      </option>
                      {NOTIFICATION_SNOOZE_OPTIONS.map((option) => (
                        <option key={option.label} value={option.label}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 rounded-lg text-[var(--muted)] hover:text-[#FF5B5B] hover:bg-[var(--ov-0a)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B5B]"
                    aria-label={`Delete notification: ${notification.title}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div ref={sentinelRef} aria-hidden="true" className="h-px" />
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)]" role="status" aria-live="polite">
          {announcement || `Showing ${visibleNotifications.length} of ${sortedNotifications.length} notifications`}
        </p>
        {hasMore ? (
          <button
            type="button"
            onClick={loadMore}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-[var(--text)] bg-[var(--ov-0a)] hover:bg-[var(--ov-1a)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            Load more
            <ChevronDown size={16} aria-hidden="true" />
          </button>
        ) : (
          <span className="text-sm text-[var(--muted)]">All notifications loaded</span>
        )}
      </div>
    </div>
  );
}
