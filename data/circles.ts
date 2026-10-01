/**
 * Shared circle mock data for the discovery / my-circles page.
 * Both the grid card and list row import from here so they always
 * render the same fields from the same source.
 * Replace with an API/contract call when a backend is available.
 */

const CURRENT_WALLET = "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b";

export { CURRENT_WALLET };

export interface DiscoverCircle {
  id: string;
  name: string;
  creator: string;
  members: string[];
  totalSlots: number;
  contribution: string;
  /** Human-readable duration label, e.g. "12 Days" */
  duration: string;
  /** Optional: round info for the list view's "Round" column */
  currentRound?: number;
  totalRounds?: number;
  /** Optional: next payout label, e.g. "in 2 days" */
  nextPayout?: string;
  /** Circle has stopped accepting new activity — bookmarks flag this instead of hiding it. */
  closed?: boolean;
  description?: string;
  category?: "family" | "friends" | "community" | "business" | "emergency" | "other";
  isPrivate?: boolean;
  penaltyEnabled?: boolean;
  penaltyType?: "percentage" | "fixed";
  penaltyValue?: string;
}

export const MOCK_CIRCLES: DiscoverCircle[] = [
  {
    id: "1",
    name: "Family savings",
    category: "family",
    creator: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f",
    members: [CURRENT_WALLET, "0x111abc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8"],
    totalSlots: 5,
    contribution: "50 USDT",
    duration: "2 Days",
    currentRound: 2,
    totalRounds: 5,
    nextPayout: "in 2 days",
  },
  {
    id: "2",
    name: "School fees",
    category: "family",
    creator: "0xemmanuel9c3d5e7f1a2b4c6d8e0f2a3b5c7d9e1",
    members: [CURRENT_WALLET, "0x222def3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9"],
    totalSlots: 6,
    contribution: "40 USDT",
    duration: "12 Days",
    currentRound: 3,
    totalRounds: 6,
    nextPayout: "in 18 hrs",
  },
  {
    id: "3",
    name: "Community Fund",
    category: "community",
    creator: "0xjohn1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8",
    members: [
      "0x333abc1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
      "0x444def2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
    ],
    totalSlots: 10,
    contribution: "25 USDT",
    duration: "5 Days",
    currentRound: 1,
    totalRounds: 10,
    nextPayout: "in 5 days",
  },
  {
    id: "4",
    name: "Holiday Savings",
    category: "friends",
    creator: "0xamina5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
    members: ["0x555ghi3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9"],
    totalSlots: 12,
    contribution: "200 USDT",
    duration: "30 Days",
    currentRound: 1,
    totalRounds: 12,
    nextPayout: "in 30 days",
  },
  {
    id: "5",
    name: "Emergency Pool",
    category: "emergency",
    creator: "0xkola7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4",
    members: [
      "0x666jkl4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
      "0x777mno5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
    ],
    totalSlots: 6,
    contribution: "75 USDT",
    duration: "10 Days",
    currentRound: 2,
    totalRounds: 6,
    nextPayout: "in 10 days",
  },
  {
    id: "6",
    name: "Family Rent Pool",
    category: "family",
    creator: "0xngozi8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5",
    members: [
      "0x888pqr6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
      "0x999stu7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3",
      "0xaaavwx8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4",
    ],
    totalSlots: 6,
    contribution: "60 USDT",
    duration: "14 Days",
    currentRound: 1,
    totalRounds: 6,
    nextPayout: "in 14 days",
  },
  {
    id: "7",
    name: "Neighbourhood Builders",
    category: "community",
    creator: "0xsegun9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
    members: [
      "0xbbbyz9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5",
      "0xccc0a1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7",
      "0xddd1b2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8",
      "0xeee2c3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9",
      "0xfff3d4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0",
      "0x1114e5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1",
      "0x2225f6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
    ],
    totalSlots: 8,
    contribution: "30 USDT",
    duration: "7 Days",
    currentRound: 1,
    totalRounds: 8,
    nextPayout: "in 7 days",
  },
  {
    id: "8",
    name: "Small Biz Boost",
    category: "business",
    creator: "0xfemi0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7",
    members: ["0x3336a7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3"],
    totalSlots: 10,
    contribution: "150 USDT",
    duration: "30 Days",
    currentRound: 1,
    totalRounds: 10,
    nextPayout: "in 30 days",
  },
  {
    id: "9",
    name: "Weekend Getaway",
    category: "friends",
    creator: "0xtola1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8",
    members: [
      "0x4447b8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4",
      "0x5558c9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5",
      "0x6669d0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
      "0x777ae1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7",
    ],
    totalSlots: 5,
    contribution: "45 USDT",
    duration: "7 Days",
    currentRound: 1,
    totalRounds: 5,
    nextPayout: "in 7 days",
  },
];

/** Returns circles the current wallet has joined. */
export function getMyCircles(): DiscoverCircle[] {
  return MOCK_CIRCLES.filter((c) => c.members.includes(CURRENT_WALLET));
}

/** Returns circles open for discovery (not yet joined). */
export function getDiscoverCircles(): DiscoverCircle[] {
  return MOCK_CIRCLES.filter((c) => !c.members.includes(CURRENT_WALLET));
}

/** Case-insensitive name search across any circle list. */
export function filterCirclesByQuery(
  circles: DiscoverCircle[],
  query: string
): DiscoverCircle[] {
  const q = query.trim().toLowerCase();
  if (!q) return circles;
  return circles.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.contribution.toLowerCase().includes(q) ||
      c.duration.toLowerCase().includes(q) ||
      (c.category ?? "").toLowerCase().includes(q)
  );
}

/** Truncates a wallet address for display. */
export function truncateAddress(addr: string, head = 8, tail = 6): string {
  if (addr.length <= head + tail + 2) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}
