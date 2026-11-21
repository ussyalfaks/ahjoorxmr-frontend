/**
 * Typed API client layer.
 *
 * Chooses between a mock adapter (default) and an HTTP adapter based on the
 * NEXT_PUBLIC_API_ADAPTER environment variable. Set it to "http" and provide
 * NEXT_PUBLIC_API_URL to point at a live backend.
 */

import type { DiscoverCircle } from "@/data/circles";
import type { ContributionRecord } from "@/types/contribution";
import type { PayoutRecord } from "@/data/payouts";
import type { Notification } from "@/types/notification";
import { mockAdapter } from "./mockAdapter";
import { httpAdapter } from "./httpAdapter";
import { publicEnv } from "@/lib/env";

export type CircleDetail = DiscoverCircle;

export interface AuthChallenge {
  transaction: string;
}

export interface AuthTokenResponse {
  token: string;
  expiresAt?: string;
  expiresIn?: number;
}

export interface ApiClient {
  getCircles(): Promise<DiscoverCircle[]>;
  getCircle(id: string): Promise<DiscoverCircle | null>;
  getContributions(): Promise<ContributionRecord[]>;
  getPayouts(): Promise<PayoutRecord[]>;
  getNotifications(): Promise<Notification[]>;
  getAuthChallenge(address: string): Promise<AuthChallenge>;
  exchangeAuthChallenge(transaction: string): Promise<AuthTokenResponse>;
}

function resolveAdapter(): ApiClient {
  return publicEnv.apiAdapter === "http" ? httpAdapter : mockAdapter;
}

export const apiClient: ApiClient = resolveAdapter();
