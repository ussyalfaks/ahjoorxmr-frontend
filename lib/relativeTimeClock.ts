/**
 * Shared minute ticker for <RelativeTime />.
 *
 * Every mounted <RelativeTime /> instance needs to re-render roughly once a
 * minute so "2 minutes ago" turns into "3 minutes ago" without a page
 * reload. Rather than have each instance run its own `setInterval`, all
 * instances subscribe to a single module-level interval via a tiny pub-sub
 * (consumed through `useSyncExternalStore`). The interval itself only runs
 * while at least one component is subscribed.
 */

const TICK_INTERVAL_MS = 60_000;

const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;
let tick = 0;

function ensureInterval() {
  if (intervalId !== null || typeof window === "undefined") return;
  intervalId = setInterval(() => {
    tick += 1;
    listeners.forEach((listener) => listener());
  }, TICK_INTERVAL_MS);
}

function teardownIfUnused() {
  if (listeners.size === 0 && intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

/** Subscribes to the shared minute tick; returns an unsubscribe function. */
export function subscribeToClock(callback: () => void): () => void {
  listeners.add(callback);
  ensureInterval();
  return () => {
    listeners.delete(callback);
    teardownIfUnused();
  };
}

/** Snapshot used by useSyncExternalStore — changes once per minute. */
export function getClockSnapshot(): number {
  return tick;
}
