"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, CheckCircle2, DollarSign, AlertCircle, Clock, X } from "lucide-react";
import Link from "next/link";

type NotificationType = "round_complete" | "payout_ready" | "missed_contribution" | "your_turn";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  href: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
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
];

function relativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TYPE_CONFIG: Record<NotificationType, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
  round_complete: { icon: CheckCircle2, color: "text-[#4ADE80]" },
  payout_ready:   { icon: DollarSign,   color: "text-[#FBBF24]" },
  missed_contribution: { icon: AlertCircle, color: "text-[#FF5B5B]" },
  your_turn:      { icon: Clock,         color: "text-[#4B6B76]" },
};

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleNotificationClick = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[#ffffff05] border border-[#ffffff1a] text-[#A1A1AA] hover:text-white hover:bg-[#ffffff0f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#FF5B5B] text-white text-[10px] font-bold px-1 leading-none"
            aria-hidden="true"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 w-80 max-h-[420px] flex flex-col rounded-2xl border border-[#ffffff14] overflow-hidden shadow-xl z-50"
          style={{ background: "#1C1C1E" }}
          role="dialog"
          aria-label="Notifications"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#ffffff0f] shrink-0">
            <span className="text-sm font-semibold text-white">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[#4B6B76] hover:text-white transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#ffffff0f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                aria-label="Close notifications"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Bell size={28} className="text-[#ffffff1a]" aria-hidden="true" />
                <p className="text-sm text-[#A1A1AA]">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const { icon: Icon, color } = TYPE_CONFIG[n.type];
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => handleNotificationClick(n.id)}
                    className={`flex items-start gap-3 px-4 py-3.5 border-b border-[#ffffff07] hover:bg-[#ffffff05] transition-colors ${
                      !n.read ? "bg-[#ffffff03]" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full bg-[#ffffff0a] flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                      <Icon size={15} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-white truncate">{n.title}</p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-[#4B6B76] shrink-0" aria-label="Unread" />
                        )}
                      </div>
                      <p className="text-xs text-[#A1A1AA] mt-0.5 line-clamp-2">{n.description}</p>
                      <p className="text-xs text-[#666] mt-1">{relativeTime(n.timestamp)}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
