/**
 * HTTP adapter — talks to a real backend.
 * Driven by NEXT_PUBLIC_API_URL; activated by NEXT_PUBLIC_API_ADAPTER=http.
 */

import type { ApiClient } from "./client";
import type { DiscoverCircle } from "@/data/circles";
import type { ContributionRecord } from "@/types/contribution";
import type { PayoutRecord } from "@/data/payouts";
import type { Notification } from "@/types/notification";
import { publicEnv } from "@/lib/env";
import { getAuthToken, notifyAuthRequired } from "./authToken";
import type { AuthChallenge, AuthTokenResponse } from "./client";

const BASE_URL = publicEnv.apiUrl ?? "";

async function request<T>(
  path: string,
  init?: RequestInit,
  options: { includeAuth?: boolean } = {}
): Promise<T> {
  const token = options.includeAuth === false ? null : getAuthToken();
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 401 && token) notifyAuthRequired();
    throw new Error(`API error ${res.status} for ${path}`);
  }
  return res.json() as Promise<T>;
}

export const httpAdapter: ApiClient = {
  getCircles() {
    return request<DiscoverCircle[]>("/api/circles");
  },

  getCircle(id: string) {
    return request<DiscoverCircle | null>(`/api/circles/${encodeURIComponent(id)}`);
  },

  getContributions() {
    return request<ContributionRecord[]>("/api/contributions");
  },

  getPayouts() {
    return request<PayoutRecord[]>("/api/payouts");
  },

  getNotifications() {
    return request<Notification[]>("/api/notifications");
  },

  getAuthChallenge(address: string) {
    return request<AuthChallenge>(
      `/auth?account=${encodeURIComponent(address)}`,
      undefined,
      { includeAuth: false }
    );
  },

  exchangeAuthChallenge(transaction: string) {
    return request<AuthTokenResponse>("/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction }),
    }, { includeAuth: false });
  },
};
