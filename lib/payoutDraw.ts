export interface PayoutDraw {
  circleId: string;
  order: string[]; // participant addresses in payout order
  seed: string;
  timestamp: string;
  locked: boolean;
}

// Client-side only for now — swap for the circle API once it exposes a
// draw endpoint, keeping the same read/write shape (seed + finalized order).
const STORAGE_KEY = "ahjoor:payout-draws";

function readAll(): Record<string, PayoutDraw> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(draws: Record<string, PayoutDraw>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draws));
  } catch {
    // ignore storage errors
  }
}

export function getPayoutDraw(circleId: string): PayoutDraw | null {
  return readAll()[circleId] ?? null;
}

export function savePayoutDraw(draw: PayoutDraw) {
  const draws = readAll();
  draws[draw.circleId] = draw;
  writeAll(draws);
}

export function generateSeed(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Simple deterministic string hash → 32-bit int, used to seed the PRNG. */
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/** mulberry32 — small, fast, deterministic PRNG seeded by a 32-bit int. */
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle seeded by `seed`, so the order can be replayed and verified later. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  const random = mulberry32(hashSeed(seed));
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
