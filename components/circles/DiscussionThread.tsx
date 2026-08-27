"use client";

import { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import type { Comment } from "@/types/discussion";

// ─── Helpers ────────────────────────────────────────────────────────────────

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function getRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
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

// ─── Avatar ──────────────────────────────────────────────────────────────────
// Deterministic hue derived from the author address — stable colour per
// participant with no external dep. Swap for a real avatar image when
// profile pictures are available.

function Avatar({ address }: { address: string }) {
  const hue = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      hash = address.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 360;
  }, [address]);

  const initials = address.slice(2, 4).toUpperCase();

  return (
    <div
      aria-hidden="true"
      className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold text-white select-none"
      style={{ backgroundColor: `hsl(${hue}, 55%, 48%)` }}
    >
      {initials}
    </div>
  );
}

// ─── Single comment row ───────────────────────────────────────────────────────

interface CommentItemProps {
  comment: Comment;
  currentAddress: string;
}

function CommentItem({ comment, currentAddress }: CommentItemProps) {
  const isOwn =
    comment.author.toLowerCase() === currentAddress.toLowerCase();
  const label = comment.displayName ?? truncateAddress(comment.author);

  return (
    <li className="flex gap-3">
      <Avatar address={comment.author} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold text-[var(--text)] font-mono">
            {label}
          </span>
          {isOwn && (
            <span className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-[#4B6B7620] text-[#4B6B76]">
              you
            </span>
          )}
          <time
            dateTime={comment.createdAt.toISOString()}
            className="text-xs text-[var(--faint)] ml-auto shrink-0"
          >
            {getRelativeTime(comment.createdAt)}
          </time>
        </div>

        <p className="mt-1 text-sm leading-relaxed text-[var(--muted)] break-words">
          {comment.body}
        </p>
      </div>
    </li>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--ov-1a)] bg-[var(--ov-05)] px-6 py-12 text-center">
      <MessageSquare
        size={24}
        className="mx-auto mb-3 text-[var(--faint)]"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-[var(--muted)]">
        No messages yet
      </p>
      <p className="mt-1 text-xs text-[var(--faint)]">
        Be the first to post an update or ask a question.
      </p>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

interface DiscussionThreadProps {
  comments: Comment[];
  currentAddress: string;
}

export default function DiscussionThread({
  comments,
  currentAddress,
}: DiscussionThreadProps) {
  const sorted = useMemo(
    () =>
      [...comments].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      ),
    [comments]
  );

  if (sorted.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="space-y-5 list-none p-0" aria-label="Discussion thread">
      {sorted.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentAddress={currentAddress}
        />
      ))}
    </ul>
  );
}
