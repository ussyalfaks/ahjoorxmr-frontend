const CELEBRATED_KEY = "ahjoorxmr:celebrated-milestones";

// Fired on window to ask the (single) <MilestoneCelebration /> overlay to play.
export const CELEBRATE_EVENT = "ahjoorxmr:celebrate-milestone";

export type CelebrationKind = "round_completed" | "circle_fully_funded" | "final_payout_completed";

export interface CelebrationMilestone {
  /** Stable id — the same milestone must always produce the same key. */
  key: string;
  kind: CelebrationKind;
  circleId: string;
  circleName: string;
  title: string;
  message: string;
}

function readCelebrated(): Set<string> {
  try {
    const parsed = JSON.parse(localStorage.getItem(CELEBRATED_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function hasCelebrated(key: string): boolean {
  if (typeof window === "undefined") return true;
  return readCelebrated().has(key);
}

export function markCelebrated(key: string) {
  try {
    const keys = readCelebrated();
    keys.add(key);
    localStorage.setItem(CELEBRATED_KEY, JSON.stringify([...keys]));
  } catch {
    // Storage unavailable: worst case the animation may replay on a later visit.
  }
}

/**
 * Requests a celebration. Each milestone plays at most once per user (per
 * browser): it's marked as celebrated as soon as it's dispatched, so a
 * reload or a second tab won't replay it.
 */
export function celebrateMilestone(milestone: CelebrationMilestone): boolean {
  if (typeof window === "undefined" || hasCelebrated(milestone.key)) return false;
  markCelebrated(milestone.key);
  window.dispatchEvent(new CustomEvent<CelebrationMilestone>(CELEBRATE_EVENT, { detail: milestone }));
  return true;
}

export interface CircleMilestoneSnapshot {
  id: string;
  name: string;
  status: "active" | "completed" | "pending";
  memberCount: number;
  totalSlots: number;
  /** Highest round number that has finished (0 if none). */
  lastCompletedRound: number;
  totalRounds: number;
}

/** Derives which milestones a circle has reached from its current state. */
export function detectCircleMilestones(circle: CircleMilestoneSnapshot): CelebrationMilestone[] {
  const found: CelebrationMilestone[] = [];
  const base = { circleId: circle.id, circleName: circle.name };

  if (circle.status === "completed" || (circle.totalRounds > 0 && circle.lastCompletedRound >= circle.totalRounds)) {
    found.push({
      ...base,
      key: `${circle.id}:final_payout_completed`,
      kind: "final_payout_completed",
      title: "Circle complete!",
      message: `Every member of ${circle.name} has been paid out. Great saving together!`,
    });
  } else if (circle.lastCompletedRound > 0) {
    found.push({
      ...base,
      key: `${circle.id}:round_completed:${circle.lastCompletedRound}`,
      kind: "round_completed",
      title: `Round ${circle.lastCompletedRound} complete`,
      message: `${circle.name} finished round ${circle.lastCompletedRound} of ${circle.totalRounds}.`,
    });
  }

  if (circle.totalSlots > 0 && circle.memberCount >= circle.totalSlots) {
    found.push({
      ...base,
      key: `${circle.id}:circle_fully_funded`,
      kind: "circle_fully_funded",
      title: "Circle fully funded",
      message: `All ${circle.totalSlots} seats in ${circle.name} are filled.`,
    });
  }

  return found;
}

/**
 * Bridges the existing notification events: a `round_complete` notification
 * doubles as a round-completed milestone. The circle id is read from the
 * notification's href (/dashboard/circles/:id).
 */
export function celebrateFromNotification(input: { id: string; type: string; title: string; description: string; href: string }) {
  if (input.type !== "round_complete") return;
  const circleId = input.href.match(/\/circles\/([^/?#]+)/)?.[1] ?? "unknown";
  celebrateMilestone({
    key: `notification:${input.id}`,
    kind: "round_completed",
    circleId,
    circleName: "",
    title: input.title,
    message: input.description,
  });
}
