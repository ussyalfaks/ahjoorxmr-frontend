"use client";

import { useState, useMemo, useRef } from "react";
import {
  MessageSquare,
  Reply,
  Pin,
  PinOff,
  Trash2,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  SendHorizonal,
  X,
} from "lucide-react";
import {
  type Comment,
  COMMENT_MAX_LENGTH,
  MAX_PINNED_COMMENTS,
} from "@/types/discussion";
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

function Avatar({
  address,
  size = "md",
}: {
  address: string;
  size?: "sm" | "md";
}) {
  const hue = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      hash = address.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 360;
  }, [address]);

  const initials = address.slice(2, 4).toUpperCase();
  const dim = size === "sm" ? "h-6 w-6 text-[9px]" : "h-8 w-8 text-[11px]";

  return (
    <div
      aria-hidden="true"
      className={`${dim} shrink-0 rounded-full flex items-center justify-center font-bold text-white select-none`}
      style={{ backgroundColor: `hsl(${hue}, 55%, 48%)` }}
    >
      {initials}
    </div>
  );
}

// ─── Inline Reply Composer ───────────────────────────────────────────────────

interface ReplyComposerProps {
  parentComment: Comment;
  onSubmit: (body: string, parentId: string) => Promise<void> | void;
  onCancel: () => void;
  disabled?: boolean;
}

function ReplyComposer({
  parentComment,
  onSubmit,
  onCancel,
  disabled = false,
}: ReplyComposerProps) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const parentLabel =
    parentComment.displayName ?? truncateAddress(parentComment.author);
  const trimmed = body.trim();
  const remaining = COMMENT_MAX_LENGTH - trimmed.length;
  const isOverLimit = remaining < 0;
  const isEmpty = trimmed.length === 0;
  const canSubmit = !isEmpty && !isOverLimit && !busy && !disabled;

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!canSubmit) return;

    setBusy(true);
    setError(null);
    try {
      await onSubmit(trimmed, parentComment.id);
      setBody("");
      onCancel();
    } catch {
      setError("Failed to send reply. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      onCancel();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 rounded-xl border border-[#4B6B76]/40 bg-[var(--content)] p-3 shadow-sm transition-colors"
      aria-label={`Reply to ${parentLabel}`}
    >
      <div className="flex items-center justify-between pb-2 text-xs text-[var(--muted)]">
        <div className="flex items-center gap-1.5 font-medium">
          <CornerDownRight size={13} className="text-[#4B6B76]" />
          <span>
            Replying to{" "}
            <span className="font-mono text-[var(--text)] font-semibold">
              @{parentLabel}
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-[var(--faint)] hover:text-[var(--text)] transition-colors p-0.5 rounded"
          aria-label="Cancel reply"
        >
          <X size={14} />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        rows={2}
        autoFocus
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          if (error) setError(null);
        }}
        onKeyDown={handleKeyDown}
        placeholder={`Write your reply to ${parentLabel}…`}
        disabled={disabled || busy}
        className="w-full resize-none rounded-lg bg-[var(--ov-05)] p-2.5 text-sm text-[var(--text)] placeholder:text-[var(--faint)] border border-[var(--ov-0f)] focus:outline-none focus:border-[#4B6B76]"
      />

      <div className="flex items-center justify-between pt-2">
        <span
          className={`text-[11px] tabular-nums ${
            isOverLimit ? "text-[#FF5B5B]" : "text-[var(--faint)]"
          }`}
        >
          {remaining} remaining
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-2.5 py-1 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#4B6B76] px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#3D5A64] disabled:opacity-40"
          >
            <SendHorizonal size={12} />
            {busy ? "Sending…" : "Reply"}
          </button>
        </div>
      </div>

      {error && <p className="mt-1 text-xs text-[#FF5B5B]">{error}</p>}
    </form>
  );
}

// ─── Comment / Reply Row Component ──────────────────────────────────────────

interface CommentRowProps {
  comment: Comment;
  currentAddress: string;
  isReply?: boolean;
  canModerate?: boolean;
  canPin?: boolean;
  pinnedCount?: number;
  onStartReply?: (comment: Comment) => void;
  onPin?: (commentId: string) => void;
  onUnpin?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
}

