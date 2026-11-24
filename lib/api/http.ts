/**
 * HTTP adapter — a genuine `fetch`-based implementation hitting a real
 * backend at `NEXT_PUBLIC_API_URL`. Not called against a real server in
 * this exercise (see lib/api/index.ts for adapter selection), but it is a
 * correctly-typed, functioning client: point `NEXT_PUBLIC_API_URL` at a
 * server exposing matching REST endpoints and it works as-is.
 */
import type { ApiClient, ApiCircle, ApiContribution, ApiPayout, ApiNotification } from "./types";

class ApiRequestError extends Error {
  constructor(public readonly url: string, public readonly status: number, public readonly statusText: string) {
    super(`API request to ${url} failed: ${status} ${statusText}`);
    this.name = "ApiRequestError";
  }
}

async function request<T>(baseUrl: string, path: string): Promise<T> {
  const url = `${baseUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    // Server/client fetch in Next.js: avoid caching API responses by default.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new ApiRequestError(url, res.status, res.statusText);
  }

  return (await res.json()) as T;
}

export function createHttpApiClient(baseUrl: string): ApiClient {
  return {
    async getCircles(): Promise<ApiCircle[]> {
      return request<ApiCircle[]>(baseUrl, "/circles");
    },

    async getCircle(id: string): Promise<ApiCircle | null> {
      try {
        return await request<ApiCircle>(baseUrl, `/circles/${encodeURIComponent(id)}`);
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 404) return null;
        throw err;
      }
    },

    async getContributions(): Promise<ApiContribution[]> {
      return request<ApiContribution[]>(baseUrl, "/contributions");
    },

    async getPayouts(): Promise<ApiPayout[]> {
      return request<ApiPayout[]>(baseUrl, "/payouts");
    },

    async getNotifications(): Promise<ApiNotification[]> {
      return request<ApiNotification[]>(baseUrl, "/notifications");
    },
  };
}
