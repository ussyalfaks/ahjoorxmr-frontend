/**
 * Mock adapter — serves the existing data/*.ts content through the ApiClient
 * interface. Adds a small simulated latency so loading states are exercised.
 * Swap this file with httpAdapter.ts by setting NEXT_PUBLIC_API_ADAPTER=http.
 */

import type { ApiClient } from "./client";
import { MOCK_CIRCLES } from "@/data/circles";
import { MOCK_CONTRIBUTIONS } from "@/data/contributions";
import { MOCK_PAYOUT_HISTORY } from "@/data/payouts";
import type { Notification } from "@/types/notification";
import { Account, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import { publicEnv } from "@/lib/env";
import type { AuthChallenge, AuthTokenResponse } from "./client";

const SIMULATED_LATENCY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Minimal set of seed notifications for the mock adapter.
const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-mock-1",
    type: "round_complete",
    title: "Round complete",
    description: 'Round 3 of "Family savings" is complete.',
    href: "/dashboard/circles/1",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: "notif-mock-2",
    type: "payout_ready",
    title: "Payout ready",
    description: 'Your payout for "School fees" is ready to claim.',
    href: "/dashboard/payouts",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
  },
];

export const mockAdapter: ApiClient = {
  async getCircles() {
    await delay(SIMULATED_LATENCY_MS);
    return MOCK_CIRCLES;
  },

  async getCircle(id: string) {
    await delay(SIMULATED_LATENCY_MS);
    return MOCK_CIRCLES.find((c) => c.id === id) ?? null;
  },

  async getContributions() {
    await delay(SIMULATED_LATENCY_MS);
    return MOCK_CONTRIBUTIONS;
  },

  async getPayouts() {
    await delay(SIMULATED_LATENCY_MS);
    return MOCK_PAYOUT_HISTORY;
  },

  async getNotifications() {
    await delay(SIMULATED_LATENCY_MS);
    return SEED_NOTIFICATIONS;
  },

  async getAuthChallenge(address: string): Promise<AuthChallenge> {
    const transaction = new TransactionBuilder(new Account(address, "0"), {
      fee: "100",
      networkPassphrase: publicEnv.stellarNetworkPassphrase,
    })
      .addOperation(Operation.manageData({ name: "web_auth_domain", value: "localhost" }))
      .setTimeout(300)
      .build();

    await delay(SIMULATED_LATENCY_MS);
    return { transaction: transaction.toXDR() };
  },

  async exchangeAuthChallenge(transaction: string): Promise<AuthTokenResponse> {
    if (!transaction) throw new Error("A signed challenge transaction is required.");
    await delay(SIMULATED_LATENCY_MS);
    return {
      token: `mock-${crypto.randomUUID()}`,
      expiresIn: 60 * 60,
    };
  },
};
