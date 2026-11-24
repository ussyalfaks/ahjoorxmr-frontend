/**
 * Typed API client layer.
 *
 * Replaces direct `data/*.ts` imports in pages/components with a stable,
 * typed function surface backed by one of two adapters:
 *
 *  - the mock adapter (lib/api/mock.ts), serving the existing mock data
 *    with a small simulated network delay — used whenever
 *    `NEXT_PUBLIC_API_URL` is unset;
 *  - the HTTP adapter (lib/api/http.ts), a real `fetch` client against
 *    `${NEXT_PUBLIC_API_URL}/...` — used whenever that env var is set.
 *
 * `NEXT_PUBLIC_*` env vars are inlined by Next.js at build time into both
 * server and client bundles, so this check works identically in Server
 * Components, Client Components, and Route Handlers — there is no need to
 * special-case server vs. client here.
 */
import { mockApiClient } from "./mock";
import { createHttpApiClient } from "./http";
import type { ApiClient, ApiCircle, ApiContribution, ApiPayout, ApiNotification } from "./types";
import { publicEnv } from "@/lib/env";

const API_URL = publicEnv.apiUrl;

const client: ApiClient = API_URL ? createHttpApiClient(API_URL) : mockApiClient;

export function getCircles(): Promise<ApiCircle[]> {
  return client.getCircles();
}

export function getCircle(id: string): Promise<ApiCircle | null> {
  return client.getCircle(id);
}

export function getContributions(): Promise<ApiContribution[]> {
  return client.getContributions();
}

export function getPayouts(): Promise<ApiPayout[]> {
  return client.getPayouts();
}

export function getNotifications(): Promise<ApiNotification[]> {
  return client.getNotifications();
}

export type { ApiCircle, ApiContribution, ApiPayout, ApiNotification, ApiClient } from "./types";
