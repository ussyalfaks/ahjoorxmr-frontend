import type { CircleJoinRequest } from "@/types/circle";

const REQUESTS_KEY = "ahjoorxmr:circle-join-requests";

/**
 * Fired whenever the join-request store changes (new request, approval,
 * rejection, or cancellation) so mounted components can re-derive waitlist
 * position without waiting on the cross-tab-only `storage` event.
 */
export const JOIN_REQUESTS_UPDATED_EVENT = "ahjoorxmr:join-requests-updated";

export interface WaitlistPosition {
  /** 1-indexed position among this circle's pending requests. */
  position: number;
  /** Total number of participants currently waiting on this circle. */
  totalPending: number;
  request: CircleJoinRequest;
}

export interface WaitEstimate {
  /** Best-effort estimated wait in milliseconds, or null if there isn't enough history yet. */
  estimatedMs: number | null;
  /** Number of resolved (approved/rejected) requests the estimate is based on. */
  sampleSize: number;
}

function readAll(): CircleJoinRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(REQUESTS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(requests: CircleJoinRequest[], circleId: string) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  window.dispatchEvent(new CustomEvent(JOIN_REQUESTS_UPDATED_EVENT, { detail: { circleId } }));
}

export function getAllJoinRequests(): CircleJoinRequest[] {
  return readAll();
}

/** Pending requests for a circle, oldest first — that ordering *is* the waitlist queue. */
export function getPendingQueue(circleId: string): CircleJoinRequest[] {
  return readAll()
    .filter((request) => request.circleId === circleId && request.status === "pending")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Returns the requester's place in line, or null when they have no pending
 * request on this circle (never requested, already resolved, or cancelled).
 */
export function getWaitlistPosition(circleId: string, wallet: string): WaitlistPosition | null {
  const queue = getPendingQueue(circleId);
  const index = queue.findIndex((request) => request.requester === wallet);
  if (index === -1) return null;
  return { position: index + 1, totalPending: queue.length, request: queue[index] };
}

/**
 * Best-effort ETA based on how long this circle's past requests have taken to
 * resolve (approved or rejected). Falls back to every circle's history if
 * this one doesn't have enough of its own yet, and returns null when there's
 * no history at all — callers should label the result as an estimate.
 */
export function estimateWaitPerSlot(circleId: string): WaitEstimate {
  const all = readAll();
  const resolutionMs = (request: CircleJoinRequest) =>
    new Date(request.updatedAt).getTime() - new Date(request.createdAt).getTime();

  const forCircle = all.filter((r) => r.circleId === circleId && r.status !== "pending" && resolutionMs(r) > 0);
  const pool = forCircle.length >= 3 ? forCircle : all.filter((r) => r.status !== "pending" && resolutionMs(r) > 0);

  if (pool.length === 0) return { estimatedMs: null, sampleSize: 0 };

  const average = pool.reduce((sum, r) => sum + resolutionMs(r), 0) / pool.length;
  return { estimatedMs: average, sampleSize: pool.length };
}

/** Withdraws the caller's own pending request. No-ops if they don't have one. */
export function leaveWaitlist(circleId: string, wallet: string): boolean {
  const requests = readAll();
  const target = requests.find(
    (r) => r.circleId === circleId && r.requester === wallet && r.status === "pending"
  );
  if (!target) return false;

  const remaining = requests.filter((r) => r.id !== target.id);
  writeAll(remaining, circleId);
  return true;
}

export function formatEstimatedWait(ms: number | null): string {
  if (ms === null) return "Not enough data yet";
  const minutes = ms / (1000 * 60);
  if (minutes < 60) return `~${Math.max(1, Math.round(minutes))} min`;
  const hours = minutes / 60;
  if (hours < 48) return `~${Math.round(hours)} hr`;
  return `~${Math.round(hours / 24)} days`;
}