function CommentRow({
  comment,
  currentAddress,
  isReply = false,
  canModerate = false,
  canPin = false,
  pinnedCount = 0,
  onStartReply,
  onPin,
  onUnpin,
  onDelete,
}: CommentRowProps) {
  const isOwn =
    comment.author.toLowerCase() === currentAddress.toLowerCase();
  const label = comment.displayName ?? truncateAddress(comment.author);
  const canDeleteThis = canModerate || isOwn;
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
    <div
      id={`comment-${comment.id}`}
      className={`group relative flex gap-3 transition-colors rounded-xl p-2 -mx-2 hover:bg-[var(--ov-05)] ${
        comment.isPinned ? "bg-amber-500/[0.04] border border-amber-500/20" : ""
      }`}
    >
      <Avatar address={comment.author} size={isReply ? "sm" : "md"} />

      <div className="min-w-0 flex-1">
        {/* Header */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold text-[var(--text)] font-mono">
            {label}
          </span>
          {isOwn && (
            <span className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-[#4B6B7620] text-[#4B6B76]">
              you
            </span>
          )}
          {comment.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
              <Pin size={10} aria-hidden="true" />
              Pinned
            </span>
          )}
          <time
            dateTime={comment.createdAt.toISOString()}
          <RelativeTime
            date={comment.createdAt}
            className="text-xs text-[var(--faint)] ml-auto shrink-0"
          />
        </div>

        {/* Body */}
        <p className="mt-1 text-sm leading-relaxed text-[var(--muted)] break-words">
          {comment.body}
        </p>

        {/* Actions bar (Reply & Moderation actions) */}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--faint)]">
          {onStartReply && (
            <button
              type="button"
              onClick={() => onStartReply(comment)}
              className="inline-flex items-center gap-1 font-medium hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4B6B76] rounded"
            >
              <Reply size={13} aria-hidden="true" />
              Reply
            </button>
          )}

          {/* Moderation: Pin / Unpin (Works on root comments and replies) */}
          {canPin && (
            <>
              {comment.isPinned ? (
                <button
                  type="button"
                  onClick={() => onUnpin?.(comment.id)}
                  className="inline-flex items-center gap-1 font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 rounded"
                  title="Unpin this comment"
                >
                  <PinOff size={13} aria-hidden="true" />
                  Unpin
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onPin?.(comment.id)}
                  disabled={pinnedCount >= MAX_PINNED_COMMENTS}
                  className="inline-flex items-center gap-1 font-medium hover:text-[var(--text)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4B6B76] rounded"
                  title={
                    pinnedCount >= MAX_PINNED_COMMENTS
                      ? `Max ${MAX_PINNED_COMMENTS} pinned comments reached`
                      : "Pin comment to top"
                  }
                >
                  <Pin size={13} aria-hidden="true" />
                  Pin
                </button>
              )}
            </>
          )}

          {/* Moderation: Delete comment / reply */}
          {canDeleteThis && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              className="inline-flex items-center gap-1 font-medium hover:text-[#FF5B5B] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF5B5B] rounded ml-auto sm:ml-0"
              title="Delete this comment"
            >
              <Trash2 size={12} aria-hidden="true" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pinned Messages Section ─────────────────────────────────────────────────

interface PinnedMessagesSectionProps {
  pinnedComments: Comment[];
  canModerate?: boolean;
  canPin?: boolean;
  onUnpin?: (commentId: string) => void;
}

function PinnedMessagesSection({
  pinnedComments,
  canPin = false,
  onUnpin,
}: PinnedMessagesSectionProps) {
  if (pinnedComments.length === 0) return null;

  function scrollToComment(id: string) {
    const el = document.getElementById(`comment-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-amber-500", "transition-all");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-amber-500");
      }, 2000);
    }
  }

  return (
    <section
      aria-label="Pinned messages"
      className="mb-8 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4 sm:p-5"
    >
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Pin size={13} aria-hidden="true" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 font-sora">
            Pinned Messages
          </h2>
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
            {pinnedComments.length}/{MAX_PINNED_COMMENTS}
          </span>
        </div>
        <span className="text-[11px] text-[var(--faint)]">
          {pinnedComments.length === MAX_PINNED_COMMENTS
            ? "Max pinned limit reached"
            : `Up to ${MAX_PINNED_COMMENTS} key messages`}
        </span>
      </div>

      <div className="space-y-3">
        {pinnedComments.map((comment) => {
          const authorLabel =
            comment.displayName ?? truncateAddress(comment.author);

          return (
            <div
              key={`pinned-${comment.id}`}
              className="flex items-start justify-between gap-3 rounded-xl bg-[var(--content)] border border-[var(--ov-0a)] p-3.5 shadow-sm"
            >
              <div className="flex gap-3 min-w-0 flex-1">
                <Avatar address={comment.author} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-mono font-semibold text-[var(--text)]">
                      {authorLabel}
                    </span>
                    <time
                      dateTime={comment.createdAt.toISOString()}
                      className="text-[10px] text-[var(--faint)]"
                    >
                      {getRelativeTime(comment.createdAt)}
                    </time>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text)] line-clamp-3 leading-relaxed">
                    {comment.body}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-center">
                <button
                  type="button"
                  onClick={() => scrollToComment(comment.id)}
                  className="rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--muted)] hover:text-[var(--text)] bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4B6B76]"
                >
                  Jump to
                </button>
                {canPin && onUnpin && (
                  <button
                    type="button"
                    onClick={() => onUnpin(comment.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500"
                    title="Unpin message"
                  >
                    <PinOff size={12} aria-hidden="true" />
                    Unpin
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>

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
      <p className="text-sm font-medium text-[var(--muted)]">No messages yet</p>
      <p className="mt-1 text-xs text-[var(--faint)]">
        Be the first to post an update, pin important rules, or ask a question.
      </p>
    </div>
  );
}

// ─── Grouped Thread Data Structure ───────────────────────────────────────────

interface ThreadGroup {
  parent: Comment;
  replies: Comment[];
}

// ─── Main Discussion Thread Component ─────────────────────────────────────────

export interface DiscussionThreadProps {
  comments: Comment[];
  currentAddress: string;
  canModerate?: boolean;
  canPin?: boolean;
  onReply?: (body: string, parentId: string) => Promise<void> | void;
  onPin?: (commentId: string) => Promise<void> | void;
  onUnpin?: (commentId: string) => Promise<void> | void;
  onDeleteComment?: (commentId: string) => Promise<void> | void;
  disabled?: boolean;
  circleId: string;
  organizerAddress: string;
  /** Callback when a moderation action occurs (for activity feed logging) */
  onModerationAction?: (action: ModerationEvent) => void;
}

export default function DiscussionThread({
  comments,
  currentAddress,
  canModerate = false,
  canPin = false,
  onReply,
  onPin,
  onUnpin,
  onDeleteComment,
  disabled = false,
}: DiscussionThreadProps) {
  // State for which comment is currently being replied to
  const [activeReplyComment, setActiveReplyComment] = useState<Comment | null>(
    null
  );

  // Set of collapsed parent comment IDs.
  // Threads with > 2 replies start collapsed by default.
  const [collapsedThreadIds, setCollapsedThreadIds] = useState<Set<string>>(
    () => {
      const initialCollapsed = new Set<string>();
      // Count replies per parent
      const replyCounts = new Map<string, number>();
      for (const c of comments) {
        if (c.parentId) {
          replyCounts.set(c.parentId, (replyCounts.get(c.parentId) ?? 0) + 1);
        }
      }
      for (const [parentId, count] of replyCounts.entries()) {
        if (count > 2) {
          initialCollapsed.add(parentId);
        }
      }
      return initialCollapsed;
    }
  );

  // Group comments into root comments and nested replies
  const { threadGroups, pinnedComments, totalPinnedCount } = useMemo(() => {
    const commentMap = new Map<string, Comment>();
    for (const c of comments) {
      if (!c.isDeleted) {
        commentMap.set(c.id, c);
      }
    }

    const pinned: Comment[] = [];
    const rootComments: Comment[] = [];
    const repliesMap = new Map<string, Comment[]>();

    // 1. Separate roots and replies
    for (const c of comments) {
      if (c.isDeleted) continue;

      if (c.isPinned) {
        pinned.push(c);
      }

      if (!c.parentId || !commentMap.has(c.parentId)) {
        rootComments.push(c);
      } else {
        // Find top-level ancestor parent to keep replies nested one level
        let rootParentId = c.parentId;
        let visited = 0;
        while (
          commentMap.get(rootParentId)?.parentId &&
          commentMap.has(commentMap.get(rootParentId)!.parentId!) &&
          visited < 10
        ) {
          rootParentId = commentMap.get(rootParentId)!.parentId!;
          visited++;
        }

        const existing = repliesMap.get(rootParentId) ?? [];
        existing.push(c);
        repliesMap.set(rootParentId, existing);
      }
    }

    // Sort pinned by pinnedAt (or createdAt) desc, up to MAX_PINNED_COMMENTS
    pinned.sort(
      (a, b) =>
        (b.pinnedAt?.getTime() ?? b.createdAt.getTime()) -
        (a.pinnedAt?.getTime() ?? a.createdAt.getTime())
    );

    // Sort root comments chronologically
    rootComments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // Build thread groups
    const groups: ThreadGroup[] = rootComments.map((root) => {
      const replies = repliesMap.get(root.id) ?? [];
      replies.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      return { parent: root, replies };
    });

    return {
      threadGroups: groups,
      pinnedComments: pinned.slice(0, MAX_PINNED_COMMENTS),
      totalPinnedCount: pinned.length,
    };
  }, [comments]);

  function toggleCollapse(threadId: string) {
    setCollapsedThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(threadId)) {
        next.delete(threadId);
      } else {
        next.add(threadId);
      }
      return next;
    });
  }

  function handleStartReply(target: Comment, rootParentId?: string) {
    // If target is a reply, we set activeReplyComment with parentId set to the root parent
    // so replies nest 1 level under the root parent.
    if (rootParentId && target.id !== rootParentId) {
      setActiveReplyComment({
        ...target,
        id: rootParentId, // Submit under root parent
      });
    } else {
      setActiveReplyComment(target);
    }
  }

  if (comments.length === 0) {
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
    <div className="space-y-6" aria-label="Discussion thread">
      {/* ─── Pinned Messages Section (top of discussion) ─── */}
      <PinnedMessagesSection
        pinnedComments={pinnedComments}
        canModerate={canModerate}
        canPin={canPin}
        onUnpin={onUnpin}
      />

      {/* ─── Threaded Discussion Feed ─── */}
      <ul className="space-y-6 list-none p-0">
        {threadGroups.map((group) => {
          const { parent, replies } = group;
          const isCollapsed = collapsedThreadIds.has(parent.id);
          const hasReplies = replies.length > 0;
          const isReplyingToThisThread = activeReplyComment?.id === parent.id;

          return (
            <li
              key={parent.id}
              className="border-b border-[var(--ov-0a)] pb-6 last:border-b-0 last:pb-0"
            >
              {/* Parent Comment */}
              <CommentRow
                comment={parent}
                currentAddress={currentAddress}
                isReply={false}
                canModerate={canModerate}
                canPin={canPin}
                pinnedCount={totalPinnedCount}
                onStartReply={!disabled ? (c) => handleStartReply(c) : undefined}
                onPin={onPin}
                onUnpin={onUnpin}
                onDelete={onDeleteComment}
              />

              {/* Collapse / Expand Toggle for Long Threads */}
              {hasReplies && (
                <div className="mt-2 ml-6 sm:ml-11">
                  <button
                    type="button"
                    onClick={() => toggleCollapse(parent.id)}
                    aria-expanded={!isCollapsed}
                    aria-controls={`replies-${parent.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-[#4B6B76] hover:text-[#3D5A64] hover:bg-[#4B6B7610] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4B6B76]"
                  >
                    {isCollapsed ? (
                      <>
                        <ChevronDown size={14} aria-hidden="true" />
                        <span>
                          Show {replies.length}{" "}
                          {replies.length === 1 ? "reply" : "replies"}
                        </span>
                      </>
                    ) : (
                      <>
                        <ChevronUp size={14} aria-hidden="true" />
                        <span>
                          Hide {replies.length}{" "}
                          {replies.length === 1 ? "reply" : "replies"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Nested Replies (1 Level Under Parent) */}
              {hasReplies && !isCollapsed && (
                <div
                  id={`replies-${parent.id}`}
                  className="mt-3 ml-4 sm:ml-8 pl-4 sm:pl-5 border-l-2 border-[var(--ov-0f)] space-y-3"
                >
                  {replies.map((reply) => (
                    <CommentRow
                      key={reply.id}
                      comment={reply}
                      currentAddress={currentAddress}
                      isReply={true}
                      canModerate={canModerate}
                      canPin={canPin}
                      pinnedCount={totalPinnedCount}
                      onStartReply={
                        !disabled
                          ? (c) => handleStartReply(c, parent.id)
                          : undefined
                      }
                      onPin={onPin}
                      onUnpin={onUnpin}
                      onDelete={onDeleteComment}
                    />
                  ))}
                </div>
              )}

              {/* Inline Reply Composer */}
              {isReplyingToThisThread && activeReplyComment && onReply && (
                <div className="ml-4 sm:ml-8 pl-4 sm:pl-5 border-l-2 border-[#4B6B76]">
                  <ReplyComposer
                    parentComment={activeReplyComment}
                    onSubmit={onReply}
                    onCancel={() => setActiveReplyComment(null)}
                    disabled={disabled}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
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
