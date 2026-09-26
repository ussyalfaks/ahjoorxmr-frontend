/**
 * Email verification for new signups.
 *
 * There's no auth/email backend yet, so verification is modeled client-side:
 * "sending" an email mints a time-limited mock token and stores it, and
 * "clicking the link" is simulated by visiting /verify-email?token=...
 * Swap sendVerificationEmail's internals for a real API call once one exists.
 */

const STORAGE_KEY = "ahjoor:email-verification";

// Same-tab components need a signal when localStorage changes — the native
// "storage" event only fires in *other* tabs, so we dispatch this ourselves.
export const EMAIL_VERIFICATION_EVENT = "ahjoor:email-verification-changed";

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds between resends
const MAX_RESENDS_PER_WINDOW = 3;
const RESEND_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export interface EmailVerificationState {
  email: string | null;
  verified: boolean;
  pendingToken: string | null;
  tokenExpiresAt: number | null; // epoch ms
  lastSentAt: number | null; // epoch ms
  resendTimestamps: number[]; // epoch ms, recent attempts for rate limiting
}

const DEFAULT_STATE: EmailVerificationState = {
  email: null,
  verified: false,
  pendingToken: null,
  tokenExpiresAt: null,
  lastSentAt: null,
  resendTimestamps: [],
};

export function getEmailVerificationState(): EmailVerificationState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: EmailVerificationState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(EMAIL_VERIFICATION_EVENT));
  } catch {
    // ignore storage errors
  }
}

function generateToken(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, "")
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export interface SendResult {
  ok: boolean;
  reason?: "rate-limited";
  retryAfterMs?: number;
}

/**
 * Registers the email and "sends" the verification email (mints a
 * time-limited token). Used for both the initial signup email and the
 * resend action, so one rate limit covers both entry points.
 */
export function sendVerificationEmail(email: string): SendResult {
  const state = getEmailVerificationState();
  const now = Date.now();

  if (state.lastSentAt && now - state.lastSentAt < RESEND_COOLDOWN_MS) {
    return { ok: false, reason: "rate-limited", retryAfterMs: RESEND_COOLDOWN_MS - (now - state.lastSentAt) };
  }

  const recentAttempts = state.resendTimestamps.filter((ts) => now - ts < RESEND_WINDOW_MS);
  if (recentAttempts.length >= MAX_RESENDS_PER_WINDOW) {
    const oldest = Math.min(...recentAttempts);
    return { ok: false, reason: "rate-limited", retryAfterMs: RESEND_WINDOW_MS - (now - oldest) };
  }

  const token = generateToken();
  saveState({
    ...state,
    email,
    verified: email === state.email ? state.verified : false,
    pendingToken: token,
    tokenExpiresAt: now + TOKEN_TTL_MS,
    lastSentAt: now,
    resendTimestamps: [...recentAttempts, now],
  });

  // Dev/demo helper: with no mail server, log the "email" link so reviewers
  // can grab it. Remove once a real send exists.
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.info(`[dev] Verification link: /verify-email?token=${token}`);
  }

  return { ok: true };
}

export type VerifyResult = "success" | "expired" | "invalid";

export function verifyEmailToken(token: string): VerifyResult {
  const state = getEmailVerificationState();

  if (!state.pendingToken || state.pendingToken !== token) return "invalid";
  if (state.tokenExpiresAt && Date.now() > state.tokenExpiresAt) return "expired";

  saveState({ ...state, verified: true, pendingToken: null, tokenExpiresAt: null });
  return "success";
}

export function getResendCooldownMs(): number {
  const state = getEmailVerificationState();
  if (!state.lastSentAt) return 0;
  return Math.max(RESEND_COOLDOWN_MS - (Date.now() - state.lastSentAt), 0);
}

/** Dev-only: exposes the link that would otherwise be emailed, for local
 * testing without a mail server. Never surfaced in production. */
export function getDevVerificationLink(): string | null {
  if (process.env.NODE_ENV === "production") return null;
  const state = getEmailVerificationState();
  return state.pendingToken ? `/verify-email?token=${state.pendingToken}` : null;
}