const STORAGE_KEY = "ahjoor_sep10_session";
const AUTH_REQUIRED_EVENT = "stellar-auth-required";

interface StoredAuthToken {
  token: string;
  expiresAt: number | null;
}

let memoryToken: StoredAuthToken | null = null;

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function readToken(): StoredAuthToken | null {
  if (memoryToken) return memoryToken;

  const raw = readStoredToken();
  if (!raw) return null;

  try {
    const stored = JSON.parse(raw) as StoredAuthToken;
    if (typeof stored.token !== "string" || !stored.token) {
      clearAuthToken();
      return null;
    }
    memoryToken = stored;
    return stored;
  } catch {
    clearAuthToken();
    return null;
  }
}

function notifyAuthenticationRequired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
  }
}

export function getAuthToken(): string | null {
  const stored = readToken();
  if (!stored) return null;

  if (stored.expiresAt !== null && stored.expiresAt <= Date.now()) {
    clearAuthToken();
    notifyAuthenticationRequired();
    return null;
  }

  return stored.token;
}

export function storeAuthToken(token: string, expiresAt?: string, expiresIn?: number): void {
  let expiration: number | null = null;
  if (expiresAt) {
    const parsedExpiration = Date.parse(expiresAt);
    if (Number.isFinite(parsedExpiration)) expiration = parsedExpiration;
  } else if (expiresIn !== undefined) {
    expiration = Date.now() + expiresIn * 1000;
  }

  const stored: StoredAuthToken = { token, expiresAt: expiration };
  if (typeof window === "undefined") {
    throw new Error("Unable to securely store the sign-in session in this browser tab.");
  }
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    throw new Error("Unable to securely store the sign-in session in this browser tab.");
  }
  memoryToken = stored;
}

export function clearAuthToken(): void {
  memoryToken = null;
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Session token remains cleared from memory for this page session.
    }
  }
}

export function notifyAuthRequired(): void {
  clearAuthToken();
  notifyAuthenticationRequired();
}

export const authRequiredEventName = AUTH_REQUIRED_EVENT;
