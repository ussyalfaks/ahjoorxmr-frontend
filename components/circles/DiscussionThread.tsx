"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  MessageSquare,
  Pin,
  PinOff,
  Reply,
  SendHorizonal,
  Trash2,
  X,
} from "lucide-react";
import {
  type Comment,
  type ModerationEvent,
  COMMENT_MAX_LENGTH,
  MAX_PINNED_COMMENTS,
} from "@/types/discussion";
import { useCircleModeration } from "@/hooks/useCircleModeration";
import RelativeTime from "@/components/ui/RelativeTime";
import { SearchInput } from "@/components/ui/SearchInput";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { ModerationMenu, RemovedMessagePlaceholder } from "./ModerationMenu";

function truncateAddress(address: string): string {
  return address.length <= 12 ? address : `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function Avatar({ address, small = false }: { address: string; small?: boolean }) {
  let hash = 0;
  for (let index = 0; index < address.length; index++) {
    hash = address.charCodeAt(index) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return (
    <div
      aria-hidden="true"
      className={`${small ? "h-6 w-6 text-[9px]" : "h-8 w-8 text-[11px]"} shrink-0 rounded-full flex items-center justify-center font-bold text-white`}
      style={{ backgroundColor: `hsl(${hue}, 55%, 48%)` }}
    >
      {address.slice(2, 4).toUpperCase()}
    </div>
  );
}

interface DiscussionThreadProps {
  comments: Comment[];
  currentAddress: string;
  circleId: string;
  organizerAddress: string;
  canModerate?: boolean;
  canPin?: boolean;
  disabled?: boolean;
  onReply?: (body: string, parentId: string) => Promise<void> | void;
  onPin?: (commentId: string) => Promise<void> | void;
  onUnpin?: (commentId: string) => Promise<void> | void;
  onDeleteComment?: (commentId: string) => Promise<void> | void;
  onModerationAction?: (action: ModerationEvent) => void;
}

interface ReplyComposerProps {
  parent: Comment;
  disabled: boolean;
  onSubmit: (body: string, parentId: string) => Promise<void> | void;
  onCancel: () => void;
}

function ReplyComposer({ parent, disabled, onSubmit, onCancel }: ReplyComposerProps) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parentLabel = parent.displayName ?? truncateAddress(parent.author);
  const remaining = COMMENT_MAX_LENGTH - body.trim().length;
  const canSubmit = body.trim().length > 0 && remaining >= 0 && !busy && !disabled;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(body.trim(), parent.id);
      setBody("");
      onCancel();
    } catch {
      setError("Failed to send reply. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 rounded-xl border border-[#4B6B76]/40 bg-[var(--content)] p-3" aria-label={`Reply to ${parentLabel}`}>
      <div className="flex items-center justify-between pb-2 text-xs text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5"><CornerDownRight size={13} />Replying to <b>@{parentLabel}</b></span>
        <button type="button" onClick={onCancel} aria-label="Cancel reply" className="p-0.5"><X size={14} /></button>
      </div>
      <textarea
        rows={2}
        autoFocus
        value={body}
        disabled={disabled || busy}
        onChange={(event) => { setBody(event.target.value); setError(null); }}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") submit(event as unknown as React.FormEvent);
          if (event.key === "Escape") onCancel();
        }}
        placeholder={`Write your reply to ${parentLabel}...`}
        className="w-full resize-none rounded-lg border border-[var(--ov-0f)] bg-[var(--ov-05)] p-2.5 text-sm text-[var(--text)]"
      />
      <div className="flex items-center justify-between pt-2">
        <span className={`text-[11px] ${remaining < 0 ? "text-[#FF5B5B]" : "text-[var(--faint)]"}`}>{remaining} remaining</span>
        <button type="submit" disabled={!canSubmit} className="inline-flex items-center gap-1 rounded-lg bg-[#4B6B76] px-3 py-1 text-xs font-semibold text-white disabled:opacity-40">
          <SendHorizonal size={12} />{busy ? "Sending..." : "Reply"}
        </button>
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-[#FF5B5B]">{error}</p>}
    </form>
  );
}

interface CommentRowProps {
  comment: Comment;
  currentAddress: string;
  canModerate: boolean;
  canPin: boolean;
  pinnedCount: number;
  disabled: boolean;
  isReply?: boolean;
  onStartReply?: (comment: Comment) => void;
  onPin?: (commentId: string) => void;
  onUnpin?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  isOrganizer: boolean;
  isMuted: boolean;
  onRemoveMessage: (id: string, author: string, reason?: string) => void;
  onMuteParticipant: (address: string, reason?: string) => void;
}

function CommentRow({
  comment,
  currentAddress,
  canModerate,
  canPin,
  pinnedCount,
  disabled,
  isReply,
  onStartReply,
  onPin,
  onUnpin,
  onDelete,
  isOrganizer,
  isMuted,
  onRemoveMessage,
  onMuteParticipant,
}: CommentRowProps) {
  const own = comment.author.toLowerCase() === currentAddress.toLowerCase();
  const label = comment.displayName ?? truncateAddress(comment.author);
  if (comment.isRemoved) {
    return (
      <div className="flex gap-3">
        <Avatar address="0x0000000000000000000000000000000000000000" small={isReply} />
        <div className="min-w-0 flex-1"><RemovedMessagePlaceholder removedBy={comment.removedBy} /></div>
      </div>
    );
  }

  return (
    <div id={`comment-${comment.id}`} className={`group relative flex gap-3 rounded-xl p-2 -mx-2 ${comment.isPinned ? "border border-amber-500/20 bg-amber-500/[0.04]" : ""}`}>
      <Avatar address={comment.author} small={isReply} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-semibold text-[var(--text)] font-mono">{label}</span>
          {own && <span className="rounded-full bg-[#4B6B7620] px-2 py-0.5 text-[10px] text-[#4B6B76]">you</span>}
          {comment.isPinned && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600"><Pin size={10} />Pinned</span>}
          <RelativeTime date={comment.createdAt} className="ml-auto shrink-0 text-xs text-[var(--faint)]" />
        </div>
        <p className="mt-1 text-sm leading-relaxed text-[var(--muted)] break-words">{comment.body}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--faint)]">
          {onStartReply && !disabled && (
            <button type="button" onClick={() => onStartReply(comment)} className="inline-flex items-center gap-1 font-medium hover:text-[var(--text)]"><Reply size={13} />Reply</button>
          )}
          {canPin && (
            comment.isPinned ? (
              <button type="button" onClick={() => onUnpin?.(comment.id)} className="inline-flex items-center gap-1 font-medium text-amber-600"><PinOff size={13} />Unpin</button>
            ) : (
              <button type="button" onClick={() => onPin?.(comment.id)} disabled={pinnedCount >= MAX_PINNED_COMMENTS} className="inline-flex items-center gap-1 font-medium disabled:opacity-40"><Pin size={13} />Pin</button>
            )
          )}
          {(canModerate || own) && onDelete && (
            <button type="button" onClick={() => onDelete(comment.id)} className="ml-auto inline-flex items-center gap-1 font-medium hover:text-[#FF5B5B]"><Trash2 size={12} />Delete</button>
          )}
          {isOrganizer && !own && (
            <ModerationMenu
              isOrganizer={isOrganizer}
              isMuted={isMuted}
              messageId={comment.id}
              authorAddress={comment.author}
              onRemoveMessage={onRemoveMessage}
              onMuteParticipant={onMuteParticipant}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PinnedMessages({ comments, canPin, onUnpin }: { comments: Comment[]; canPin: boolean; onUnpin?: (id: string) => void }) {
  if (comments.length === 0) return null;
  function jump(id: string) {
    const element = document.getElementById(`comment-${id}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  return (
    <section className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4" aria-label="Pinned messages">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-amber-700"><Pin size={13} />Pinned Messages <span>{comments.length}/{MAX_PINNED_COMMENTS}</span></div>
      <div className="space-y-2">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--ov-0a)] bg-[var(--content)] p-3">
            <p className="line-clamp-2 text-xs text-[var(--text)]">{comment.body}</p>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => jump(comment.id)} className="rounded-lg bg-[var(--ov-0a)] px-2 py-1 text-[11px]">Jump to</button>
              {canPin && <button type="button" onClick={() => onUnpin?.(comment.id)} className="text-[11px] text-amber-600">Unpin</button>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DiscussionThread({
  comments,
  currentAddress,
  circleId,
  organizerAddress,
  canModerate = false,
  canPin = false,
  disabled = false,
  onReply,
  onPin,
  onUnpin,
  onDeleteComment,
  onModerationAction,
}: DiscussionThreadProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const [activeReply, setActiveReply] = useState<Comment | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const moderation = useCircleModeration({ circleId, organizerAddress, onModerationAction });

  const { roots, replies, pinned } = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const matches = (comment: Comment) =>
      !query ||
      comment.body.toLowerCase().includes(query) ||
      (comment.displayName ?? "").toLowerCase().includes(query) ||
      comment.author.toLowerCase().includes(query);
    const visible = comments.filter((comment) => !comment.isDeleted && matches(comment));
    const map = new Map(visible.map((comment) => [comment.id, comment]));
    const roots: Comment[] = [];
    const replies = new Map<string, Comment[]>();
    const pinned = visible.filter((comment) => comment.isPinned).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    visible.forEach((comment) => {
      if (!comment.parentId || !map.has(comment.parentId)) {
        roots.push(comment);
      } else {
        const list = replies.get(comment.parentId) ?? [];
        list.push(comment);
        replies.set(comment.parentId, list);
      }
    });
    roots.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    replies.forEach((list) => list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()));
    return { roots, replies, pinned: pinned.slice(0, MAX_PINNED_COMMENTS) };
  }, [comments, debouncedSearch]);

  function toggle(threadId: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      next.has(threadId) ? next.delete(threadId) : next.add(threadId);
      return next;
    });
  }

  return (
    <div className="space-y-6" aria-label="Discussion thread">
      <SearchInput value={search} onChange={setSearch} placeholder="Search discussion..." />
      <PinnedMessages comments={pinned} canPin={canPin} onUnpin={onUnpin} />
      {roots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--ov-1a)] bg-[var(--ov-05)] px-6 py-12 text-center">
          <MessageSquare size={24} className="mx-auto mb-3 text-[var(--faint)]" />
          <p className="text-sm font-medium text-[var(--muted)]">No messages found</p>
        </div>
      ) : (
        <ul className="space-y-6 list-none p-0">
          {roots.map((root) => {
            const threadReplies = replies.get(root.id) ?? [];
            const isCollapsed = collapsed.has(root.id);
            return (
              <li key={root.id} className="border-b border-[var(--ov-0a)] pb-6 last:border-b-0">
                <CommentRow
                  comment={root}
                  currentAddress={currentAddress}
                  canModerate={canModerate}
                  canPin={canPin}
                  pinnedCount={pinned.length}
                  disabled={disabled}
                  onStartReply={onReply && !disabled ? setActiveReply : undefined}
                  onPin={onPin}
                  onUnpin={onUnpin}
                  onDelete={onDeleteComment}
                  isOrganizer={moderation.isOrganizer(root.author)}
                  isMuted={moderation.isMuted(root.author)}
                  onRemoveMessage={(id, author, reason) => moderation.removeMessage(id, author, reason)}
                  onMuteParticipant={(address, reason) => moderation.muteParticipant(address, reason)}
                />
                {threadReplies.length > 0 && (
                  <div className="ml-6 mt-2 sm:ml-11">
                    <button type="button" onClick={() => toggle(root.id)} className="inline-flex items-center gap-1 text-xs font-medium text-[#4B6B76]">
                      {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                      {isCollapsed ? `Show ${threadReplies.length} replies` : `Hide ${threadReplies.length} replies`}
                    </button>
                    {!isCollapsed && (
                      <div id={`replies-${root.id}`} className="mt-3 space-y-3 border-l border-[var(--ov-0f)] pl-4">
                        {threadReplies.map((reply) => (
                          <CommentRow
                            key={reply.id}
                            comment={reply}
                            currentAddress={currentAddress}
                            canModerate={canModerate}
                            canPin={canPin}
                            pinnedCount={pinned.length}
                            disabled={disabled}
                            isReply
                            onStartReply={onReply && !disabled ? setActiveReply : undefined}
                            onPin={onPin}
                            onUnpin={onUnpin}
                            onDelete={onDeleteComment}
                            isOrganizer={moderation.isOrganizer(reply.author)}
                            isMuted={moderation.isMuted(reply.author)}
                            onRemoveMessage={(id, author, reason) => moderation.removeMessage(id, author, reason)}
                            onMuteParticipant={(address, reason) => moderation.muteParticipant(address, reason)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activeReply?.id === root.id && onReply && (
                  <ReplyComposer parent={root} disabled={disabled} onSubmit={onReply} onCancel={() => setActiveReply(null)} />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
