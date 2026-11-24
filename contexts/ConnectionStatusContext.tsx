"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import {
  CONNECTION_RESTORED_EVENT,
  HEARTBEAT_INTERVAL_MS,
  MAX_RECONNECT_ATTEMPTS_BEFORE_OFFLINE,
  getBackoffDelay,
  pingHeartbeat,
  type ConnectionStatus,
} from "@/lib/connection";

interface ConnectionStatusContextValue {
  status: ConnectionStatus;
  /** Consecutive failed reconnect attempts since the connection dropped. */
  attempt: number;
  /** When the next automatic reconnect attempt is scheduled (ms epoch). */
  nextRetryAt: number | null;
  /** Last time the heartbeat succeeded — data older than this may be stale. */
  lastConnectedAt: number | null;
  /** Increments every time the connection is restored; use as a refresh key. */
  refreshToken: number;
  /** Skip the backoff wait and try to reconnect immediately. */
  reconnectNow: () => void;
}

const ConnectionStatusContext = createContext<ConnectionStatusContextValue | null>(null);

export function ConnectionStatusProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [status, setStatus] = useState<ConnectionStatus>("connected");
  const [attempt, setAttempt] = useState(0);
  const [nextRetryAt, setNextRetryAt] = useState<number | null>(null);
  const [lastConnectedAt, setLastConnectedAt] = useState<number | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const statusRef = useRef<ConnectionStatus>("connected");
  const attemptRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const checkingRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const updateStatus = useCallback((next: ConnectionStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const check = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    clearTimer();
    setNextRetryAt(null);

    const ok = await pingHeartbeat();
    checkingRef.current = false;

    if (ok) {
      const wasDisconnected = statusRef.current !== "connected";
      attemptRef.current = 0;
      setAttempt(0);
      setLastConnectedAt(Date.now());
      updateStatus("connected");

      if (wasDisconnected) {
        setRefreshToken((token) => token + 1);
        router.refresh();
        window.dispatchEvent(new Event(CONNECTION_RESTORED_EVENT));
        showToast({
          title: "Back online",
          message: "Live connection restored. Dashboard data has been refreshed.",
          variant: "success",
        });
      }

      timerRef.current = window.setTimeout(() => void check(), HEARTBEAT_INTERVAL_MS);
      return;
    }

    const wasConnected = statusRef.current === "connected";
    attemptRef.current += 1;
    setAttempt(attemptRef.current);

    const offline =
      navigator.onLine === false || attemptRef.current >= MAX_RECONNECT_ATTEMPTS_BEFORE_OFFLINE;
    updateStatus(offline ? "offline" : "reconnecting");

    if (wasConnected) {
      showToast({
        title: "Connection lost",
        message: "Showing the last data we received — it may be out of date. Reconnecting…",
        variant: "warning",
      });
    }

    const delay = getBackoffDelay(attemptRef.current);
    setNextRetryAt(Date.now() + delay);
    timerRef.current = window.setTimeout(() => void check(), delay);
  }, [router, showToast, updateStatus]);

  const reconnectNow = useCallback(() => {
    void check();
  }, [check]);

  useEffect(() => {
    void check();

    const handleOnline = () => void check();
    const handleOffline = () => {
      // The browser knows we're offline; reflect it right away and let the
      // backoff loop keep probing until the network comes back.
      void check();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void check();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimer();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // Run once on mount; `check` is stable enough for the lifetime of the layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ status, attempt, nextRetryAt, lastConnectedAt, refreshToken, reconnectNow }),
    [status, attempt, nextRetryAt, lastConnectedAt, refreshToken, reconnectNow]
  );

  return (
    <ConnectionStatusContext.Provider value={value}>{children}</ConnectionStatusContext.Provider>
  );
}

export function useConnectionStatus(): ConnectionStatusContextValue {
  const ctx = useContext(ConnectionStatusContext);
  if (!ctx) {
    throw new Error("useConnectionStatus must be used within ConnectionStatusProvider");
  }
  return ctx;
}

/**
 * Returns a token that changes each time the live connection is restored.
 * Add it to effect/memo dependencies (or a `key`) to refetch stale data.
 * Safe to call outside the provider — it just never changes there.
 */
export function useReconnectRefresh(): number {
  return useContext(ConnectionStatusContext)?.refreshToken ?? 0;
}
