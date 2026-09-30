/**
 * Personal savings goals linked to circles. Persisted to localStorage.
 * Projections reuse the savings calculator model: a circle pays out
 * `contribution × participants`, one round every `daysPerRound` days.
 */
import { MOCK_CIRCLES, type DiscoverCircle } from "@/data/circles";
import { MOCK_CONTRIBUTIONS } from "@/data/contributions";

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string; // YYYY-MM-DD
  circleIds: string[];
  archived: boolean;
  createdAt: string;
}

export interface GoalProgress {
  saved: number;
  expectedPayouts: number;
  percent: number;
  projectedDate: Date | null;
  onTrack: boolean;
}

const KEY = "ahjoor_savings_goals";
export const GOALS_UPDATED_EVENT = "ahjoor:goals-updated";
const DAY_MS = 24 * 60 * 60 * 1000;

export function getGoals(): SavingsGoal[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as SavingsGoal[];
  } catch {
    return [];
  }
}

function save(goals: SavingsGoal[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(goals));
    window.dispatchEvent(new Event(GOALS_UPDATED_EVENT));
  } catch { /* ignore */ }
}

export function upsertGoal(goal: Omit<SavingsGoal, "id" | "createdAt" | "archived"> & Partial<SavingsGoal>): void {
  const goals = getGoals();
  if (goal.id && goals.some((g) => g.id === goal.id)) {
    save(goals.map((g) => (g.id === goal.id ? { ...g, ...goal } : g)));
  } else {
    save([{ ...goal, id: crypto.randomUUID(), createdAt: new Date().toISOString(), archived: false }, ...goals]);
  }
}

export function setGoalArchived(id: string, archived: boolean): void {
  save(getGoals().map((g) => (g.id === id ? { ...g, archived } : g)));
}

export function deleteGoal(id: string): void {
  save(getGoals().filter((g) => g.id !== id));
}

function parseAmount(contribution: string): number {
  return parseFloat(contribution) || 0;
}

function parseDays(duration: string): number {
  return parseInt(duration, 10) || 7;
}

/** Same model as the savings calculator: payout = contribution × participants. */
export function expectedPayout(circle: DiscoverCircle): number {
  return parseAmount(circle.contribution) * circle.totalSlots;
}

export function getGoalProgress(goal: SavingsGoal, now = Date.now()): GoalProgress {
  const circles = MOCK_CIRCLES.filter((c) => goal.circleIds.includes(c.id));
  const saved = MOCK_CONTRIBUTIONS.filter((c) => goal.circleIds.includes(c.circleId) && c.date).reduce(
    (sum, c) => sum + c.amount,
    0
  );
  const expectedPayouts = circles.reduce((sum, c) => sum + expectedPayout(c), 0);
  const dailyRate = circles.reduce((sum, c) => sum + parseAmount(c.contribution) / parseDays(c.duration), 0);
  const remaining = Math.max(goal.targetAmount - saved, 0);

  let projectedDate: Date | null = null;
  if (remaining === 0) projectedDate = new Date(now);
  else if (dailyRate > 0 && expectedPayouts >= goal.targetAmount) {
    projectedDate = new Date(now + Math.ceil(remaining / dailyRate) * DAY_MS);
  }

  const targetTime = new Date(goal.targetDate).getTime();
  return {
    saved,
    expectedPayouts,
    percent: goal.targetAmount > 0 ? Math.min(100, (saved / goal.targetAmount) * 100) : 0,
    projectedDate,
    onTrack: projectedDate !== null && projectedDate.getTime() <= targetTime,
  };
}
