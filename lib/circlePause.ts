import { addNotification } from "@/lib/notifications";

const STORAGE_KEY = "ahjoorxmr:circle-pause";

// Fired whenever a circle is paused or resumed so the detail page, settings
// page and countdowns update without a reload.
export const CIRCLE_PAUSE_EVENT = "ahjoorxmr:circle-pause-changed";

export const MIN_PAUSE_REASON_LENGTH = 10;

export interface CirclePauseLogEntry {
  id: string;
  type: "paused" | "resumed";
  actor: string;
  at: string; // ISO-8601
  reason?: string;
}

export interface CirclePauseState {
  circleId: string;
  paused: boolean;
  reason: string | null;
  pausedAt: string | null;
  pausedBy: string | null;
  /** Total ms spent paused across completed pauses; used to push deadlines back. */
  totalPausedMs: number;
  log: CirclePauseLogEntry[];
}

function emptyState(circleId: string): CirclePauseState {
  return { circleId, paused: false, reason: null, pausedAt: null, pausedBy: null, totalPausedMs: 0, log: [] };
}

function readAll(): Record<string, CirclePauseState> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function write(state: CirclePauseState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readAll(), [state.circleId]: state }));
    window.dispatchEvent(new CustomEvent(CIRCLE_PAUSE_EVENT, { detail: { circleId: state.circleId } }));
  } catch {
    // Storage may be unavailable (private mode); pause state won't persist.
  }
}

export function getCirclePauseState(circleId: string): CirclePauseState {
  return readAll()[circleId] ?? emptyState(circleId);
}

export function isCirclePaused(circleId: string): boolean {
  return getCirclePauseState(circleId).paused;
}

/**
 * Deadline after accounting for time spent paused. While paused there is no
 * active deadline (null) — contributions and reminders are suspended.
 */
export function getAdjustedDeadline(circleId: string, deadline: Date | null): Date | null {
  if (!deadline) return null;
  const state = getCirclePauseState(circleId);
  if (state.paused) return null;
  return new Date(deadline.getTime() + state.totalPausedMs);
}

/**
 * Whether contribution reminders should fire for this circle right now.
 * Anything that schedules reminders/auto-pay should check this first.
 */
export function shouldSendReminders(circleId: string): boolean {
  return !isCirclePaused(circleId);
}

function notifyParticipants(
  participants: string[],
  circleId: string,
  build: (participant: string) => { title: string; description: string; type: "circle_paused" | "circle_resumed" }
) {
  // Stand-in for a per-recipient notification API: like the rest of the
  // demo, every notification lands in the connected wallet's inbox.
  const stamp = Date.now();
  participants.forEach((participant, index) => {
    const { title, description, type } = build(participant);
    addNotification({
      id: `${type}-${circleId}-${stamp}-${index}`,
      type,
      title,
      description,
      href: `/dashboard/circles/${circleId}`,
    });
  });
}

export function pauseCircle(input: {
  circleId: string;
  circleName: string;
  reason: string;
  actor: string;
  participants: string[];
}): CirclePauseState {
  const reason = input.reason.trim();
  if (reason.length < MIN_PAUSE_REASON_LENGTH) {
    throw new Error(`Please give a reason of at least ${MIN_PAUSE_REASON_LENGTH} characters.`);
  }
  const current = getCirclePauseState(input.circleId);
  if (current.paused) return current;

  const at = new Date().toISOString();
  const next: CirclePauseState = {
    ...current,
    paused: true,
    reason,
    pausedAt: at,
    pausedBy: input.actor,
    log: [...current.log, { id: `pause-${input.circleId}-${Date.now()}`, type: "paused", actor: input.actor, at, reason }],
  };
  write(next);

  notifyParticipants(input.participants, input.circleId, () => ({
    type: "circle_paused",
    title: `${input.circleName} has been paused`,
    description: `Contribution deadlines are on hold. Reason: ${reason}`,
  }));
  return next;
}

export function resumeCircle(input: {
  circleId: string;
  circleName: string;
  actor: string;
  participants: string[];
}): CirclePauseState {
  const current = getCirclePauseState(input.circleId);
  if (!current.paused) return current;

  const now = Date.now();
  const pausedFor = current.pausedAt ? Math.max(0, now - Date.parse(current.pausedAt)) : 0;
  const next: CirclePauseState = {
    ...current,
    paused: false,
    reason: null,
    pausedAt: null,
    pausedBy: null,
    totalPausedMs: current.totalPausedMs + pausedFor,
    log: [
      ...current.log,
      { id: `resume-${input.circleId}-${now}`, type: "resumed", actor: input.actor, at: new Date(now).toISOString() },
    ],
  };
  write(next);

  notifyParticipants(input.participants, input.circleId, () => ({
    type: "circle_resumed",
    title: `${input.circleName} has resumed`,
    description: "The contribution schedule has restarted. Deadlines were extended by the time the circle was paused.",
  }));
  return next;
}
