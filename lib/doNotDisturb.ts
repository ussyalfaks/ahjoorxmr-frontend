import type { NotificationType } from "@/types/notification";

const SCHEDULE_KEY = "ahjoorxmr:dnd-schedule";

export const DND_SCHEDULE_EVENT = "ahjoorxmr:dnd-schedule-changed";

export interface DndSchedule {
  enabled: boolean;
  /** Local wall-clock time, "HH:MM" (24h). */
  start: string;
  /** Local wall-clock time, "HH:MM" (24h). End before start = overnight window. */
  end: string;
  /** Days the quiet period starts on, 0 = Sunday … 6 = Saturday. */
  days: number[];
  /** Critical notification types that still alert during quiet hours. */
  exemptTypes: NotificationType[];
}

export const DEFAULT_DND_SCHEDULE: DndSchedule = {
  enabled: false,
  start: "22:00",
  end: "07:00",
  days: [0, 1, 2, 3, 4, 5, 6],
  exemptTypes: ["payout_ready"],
};

/** Types users may exempt from quiet hours, with labels for the settings UI. */
export const DND_EXEMPTABLE_TYPES: { type: NotificationType; label: string; description: string }[] = [
  { type: "payout_ready", label: "Payout ready", description: "Your payout is available to claim" },
  { type: "missed_contribution", label: "Missed contribution", description: "A contribution deadline was missed" },
  { type: "your_turn", label: "Your turn", description: "It's your turn to receive a payout" },
];

/** The user's timezone as reported by the browser, e.g. "Africa/Lagos". */
export function getLocalTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "local time";
  } catch {
    return "local time";
  }
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * True when `date` (evaluated in the browser's local timezone) falls inside
 * the quiet window. Overnight windows (e.g. 22:00 → 07:00) belong to the day
 * they start on, so Friday 22:00 → Saturday 07:00 only needs Friday selected.
 */
export function isWithinQuietHours(schedule: DndSchedule, date: Date = new Date()): boolean {
  if (!schedule.enabled || schedule.days.length === 0) return false;

  const start = toMinutes(schedule.start);
  const end = toMinutes(schedule.end);
  if (start === end) return false;

  const minutes = date.getHours() * 60 + date.getMinutes();
  const today = date.getDay();
  const yesterday = (today + 6) % 7;

  if (start < end) {
    return schedule.days.includes(today) && minutes >= start && minutes < end;
  }
  // Overnight: evening part belongs to today, early-morning part to yesterday.
  if (minutes >= start) return schedule.days.includes(today);
  if (minutes < end) return schedule.days.includes(yesterday);
  return false;
}

/** Whether a notification of this type should be held back right now. */
export function shouldSuppress(type: NotificationType, schedule: DndSchedule = getDndSchedule(), date?: Date): boolean {
  return isWithinQuietHours(schedule, date) && !schedule.exemptTypes.includes(type);
}

export function getDndSchedule(): DndSchedule {
  if (typeof window === "undefined") return DEFAULT_DND_SCHEDULE;
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    return raw ? { ...DEFAULT_DND_SCHEDULE, ...JSON.parse(raw) } : DEFAULT_DND_SCHEDULE;
  } catch {
    return DEFAULT_DND_SCHEDULE;
  }
}

export function saveDndSchedule(schedule: DndSchedule) {
  try {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
    window.dispatchEvent(new Event(DND_SCHEDULE_EVENT));
  } catch {
    // Storage may be unavailable (private mode); schedule won't persist.
  }
}
