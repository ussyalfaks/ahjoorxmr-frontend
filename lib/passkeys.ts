import { safeStorage } from "@/lib/safeStorage";
const STORAGE_KEY = "ahjoor:passkeys";

export interface StoredPasskey {
  id: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt: string | null;
}

function toBase64Url(value: ArrayBuffer): string {
  const bytes = new Uint8Array(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function readPasskeys(): StoredPasskey[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPasskey[]) : [];
  } catch {
    return [];
  }
}

function writePasskeys(passkeys: StoredPasskey[]) {
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(passkeys));
  } catch {
    // Ignore storage errors; the browser credential remains available.
  }
}

export function getPasskeys(): StoredPasskey[] {
  return readPasskeys();
}

export function isPasskeySupported(): boolean {
  return typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    typeof navigator.credentials?.create === "function" &&
    typeof navigator.credentials?.get === "function";
}

function getPasskeyError(error: unknown, action: "registration" | "sign-in"): string {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return action === "registration"
      ? "Passkey setup was canceled or timed out. Try again when you are ready."
      : "Passkey sign-in was canceled or timed out. Choose another sign-in method to continue.";
  }
  if (error instanceof DOMException && error.name === "InvalidStateError") {
    return "This device already has a passkey registered for this account.";
  }
  return action === "registration"
    ? "We could not register a passkey on this device. Try another device or sign-in method."
    : "We could not authenticate this passkey. Try another passkey or sign-in method.";
}

export async function registerPasskey(deviceName: string): Promise<StoredPasskey> {
  if (!isPasskeySupported()) {
    throw new Error("This browser or device does not support passkeys. Use a wallet to sign in instead.");
  }

  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: randomBytes(32),
        rp: { name: "Ahjoor", id: window.location.hostname },
        user: {
          id: randomBytes(16),
          name: "wallet-account",
          displayName: "Ahjoor wallet account",
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "preferred",
        },
        timeout: 60000,
        attestation: "none",
      },
    }) as PublicKeyCredential | null;

    if (!credential) throw new Error("Passkey registration returned no credential.");

    const passkey: StoredPasskey = {
      id: toBase64Url(credential.rawId),
      deviceName: deviceName.trim() || "This device",
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    };
    writePasskeys([...readPasskeys().filter((item) => item.id !== passkey.id), passkey]);
    return passkey;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Passkey registration returned")) throw error;
    throw new Error(getPasskeyError(error, "registration"));
  }
}

export async function authenticateWithPasskey(): Promise<StoredPasskey> {
  if (!isPasskeySupported()) {
    throw new Error("Passkeys are not supported in this browser or device. Choose a wallet to sign in.");
  }

  const stored = readPasskeys();
  if (stored.length === 0) {
    throw new Error("No passkey is registered for this account yet. Add one from Security & Sessions first.");
  }

  try {
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32),
        rpId: window.location.hostname,
        allowCredentials: stored.map((passkey) => ({
          id: fromBase64Url(passkey.id),
          type: "public-key" as const,
          transports: ["internal", "hybrid"] as AuthenticatorTransport[],
        })),
        userVerification: "preferred",
        timeout: 60000,
      },
    }) as PublicKeyCredential | null;

    if (!credential) throw new Error("Passkey authentication returned no credential.");

    const id = toBase64Url(credential.rawId);
    const matched = stored.find((passkey) => passkey.id === id) ?? stored[0];
    const updated = { ...matched, lastUsedAt: new Date().toISOString() };
    writePasskeys(stored.map((passkey) => passkey.id === matched.id ? updated : passkey));
    return updated;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Passkey authentication returned")) throw error;
    throw new Error(getPasskeyError(error, "sign-in"));
  }
}

export function removePasskey(id: string): void {
  writePasskeys(readPasskeys().filter((passkey) => passkey.id !== id));
}
