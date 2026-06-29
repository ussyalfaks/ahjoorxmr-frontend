"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  UserPlus,
  Play,
  XCircle,
  Activity,
} from "lucide-react";
import type { CircleEvent, EventType } from "@/types/circle";

interface Props {
  events: CircleEvent[];
  pageSize?: number;
}

function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (diffSec < 60) return rtf.format(-diffSec, "second");
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  if (diffHr < 24) return rtf.format(-diffHr, "hour");
  return rtf.format(-diffDay, "day");
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

const EVENT_CONFIG: Record<
  EventType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  contribution_made: {
    label: "made a contribution",
    icon: <ArrowUpRight size={16} />,
    color: "text-[#4ADE80] bg-[#4ADE8015]",
  },
  payout_sent: {
    label: "received a payout",
    icon: <CheckCircle2 size={16} />,
    color: "text-[#60A5FA] bg-[#60A5FA15]",
  },
  member_joined: {
    label: "joined the circle",
    icon: <UserPlus size={16} />,
    color: "text-[#A78BFA] bg-[#A78BFA15]",
  },
  round_started: {
    label: "Round started",
    icon: <Play size={16} />,
    color: "text-[#FBBF24] bg-[#FBBF2415]",
  },
  circle_closed: {
    label: "Circle closed",
    icon: <XCircle size={16} />,
    color: "text-[#F87171] bg-[#F8717115]",
  },
};

export default function ActivityFeed({ events, pageSize = 10 }: Props) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const sorted = [...events].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-[#ffffff0a] flex items-center justify-center mb-4">
          <Activity size={24} className="text-[#A1A1AA]" aria-hidden="true" />
        </div>
        <p className="text-[#A1A1AA] text-sm">No activity yet.</p>
        <p className="text-[#555555] text-xs mt-1">
          Events will appear here once the circle is active.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ol className="relative border-l border-[#ffffff0f] ml-4 space-y-0" aria-label="Activity feed">
        {visible.map((event) => {
          const config = EVENT_CONFIG[event.type];
          const isSystemEvent =
            event.type === "round_started" || event.type === "circle_closed";

          return (
            <li key={event.id} className="mb-6 ml-6">
              <span
                className={`absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-[#111111] ${config.color}`}
                aria-hidden="true"
              >
                {config.icon}
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <p className="text-sm text-[#EBEBEB]">
                  {isSystemEvent ? (
                    <span className="font-medium">{config.label}</span>
                  ) : (
                    <>
                      <span className="font-mono text-[#A1A1AA] text-xs">
                        {truncateAddress(event.actor)}
                      </span>{" "}
                      <span className="text-[#9A9A9A]">{config.label}</span>
                    </>
                  )}
                  {event.meta?.amount && (
                    <span className="ml-1 font-semibold text-white">
                      · {String(event.meta.amount)}
                    </span>
                  )}
                </p>
                <time
                  dateTime={event.timestamp.toISOString()}
                  className="text-xs text-[#555555] shrink-0"
                >
                  {getRelativeTime(event.timestamp)}
                </time>
              </div>
            </li>
          );
        })}
      </ol>

      {hasMore && (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => setVisibleCount((c) => c + pageSize)}
            className="px-5 py-2 text-sm font-medium text-[#A1A1AA] hover:text-white bg-[#ffffff0a] hover:bg-[#ffffff14] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
