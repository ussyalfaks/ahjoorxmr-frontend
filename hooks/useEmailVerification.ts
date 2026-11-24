"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EMAIL_VERIFICATION_EVENT,
  type EmailVerificationState,
  getDevVerificationLink,
  getEmailVerificationState,
  getResendCooldownMs,
  sendVerificationEmail,
} from "@/lib/emailVerification";

/**
 * Reactive view of email verification status. Syncs across every component
 * instance (same tab via a custom event, other tabs via the native "storage"
 * event) so the persistent banner, the circles-page gate, and settings all
 * stay consistent — mirrors the useBookmarks pattern.
 */
export function useEmailVerification() {
  const [state, setState] = useState<EmailVerificationState>(getEmailVerificationState());
  const [devLink, setDevLink] = useState<string | null>(null);
  const [cooldownMs, setCooldownMs] = useState(0);

  useEffect(() => {
    const sync = () => {
      setState(getEmailVerificationState());
      setDevLink(getDevVerificationLink());
    };
    sync();
    window.addEventListener(EMAIL_VERIFICATION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EMAIL_VERIFICATION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Tick the cooldown down every second so "Resend" re-enables itself
  // without the user needing to trigger another render.
  useEffect(() => {
    setCooldownMs(getResendCooldownMs());
    const interval = setInterval(() => setCooldownMs(getResendCooldownMs()), 1000);
    return () => clearInterval(interval);
  }, [state.lastSentAt]);

  const sendOrResend = useCallback((email: string) => {
    const result = sendVerificationEmail(email);
    setState(getEmailVerificationState());
    setDevLink(getDevVerificationLink());
    return result;
  }, []);

  return {
    email: state.email,
    isVerified: state.verified,
    cooldownMs,
    sendOrResend,
    devVerificationLink: devLink,
  };
}