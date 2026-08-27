/**
 * Shared payout mock data.
 * Imported by both the payout history page and the per-receipt page.
 * Replace with an API/contract call when a backend is available.
 */

export type PayoutStatus = "completed" | "pending";

export interface PayoutRecord {
  transaction_hash: string;
  circle_name: string;
  /** Numeric amount, e.g. 50 */
  amount: number;
  token_symbol: string;
  payout_date: string; // ISO-8601
  round_number: number;
  status: PayoutStatus;
  /** Mock wallet address of the recipient */
  recipient: string;
}

export const MOCK_PAYOUT_HISTORY: PayoutRecord[] = [
  {
    transaction_hash: "0x8f41a8dd0a13cc9c5f8d25c8e2f2f2a34e1d0b4f0a5a9d6c7b8c9d0e1f2a3b4c",
    circle_name: "Family Growth",
    amount: 50,
    token_symbol: "USDT",
    payout_date: "2026-07-25T16:20:00Z",
    round_number: 3,
    status: "completed",
    recipient: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b",
  },
  {
    transaction_hash: "0x4c2f19ab31d8f4e5c9b0d7a23e1f4a8b6c5d4e3f2a1b09876543210fedcba98",
    circle_name: "School Fees",
    amount: 120,
    token_symbol: "USDC",
    payout_date: "2026-07-22T10:05:00Z",
    round_number: 2,
    status: "completed",
    recipient: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b",
  },
  {
    transaction_hash: "0x19d3b7f5a8c1e2d4f6b7a9c0d1e3f4a5b6c7d8e9f0a1234567890abcdef1234",
    circle_name: "Car Repairs",
    amount: 75,
    token_symbol: "STRK",
    payout_date: "2026-07-18T08:45:00Z",
    round_number: 1,
    status: "completed",
    recipient: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b",
  },
  {
    transaction_hash: "0x7b6a5d4c3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3210ab9cd8ef7654",
    circle_name: "Wedding Fund",
    amount: 200,
    token_symbol: "USDT",
    payout_date: "2026-07-10T14:00:00Z",
    round_number: 4,
    status: "completed",
    recipient: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b",
  },
  {
    transaction_hash: "0x2d4f6b8a1c3e5f7a9d0b2c4e6f8a1d3c5e7f9b0a2c4e6f8a1d3c5e7f9b0a2c4",
    circle_name: "Community Project",
    amount: 35,
    token_symbol: "USDC",
    payout_date: "2026-07-02T11:30:00Z",
    round_number: 2,
    status: "pending",
    recipient: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b",
  },
  {
    transaction_hash: "0x6e5d4c3b2a1908f7e6d5c4b3a291807f6e5d4c3b2a1908f7e6d5c4b3a291807",
    circle_name: "Savings Challenge",
    amount: 90,
    token_symbol: "USDT",
    payout_date: "2026-06-28T09:15:00Z",
    round_number: 5,
    status: "completed",
    recipient: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b",
  },
  {
    transaction_hash: "0x9a8b7c6d5e4f3210ab9cd8ef7654c3b2a1908f7e6d5c4b3a291807f6e5d4c3b",
    circle_name: "Travel Fund",
    amount: 150,
    token_symbol: "STRK",
    payout_date: "2026-06-19T07:55:00Z",
    round_number: 1,
    status: "completed",
    recipient: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b",
  },
  {
    transaction_hash: "0x3c5e7f9b0a2c4e6f8a1d3c5e7f9b0a2c4e6f8a1d3c5e7f9b0a2c4e6f8a1d3c",
    circle_name: "Emergency Fund",
    amount: 60,
    token_symbol: "USDC",
    payout_date: "2026-06-11T18:40:00Z",
    round_number: 6,
    status: "pending",
    recipient: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b",
  },
];

export function findPayoutByHash(txHash: string): PayoutRecord | undefined {
  return MOCK_PAYOUT_HISTORY.find(
    (p) => p.transaction_hash.toLowerCase() === txHash.toLowerCase()
  );
}

export function formatPayoutAmount(amount: number, tokenSymbol: string): string {
  return `${amount.toLocaleString("en-US")} ${tokenSymbol}`;
}

export function formatPayoutDate(dateValue: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(dateValue));
}
