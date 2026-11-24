/**
 * Payout record type. The shape originates from data/payouts.ts (the mock
 * payout history source) — re-exported here so `lib/api` and callers can
 * import the response type from `types/` like the rest of the domain
 * types, without duplicating the definition.
 */
export type { PayoutRecord, PayoutStatus } from "@/data/payouts";
