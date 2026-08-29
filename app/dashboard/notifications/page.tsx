"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Clock,
  Trash2,
  MailOpen,
  UserPlus,
  UserMinus,
  Megaphone,
} from "lucide-react";
import type { Notification, NotificationType, NotificationCategory } from "@/types/notification";
import { NOTIFICATION_CATEGORIES } from "@/types/notification";

// Mock notification data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "your_turn",
    title: "It's Your Turn",
    description: "You're next to receive the payout in Family Savings circle.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    href: "/dashboard",
    read: false,
  },
  {
    id: "2",
    type: "round_complete",
    title: "Round Completed",
    description: "Round 2 of School Fees circle has been completed.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    href: "/dashboard",
    read: false,
  },
  {
    id: "3",
    type: "payout_ready",
    title: "Payout Ready",
    description: "Your payout of 200 USDT is ready to claim.",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    href: "/dashboard",
    read: false,
  },
  {
    id: "4",
    type: "missed_contribution",
    title: "Missed Contribution",
    description: "A member missed their contribution in Community Fund.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    href: "/dashboard/circles",
    read: true,
  },
  {
    id: "5",
    type: "payout_ready",
    title: "Payout Ready",
    description: "Your payout of 150 USDC is ready to claim from Wedding Fund.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    href: "/dashboard",
    read: true,
  },
  {
    id: "6",
    type: "round_complete",
    title: "Round Completed",
    description: "Round 1 of Car Repairs circle has been completed.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    href: "/dashboard",
    read: true,
  },
  {
    id: "7",
    type: "missed_contribution",
    title: "Missed Contribution",
    description: "Emeka missed their contribution in Family Savings.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    href: "/dashboard/circles",
    read: true,
  },
  {
    id: "8",
    type: "your_turn",
    title: "It's Your Turn",
    description: "You're next to receive the payout in Travel Fund circle.",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    href: "/dashboard",
    read: true,
  },
  {
    id: "9",
    type: "payout_ready",
    title: "Payout Ready",
    description: "Your payout of 75 STRK is ready to claim.",
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    href: "/dashboard",
    read: true,
  },
  {
    id: "10",
    type: "round_complete",
    title: "Round Completed",
    description: "Round 3 of Savings Challenge circle has been completed.",
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    href: "/dashboard",
    read: true,
  },
];

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
};

function relativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getFilterLabel(filter: NotificationCategory): string {
  const labels: Record<NotificationCategory, string> = {
    all: "All Notifications",
    payouts: "Payouts",
    contributions: "Contributions",
    system: "System",
  };
  return labels[filter];
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [selectedFilter, setSelectedFilter] = useState<NotificationCategory>("all");
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("ahjoorxmr:notifications") ?? "[]") as Array<Omit<Notification, "timestamp"> & { timestamp: string }>;
    if (stored.length > 0) {
      // Notifications are persisted client-side until the API is available.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotifications((current) => [...stored.map((notification) => ({ ...notification, timestamp: new Date(notification.timestamp) })), ...current]);
    }
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  // Filter notifications based on selected category
  const filteredNotifications = useMemo(() => {
    const types = NOTIFICATION_CATEGORIES[selectedFilter];
    return notifications.filter((n) => types.includes(n.type));
  }, [notifications, selectedFilter]);

  // Sort by date descending (newest first)
  const sortedNotifications = useMemo(
    () => [...filteredNotifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [filteredNotifications]
  );

  // Paginate
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedNotifications.slice(start, start + itemsPerPage);
  }, [sortedNotifications, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedNotifications.length / itemsPerPage);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleFilterChange = (filter: NotificationCategory) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
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
        {(["all", "payouts", "contributions", "system"] as const).map((filter) => (
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
          Showing {Math.min(itemsPerPage, sortedNotifications.length)} of{" "}
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
        {paginatedNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Bell size={32} className="text-[var(--muted)] mb-3" aria-hidden="true" />
            <p className="text-[var(--muted)]">No notifications in this category</p>
          </div>
        ) : (
          paginatedNotifications.map((notification) => {
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
                  <p className="text-xs text-[var(--faint)]">{relativeTime(notification.timestamp)}</p>
                </Link>

                {/* Delete Button */}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-2 rounded-lg text-[var(--muted)] hover:text-[#FF5B5B] hover:bg-[var(--ov-0a)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B5B] shrink-0 mt-0.5"
                  aria-label={`Delete notification: ${notification.title}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--muted)] bg-[var(--ov-0a)] hover:text-[var(--text)] hover:bg-[var(--ov-1a)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
                  currentPage === page
                    ? "bg-white text-black"
                    : "bg-[var(--ov-0a)] text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--muted)] bg-[var(--ov-0a)] hover:text-[var(--text)] hover:bg-[var(--ov-1a)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
