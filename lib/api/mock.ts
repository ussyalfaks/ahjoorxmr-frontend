/**
 * Mock adapter — serves the existing `data/*.ts` content behind the same
 * typed interface the HTTP adapter implements, with a small simulated
 * network latency so loading states in callers (skeletons, spinners) are
 * actually exercised in local/demo usage.
 */
import { MOCK_CIRCLES } from "@/data/circles";
import { MOCK_CONTRIBUTIONS } from "@/data/contributions";
import { MOCK_PAYOUT_HISTORY } from "@/data/payouts";
import { MOCK_NOTIFICATIONS } from "@/data/notifications";
import type { ApiClient, ApiCircle, ApiContribution, ApiPayout, ApiNotification } from "./types";

const MOCK_LATENCY_MS = 350;

function delay<T>(value: T, ms: number = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const mockApiClient: ApiClient = {
  async getCircles(): Promise<ApiCircle[]> {
    return delay([...MOCK_CIRCLES]);
  },

  async getCircle(id: string): Promise<ApiCircle | null> {
    const circle = MOCK_CIRCLES.find((c) => c.id === id) ?? null;
    return delay(circle);
  },

  async getContributions(): Promise<ApiContribution[]> {
    return delay([...MOCK_CONTRIBUTIONS]);
  },

  async getPayouts(): Promise<ApiPayout[]> {
    return delay([...MOCK_PAYOUT_HISTORY]);
  },

  async getNotifications(): Promise<ApiNotification[]> {
    return delay([...MOCK_NOTIFICATIONS]);
  },
};
