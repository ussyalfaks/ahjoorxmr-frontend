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
}

/** Max character length enforced by the composer. */
export const COMMENT_MAX_LENGTH = 500;
