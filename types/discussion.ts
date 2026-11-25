/**
 * Shapes mirror what a future `/api/circles/:id/comments` endpoint is
 * expected to return, so mock data can be replaced with a real fetch
 * (or a real-time subscription) without touching the components.
 */

export interface Comment {
  id: string;
  circleId: string;
  /** Wallet address (or user id) of the author. */
  author: string;
  /** Optional display name; falls back to a truncated address. */
  displayName?: string;
  body: string;
  createdAt: Date;
  /** Optional parent id for single-level nested replies. */
  parentId?: string;
  /** Whether the comment is pinned by an organizer. */
  isPinned?: boolean;
  /** Timestamp when the comment was pinned. */
  pinnedAt?: Date;
  /** Address of the organizer who pinned the comment. */
  pinnedBy?: string;
  /** Whether the comment has been moderated/deleted. */
  isDeleted?: boolean;
  /** Whether this message has been removed by an organizer */
  isRemoved?: boolean;
  /** Who removed this message (if removed) */
  removedBy?: string;
}

/** Max character length enforced by the composer. */
export const COMMENT_MAX_LENGTH = 500;

/** Maximum number of pinned messages allowed per circle. */
export const MAX_PINNED_COMMENTS = 3;
/** Event emitted when a moderation action occurs */
export interface ModerationEvent {
  type: "message_removed" | "participant_muted";
  targetAddress: string;
  targetMessageId?: string;
  actorAddress: string;
  circleId: string;
  timestamp: Date;
  reason?: string;
}
