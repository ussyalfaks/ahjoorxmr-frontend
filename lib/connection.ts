export type ConnectionStatus = "connected" | "reconnecting" | "offline";

// Endpoint the heartbeat pings. Defaults to the app origin so no backend
// changes are required; point it at a real health route (or the websocket
// gateway's HTTP health check) once one exists.
export const HEARTBEAT_URL = process.env.NEXT_PUBLIC_HEARTBEAT_URL ?? "/";

export const HEARTBEAT_INTERVAL_MS = 30_000;
export const HEARTBEAT_TIMEOUT_MS = 5_000;

const BACKOFF_BASE_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;

// After this many consecutive failed attempts we stop saying "reconnecting"
// and report the connection as offline (retries still continue at max backoff).
export const MAX_RECONNECT_ATTEMPTS_BEFORE_OFFLINE = 5;

// Fired on window whenever the connection is restored, so code outside the
// React tree (or deeply nested widgets) can refresh without prop drilling.
export const CONNECTION_RESTORED_EVENT = "ahjoorxmr:connection-restored";

/**
 * Exponential backoff with full jitter: 1s, 2s, 4s, … capped at 30s.
 * Jitter keeps many clients from retrying in lockstep after an outage.
 */
export function getBackoffDelay(attempt: number, random: () => number = Math.random): number {
  const exp = Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** Math.max(0, attempt - 1));
  return Math.round(exp / 2 + random() * (exp / 2));
}

/**
 * Lightweight reachability check. Resolves true when the heartbeat endpoint
 * answers (any HTTP status means the network path is up), false on network
 * error or timeout.
 */
export async function pingHeartbeat(
  url: string = HEARTBEAT_URL,
  timeoutMs: number = HEARTBEAT_TIMEOUT_MS
): Promise<boolean> {
  if (typeof window === "undefined") return true;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return false;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(url, { method: "HEAD", cache: "no-store", signal: controller.signal });
    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}
