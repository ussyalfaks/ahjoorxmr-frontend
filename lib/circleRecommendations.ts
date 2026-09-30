import type { DiscoverCircle } from "@/data/circles";

const LEFT_CIRCLES_KEY = "ahjoorxmr:left-circles";

export const LEFT_CIRCLES_EVENT = "ahjoorxmr:left-circles-changed";

export const MIN_RECOMMENDATIONS = 3;
export const MAX_RECOMMENDATIONS = 5;

export interface CircleRecommendation {
  circle: DiscoverCircle;
  score: number;
  /** Human-readable explanations, strongest first. */
  reasons: string[];
  /** True when shown because the user has no history (popular/trending pick). */
  fallback: boolean;
}

const CATEGORY_LABELS: Record<NonNullable<DiscoverCircle["category"]>, string> = {
  family: "family",
  friends: "friends",
  community: "community",
  business: "business",
  emergency: "emergency",
  other: "general",
};

/** Records that the user left a circle so it's never recommended back to them. */
export function recordLeftCircle(circleId: string) {
  if (typeof window === "undefined") return;
  try {
    const ids = new Set(getLeftCircleIds());
    ids.add(circleId);
    localStorage.setItem(LEFT_CIRCLES_KEY, JSON.stringify([...ids]));
    window.dispatchEvent(new Event(LEFT_CIRCLES_EVENT));
  } catch {
    // ignore storage errors
  }
}

export function getLeftCircleIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(LEFT_CIRCLES_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseAmount(contribution: string): number {
  const match = contribution.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function parseDays(duration: string): number {
  const match = duration.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function isCompleted(circle: DiscoverCircle): boolean {
  return !!circle.totalRounds && (circle.currentRound ?? 0) >= circle.totalRounds;
}

function fillRatio(circle: DiscoverCircle): number {
  return circle.totalSlots > 0 ? circle.members.length / circle.totalSlots : 0;
}

function formatAmount(amount: number, contribution: string): string {
  const token = contribution.replace(/[\d.,\s]/g, "") || "USDT";
  return `${Math.round(amount)} ${token}`;
}

/**
 * Heuristic recommendations (no ML): scores open circles the user isn't in
 * by similarity to circles they've joined/completed, and falls back to
 * trending circles for users with no history.
 *
 * `rotation` shuffles among similarly-scored candidates so periodic refreshes
 * surface different picks when there are more good matches than slots.
 */
export function getCircleRecommendations(
  circles: DiscoverCircle[],
  wallet: string,
  options: { leftIds?: string[]; limit?: number; rotation?: number } = {}
): CircleRecommendation[] {
  const limit = Math.min(MAX_RECOMMENDATIONS, Math.max(MIN_RECOMMENDATIONS, options.limit ?? MAX_RECOMMENDATIONS));
  const left = new Set(options.leftIds ?? []);
  const history = circles.filter((c) => c.members.includes(wallet));
  const completed = history.filter(isCompleted);

  const candidates = circles.filter(
    (c) =>
      !c.members.includes(wallet) &&
      !left.has(c.id) &&
      !c.closed &&
      c.members.length < c.totalSlots
  );

  const hasHistory = history.length > 0 || left.size > 0;

  const scored: CircleRecommendation[] = candidates.map((circle) => {
    const reasons: string[] = [];
    let score = 0;

    if (hasHistory && history.length > 0) {
      const categoryMatch = circle.category
        ? history.find((h) => h.category === circle.category)
        : undefined;
      if (categoryMatch && circle.category) {
        score += 3;
        reasons.push(`You're in other ${CATEGORY_LABELS[circle.category]} circles like ${categoryMatch.name}`);
      }

      const amounts = history.map((h) => parseAmount(h.contribution)).filter((a) => a > 0);
      const avgAmount = amounts.length ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
      const amount = parseAmount(circle.contribution);
      if (avgAmount > 0 && amount >= avgAmount * 0.5 && amount <= avgAmount * 1.5) {
        score += 2;
        reasons.push(`Similar amount to your past circles (~${formatAmount(avgAmount, circle.contribution)})`);
      }

      const days = history.map((h) => parseDays(h.duration)).filter((d) => d > 0);
      const circleDays = parseDays(circle.duration);
      if (days.length && circleDays > 0 && Math.min(...days) <= circleDays && circleDays <= Math.max(...days)) {
        score += 1;
        reasons.push(`Round length (${circle.duration}) fits your usual schedule`);
      }

      if (completed.some((c) => c.category && c.category === circle.category)) {
        score += 1;
        reasons.push("Like circles you've completed before");
      }
    }

    // Popularity is a light tie-breaker for everyone and the whole score for new users.
    const matchedHistory = reasons.length > 0;
    const fill = fillRatio(circle);
    score += fill;
    if (!matchedHistory) {
      reasons.push(
        fill >= 0.75
          ? `Filling fast — ${circle.members.length} of ${circle.totalSlots} seats taken`
          : `Popular right now — ${circle.members.length} members joined`
      );
    }

    return { circle, score, reasons, fallback: !matchedHistory };
  });

  scored.sort((a, b) => b.score - a.score || fillRatio(b.circle) - fillRatio(a.circle));

  // Rotate within the pool of reasonable matches so refreshes vary the picks.
  const poolSize = Math.min(scored.length, limit + 2);
  const pool = scored.slice(0, poolSize);
  const rotation = options.rotation ?? 0;
  if (pool.length > limit && rotation > 0) {
    const keep = pool.slice(0, Math.max(1, limit - 2)); // always keep the strongest matches
    const rest = pool.slice(keep.length);
    const offset = rotation % rest.length;
    return [...keep, ...rest.slice(offset), ...rest.slice(0, offset)].slice(0, limit);
  }
  return pool.slice(0, limit);
}
