import { CURRENT_WALLET } from "@/data/circles";
import type { ContributionRecord } from "@/types/contribution";

/**
 * Normalized contribution events from the user's circles. Replace this mock
 * source with the contribution indexer/API without changing the timeline UI.
 */
export const MOCK_CONTRIBUTIONS = ([
    { id: "contribution-1-1", circleId: "1", circleName: "Family savings", date: "2025-01-15", dueDate: "2025-01-15", round: 1, amount: 50, status: "on-time", transactionHash: `0x${CURRENT_WALLET.slice(2, 12)}1a` },
    { id: "contribution-1-2", circleId: "1", circleName: "Family savings", date: "2025-01-17", dueDate: "2025-01-15", round: 2, amount: 50, status: "late", transactionHash: `0x${CURRENT_WALLET.slice(2, 12)}1b` },
    { id: "contribution-1-3", circleId: "1", circleName: "Family savings", date: "2025-01-29", dueDate: "2025-01-29", round: 3, amount: 50, status: "on-time", transactionHash: `0x${CURRENT_WALLET.slice(2, 12)}1c` },
    { id: "contribution-2-1", circleId: "2", circleName: "School fees", date: "2025-02-03", dueDate: "2025-02-03", round: 1, amount: 40, status: "on-time", transactionHash: `0x${CURRENT_WALLET.slice(2, 12)}2a` },
    { id: "contribution-2-2", circleId: "2", circleName: "School fees", date: "2025-02-15", dueDate: "2025-02-15", round: 2, amount: 40, status: "on-time", transactionHash: `0x${CURRENT_WALLET.slice(2, 12)}2b` },
    { id: "contribution-2-3", circleId: "2", circleName: "School fees", date: "2025-02-28", dueDate: "2025-02-27", round: 3, amount: 40, status: "late", transactionHash: `0x${CURRENT_WALLET.slice(2, 12)}2c` },
    { id: "contribution-2-4", circleId: "2", circleName: "School fees", date: "", dueDate: "2025-03-11", round: 4, amount: 40, status: "missed" },
    { id: "contribution-3-1", circleId: "3", circleName: "Community Fund", date: "2025-03-01", dueDate: "2025-03-01", round: 1, amount: 25, status: "on-time", transactionHash: `0x${CURRENT_WALLET.slice(2, 12)}3a` },
    { id: "contribution-3-2", circleId: "3", circleName: "Community Fund", date: "2025-03-06", dueDate: "2025-03-06", round: 2, amount: 25, status: "on-time", transactionHash: `0x${CURRENT_WALLET.slice(2, 12)}3b` },
    { id: "contribution-6-1", circleId: "6", circleName: "Winter Giving Circle", date: "2025-06-03", dueDate: "2025-06-03", round: 1, amount: 100, status: "on-time", transactionHash: `0x${CURRENT_WALLET.slice(2, 12)}6a` },
    { id: "contribution-6-2", circleId: "6", circleName: "Winter Giving Circle", date: "2025-06-17", dueDate: "2025-06-17", round: 2, amount: 100, status: "on-time", transactionHash: `0x${CURRENT_WALLET.slice(2, 12)}6b` },
    { id: "contribution-6-3", circleId: "6", circleName: "Winter Giving Circle", date: "2025-07-01", dueDate: "2025-07-01", round: 3, amount: 100, status: "on-time", transactionHash: `0x${CURRENT_WALLET.slice(2, 12)}6c` },
] satisfies ContributionRecord[]).sort((a, b) => (b.date || b.dueDate).localeCompare(a.date || a.dueDate));

export const CONTRIBUTION_CIRCLE_OPTIONS = Array.from(
    new Map(MOCK_CONTRIBUTIONS.map((record) => [record.circleId, record.circleName])).entries()
).map(([id, name]) => ({ id, name }));
