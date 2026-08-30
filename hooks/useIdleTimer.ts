"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface IdleTimerOptions {
  /** Time in ms before considering user idle (default: 5 minutes) */
  timeout?: number;
  /** Time in ms before showing warning (default: 60 seconds before timeout) */
  warningTime?: number;
  /** Callback when user becomes idle */
  onIdle?: () => void;
  /** Callback when warning should be shown */
  onWarning?: () => void;
  /** Callback when user is active (resets timer) */
  onActive?: () => void;
  /** Initial enabled state (default: false - disabled by default) */
  enabled?: boolean;
}

export interface UseIdleTimerReturn {
  /** Whether the user is currently idle */
  isIdle: boolean;
  /** Whether the warning modal should be shown */
  showWarning: boolean;
  /** Time remaining in seconds until idle */
  timeRemaining: number;
  /** Reset the idle timer manually */
  reset: () => void;
  /** Enable or disable the idle timer */
  setEnabled: (enabled: boolean) => void;
  /** Current timeout duration in minutes */
  timeoutMinutes: number;
  /** Set the timeout duration in minutes */
  setTimeoutMinutes: (minutes: number) => void;
  /** Extend session (dismiss warning, reset timer) */
  extendSession: () => void;
}

/**
 * Custom hook for detecting user idle time and triggering auto-logout.
 * Monitors mouse, keyboard, and touch activity.
 */
export function useIdleTimer(options: IdleTimerOptions = {}): UseIdleTimerReturn {
  const {
    timeout = 5 * 60 * 1000, // 5 minutes default
    warningTime = 60 * 1000, // 60 seconds warning
    onIdle,
    onWarning,
    onActive,
    enabled: initialEnabled = false,
  } = options;

  const [enabled, setEnabled] = useState(initialEnabled);
  const [isIdle, setIsIdle] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeoutMs, setTimeoutMs] = useState(timeout);

  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    warningTimerRef.current = null;
    idleTimerRef.current = null;
    countdownRef.current = null;
  }, []);

  const reset = useCallback(() => {
    if (!enabled) return;
    
    lastActivityRef.current = Date.now();
    setIsIdle(false);
    setShowWarning(false);
    setTimeRemaining(0);
    clearAllTimers();

    // Schedule warning
    warningTimerRef.current = setTimeout(() => {
      const remaining = timeoutMs - warningTime;
      setTimeRemaining(Math.floor(remaining / 1000));
      setShowWarning(true);
      onWarning?.();
    }, timeoutMs - warningTime);

    // Schedule idle
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
      setShowWarning(false);
      onIdle?.();
    }, timeoutMs);

    // Start countdown
    let secondsLeft = Math.floor((timeoutMs - warningTime) / 1000);
    countdownRef.current = setInterval(() => {
      secondsLeft--;
      if (secondsLeft >= 0) {
        setTimeRemaining(secondsLeft);
      }
    }, 1000);
  }, [enabled, timeoutMs, warningTime, onIdle, onWarning, clearAllTimers]);

  const extendSession = useCallback(() => {
    reset();
  }, [reset]);

  // Track user activity
  useEffect(() => {
    if (!enabled) return;

    const handleActivity = () => {
      if (!isIdle) {
        reset();
        onActive?.();
      }
    };

    const events = ["mousedown", "mousemove", "keydown", "touchstart", "scroll"];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, isIdle, reset, onActive]);

  // Initial setup when enabled changes
  useEffect(() => {
    if (enabled) {
      reset();
    } else {
      clearAllTimers();
      setIsIdle(false);
      setShowWarning(false);
      setTimeRemaining(0);
    }

    return clearAllTimers;
  }, [enabled, timeoutMs]);

  return {
    isIdle,
    showWarning,
    timeRemaining,
    reset,
    setEnabled,
    timeoutMinutes: Math.floor(timeoutMs / 60000),
    setTimeoutMinutes: (minutes: number) => setTimeoutMs(minutes * 60000),
    extendSession,
  };
}