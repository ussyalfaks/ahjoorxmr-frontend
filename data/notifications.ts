/**
 * Shared notification mock data.
 * Used by the notifications page and by the typed API client's mock adapter
 * (see lib/api). Replace with a real notifications API/indexer when available.
 */
import type { Notification } from "@/types/notification";

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "your_turn",
    title: "It's Your Turn",
    description: "You're next to receive the payout in Family Savings circle.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    href: "/dashboard",
    read: false,
  },
  {
    id: "2",
    type: "round_complete",
    title: "Round Completed",
    description: "Round 2 of School Fees circle has been completed.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    href: "/dashboard",
    read: false,
  },
  {
    id: "3",
    type: "payout_ready",
    title: "Payout Ready",
    description: "Your payout of 200 USDT is ready to claim.",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    href: "/dashboard",
    read: false,
  },
  {
    id: "4",
    type: "missed_contribution",
    title: "Missed Contribution",
    description: "A member missed their contribution in Community Fund.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    href: "/dashboard/circles",
    read: true,
  },
  {
    id: "5",
    type: "payout_ready",
    title: "Payout Ready",
    description: "Your payout of 150 USDC is ready to claim from Wedding Fund.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    href: "/dashboard",
    read: true,
  },
  {
    id: "6",
    type: "round_complete",
    title: "Round Completed",
    description: "Round 1 of Car Repairs circle has been completed.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    href: "/dashboard",
    read: true,
  },
  {
    id: "7",
    type: "missed_contribution",
    title: "Missed Contribution",
    description: "Emeka missed their contribution in Family Savings.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    href: "/dashboard/circles",
    read: true,
  },
  {
    id: "8",
    type: "your_turn",
    title: "It's Your Turn",
    description: "You're next to receive the payout in Travel Fund circle.",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    href: "/dashboard",
    read: true,
  },
  {
    id: "9",
    type: "payout_ready",
    title: "Payout Ready",
    description: "Your payout of 75 STRK is ready to claim.",
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    href: "/dashboard",
    read: true,
  },
  {
    id: "10",
    type: "round_complete",
    title: "Round Completed",
    description: "Round 3 of Savings Challenge circle has been completed.",
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    href: "/dashboard",
    read: true,
  },
];
