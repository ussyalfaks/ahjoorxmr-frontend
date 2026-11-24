/**
 * Shared locked-funds mock data.
 * Used by the Locked Funds page and the Balance Breakdown widget so both
 * always reflect the same underlying values.
 * Replace with an API/contract call when a backend is available.
 */

export interface LockedFund {
  id: string;
  name: string;
  amount: number;
  token: string;
  lockedUntil: string;
}

export const MOCK_LOCKED_FUNDS: LockedFund[] = [
  { id: "1", name: "Annual Savings", amount: 2000, token: "USDT", lockedUntil: "25 January, 2026" },
  { id: "2", name: "Just For Fun", amount: 500, token: "USDC", lockedUntil: "25 January, 2026" },
  { id: "3", name: "Summer Savings", amount: 500, token: "STRK", lockedUntil: "25 January, 2026" },
];

export function getTotalLocked(): number {
  return MOCK_LOCKED_FUNDS.reduce((sum, fund) => sum + fund.amount, 0);
}