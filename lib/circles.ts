export const CIRCLE_CATEGORIES = [
  "family",
  "friends",
  "work",
  "community",
  "students",
] as const;

export type CircleCategory = (typeof CIRCLE_CATEGORIES)[number];

export interface Circle {
  id: string;
  name: string;
  creator: string;
  members: string[];
  totalSlots: number;
  contribution: string;
  duration: string;
  category: CircleCategory;
  status: "active" | "completed" | "pending";
  totalSaved?: string;
  completedAt?: string;
}

export const CATEGORY_LABELS: Record<CircleCategory, string> = {
  family: "Family",
  friends: "Friends",
  work: "Work",
  community: "Community",
  students: "Students",
};

export const mockCircles: Circle[] = [
  {
    id: "1",
    name: "Family savings",
    creator: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f",
    members: ["0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b", "0x111abc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8"],
    totalSlots: 5,
    contribution: "50 USDT",
    duration: "2 Days",
    category: "family",
    status: "active",
  },
  {
    id: "2",
    name: "School fees",
    creator: "0xemmanuel9c3d5e7f1a2b4c6d8e0f2a3b5c7d9e1",
    members: ["0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b", "0x222def3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9"],
    totalSlots: 6,
    contribution: "40 USDT",
    duration: "12 Days",
    category: "students",
    status: "active",
  },
  {
    id: "3",
    name: "Community Fund",
    creator: "0xjohn1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8",
    members: ["0x333abc1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7", "0x444def2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8"],
    totalSlots: 10,
    contribution: "25 USDT",
    duration: "5 Days",
    category: "community",
    status: "active",
  },
  {
    id: "4",
    name: "Holiday Savings",
    creator: "0xamina5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
    members: ["0x555ghi3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9"],
    totalSlots: 12,
    contribution: "200 USDT",
    duration: "30 Days",
    category: "friends",
    status: "active",
  },
  {
    id: "5",
    name: "Emergency Pool",
    creator: "0xkola7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4",
    members: [
      "0x666jkl4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
      "0x777mno5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
    ],
    totalSlots: 6,
    contribution: "75 USDT",
    duration: "10 Days",
    category: "family",
    status: "active",
  },
  {
    id: "6",
    name: "Winter Giving Circle",
    creator: "0xarchive8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
    members: [
      "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b",
      "0x888archive2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8",
      "0x999archive3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9",
    ],
    totalSlots: 3,
    contribution: "100 USDT",
    duration: "14 Days",
    category: "community",
    status: "completed",
    totalSaved: "1,800 USDT",
    completedAt: "Aug 12, 2025",
  },
];
