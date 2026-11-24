"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface DeepLinkParams {
  circleId?: string;
  inviteToken?: string;
  action?: "join" | "view" | "contribute";
}

const DEEP_LINK_KEY = "ahjoor_pending_deep_link";

/**
 * Parses a deep link URL or path into structured params
 */
export function parseDeepLink(url: string): DeepLinkParams {
  const urlObj = new URL(url, typeof window !== "undefined" ? window.location.origin : "");
  const pathParts = urlObj.pathname.split("/").filter(Boolean);
  
  // /circles/[id] or /circle/[id]
  const circleMatch = pathParts.find((part, i) => 
    (part === "circles" || part === "circle") && pathParts[i + 1]
  );
  
  const circleId = circleMatch ? pathParts[pathParts.indexOf(circleMatch) + 1] : undefined;
  const inviteToken = urlObj.searchParams.get("invite") ?? urlObj.searchParams.get("token");
  const action = urlObj.searchParams.get("action") as DeepLinkParams["action"] | null;

  return {
    circleId,
    inviteToken: inviteToken ?? undefined,
    action: action ?? undefined,
  };
}

/**
 * Stores a pending deep link to be processed after auth
 */
export function storePendingDeepLink(params: DeepLinkParams): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DEEP_LINK_KEY, JSON.stringify(params));
  } catch { /* ignore */ }
}

/**
 * Retrieves and clears a pending deep link
 */
export function getPendingDeepLink(): DeepLinkParams | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(DEEP_LINK_KEY);
    if (stored) {
      sessionStorage.removeItem(DEEP_LINK_KEY);
      return JSON.parse(stored) as DeepLinkParams;
    }
  } catch { /* ignore */ }
  return null;
}

/**
 * Hook to handle deep link resolution with auth redirect
 */
export function useDeepLink() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processed = useRef(false);

  const handleDeepLink = useCallback(async (isAuthenticated: boolean) => {
    if (processed.current) return;
    processed.current = true;

    // First check for pending deep link from auth redirect
    const pendingLink = getPendingDeepLink();
    
    // Then check current URL params
    const circleId = searchParams.get("circle");
    const inviteToken = searchParams.get("invite") ?? searchParams.get("token");
    const action = searchParams.get("action") as DeepLinkParams["action"];

    const params = pendingLink || (circleId ? {
      circleId,
      inviteToken: inviteToken ?? undefined,
      action: action ?? undefined,
    } : null);

    if (!params?.circleId) return;

    if (!isAuthenticated) {
      // Store the deep link and redirect to login
      storePendingDeepLink(params);
      router.push(`/login?redirect=/circles/${params.circleId}${params.inviteToken ? `?invite=${params.inviteToken}` : ""}`);
      return;
    }

    // Authenticated - navigate to the circle
    const queryString = new URLSearchParams();
    if (params.inviteToken) queryString.set("invite", params.inviteToken);
    if (params.action) queryString.set("action", params.action);
    
    const query = queryString.toString();
    router.push(`/circles/${params.circleId}${query ? `?${query}` : ""}`);
  }, [router, searchParams]);

  return { handleDeepLink };
}