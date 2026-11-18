"use client";

import { useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import type { Comment, ModerationEvent } from "@/types/discussion";
import { ModerationMenu, RemovedMessagePlaceholder } from "./ModerationMenu";
import { useCircleModeration } from "@/hooks/useCircleModeration";
import RelativeTime from "@/components/ui/RelativeTime";

// ─── Helpers ────────────────────────────────────────────────────────────────

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
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
  isOrganizer: boolean;
  isMuted: boolean;
  onRemoveMessage: (id: string, author: string, reason?: string) => void;
  onMuteParticipant: (address: string, reason?: string) => void;
}

function CommentItem({ 
  comment, 
  currentAddress,
  isOrganizer,
  isMuted,
  onRemoveMessage,
  onMuteParticipant,
}: CommentItemProps) {
  const isOwn =
    comment.author.toLowerCase() === currentAddress.toLowerCase();
  const label = comment.displayName ?? truncateAddress(comment.author);
  const isRemoved = comment.isRemoved;

  if (isRemoved) {
    return (
      <li className="flex gap-3">
        <Avatar address="0x0000000000000000000000000000000000000000" />
        <div className="min-w-0 flex-1">
          <RemovedMessagePlaceholder removedBy={comment.removedBy} />
        </div>
        {isOrganizer && !isOwn && (
          <ModerationMenu
            isOrganizer={isOrganizer}
            isMuted={isMuted}
            messageId={comment.id}
            authorAddress={comment.author}
            onRemoveMessage={onRemoveMessage}
            onMuteParticipant={onMuteParticipant}
          />
        )}
      </li>
    );
  }

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
          <RelativeTime
            date={comment.createdAt}
            className="text-xs text-[var(--faint)] ml-auto shrink-0"
          />
        </div>

        <p className="mt-1 text-sm leading-relaxed text-[var(--muted)] break-words">
          {comment.body}
        </p>
      </div>

      {isOrganizer && !isOwn && (
        <ModerationMenu
          isOrganizer={isOrganizer}
          isMuted={isMuted}
          messageId={comment.id}
          authorAddress={comment.author}
          onRemoveMessage={onRemoveMessage}
          onMuteParticipant={onMuteParticipant}
        />
      )}
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
  circleId: string;
  organizerAddress: string;
  /** Callback when a moderation action occurs (for activity feed logging) */
  onModerationAction?: (action: ModerationEvent) => void;
}

export default function DiscussionThread({
  comments,
  currentAddress,
  circleId,
  organizerAddress,
  onModerationAction,
}: DiscussionThreadProps) {
  const {
    isOrganizer,
    isMuted,
    removeMessage,
    muteParticipant,
  } = useCircleModeration({
    circleId,
    organizerAddress,
    onModerationAction,
  });

  const sorted = useMemo(
    () =>
      [...comments].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      ),
    [comments]
  );

  const handleRemoveMessage = (messageId: string, authorAddress: string, reason?: string) => {
    removeMessage(messageId, authorAddress, reason);
  };

  const handleMuteParticipant = (address: string, reason?: string) => {
    muteParticipant(address, reason);
  };

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
          isOrganizer={isOrganizer(currentAddress)}
          isMuted={isMuted(comment.author)}
          onRemoveMessage={handleRemoveMessage}
          onMuteParticipant={handleMuteParticipant}
        />
      ))}
    </ul>
  );
}
