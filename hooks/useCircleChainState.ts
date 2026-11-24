"use client";

/**
 * Issue #216 – Read Circle State Directly from Chain (Rounds, Members, Balances).
 *
 * Fetches round number, member list, contribution status and pool balance from the
 * Soroban savings-circle contract via read-only simulateTransaction calls (no signing
 * needed).  Falls back to null data when the RPC is unreachable and surfaces a visible
 * notice to the caller.
 *
 * Results are cached and refreshed after successful contributions or on demand.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchCircleChainState,
  CircleChainState,
  StellarNetwork,
} from "@/lib/contracts/circleContract";

const CACHE_TTL_MS = 30_000; // 30 s

interface Cache {
  data: CircleChainState;
  expiresAt: number;
}

const circleCache = new Map<string, Cache>();

export interface UseCircleChainStateResult {
  data: CircleChainState | null;
  isLoading: boolean;
  isRpcUnreachable: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCircleChainState(
  circleId: string | null | undefined,
  network: StellarNetwork = "testnet"
): UseCircleChainStateResult {
  const [data, setData] = useState<CircleChainState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRpcUnreachable, setIsRpcUnreachable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Avoid stale fetch responses overwriting fresher state
  const fetchIdRef = useRef(0);

  const fetchState = useCallback(
    async (bust = false) => {
      if (!circleId) return;

      const cacheKey = `${network}:${circleId}`;
      if (!bust) {
        const cached = circleCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
          setData(cached.data);
          setIsRpcUnreachable(false);
          return;
        }
      }

      const fetchId = ++fetchIdRef.current;
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchCircleChainState(circleId, network);

        if (fetchId !== fetchIdRef.current) return; // stale

        if (result === null) {
          setIsRpcUnreachable(true);
          setError("RPC unreachable – showing cached / API data");
        } else {
          setData(result);
          setIsRpcUnreachable(false);
          circleCache.set(cacheKey, {
            data: result,
            expiresAt: Date.now() + CACHE_TTL_MS,
          });
        }
      } catch (err) {
        if (fetchId !== fetchIdRef.current) return;
        setIsRpcUnreachable(true);
        setError(
          err instanceof Error ? err.message : "Failed to fetch chain state"
        );
      } finally {
        if (fetchId === fetchIdRef.current) setIsLoading(false);
      }
    },
    [circleId, network]
  );

  // Initial fetch
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const refresh = useCallback(() => fetchState(true), [fetchState]);

  return { data, isLoading, isRpcUnreachable, error, refresh };
}
