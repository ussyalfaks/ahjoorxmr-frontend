import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

const ISSUER = "Ahjoor";

// Auth API isn't available yet — secret/backup-code storage is client-side
// for now (see issue tech notes). Backup codes are hashed before persisting
// so only the one-time reveal ever holds them in plaintext.
const STORAGE_KEY = "ahjoor:2fa";

export interface TwoFactorState {
  enabled: boolean;
  secret: string; // base32, ideally moves server-side once an auth API exists
  backupCodeHashes: string[];
  enabledAt: string;
}

export interface PendingSetup {
  secret: string; // base32
  uri: string; // otpauth:// URI
  qrDataUrl: string;
}

export function getTwoFactorState(): TwoFactorState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TwoFactorState) : null;
  } catch {
    return null;
  }
}

export function isTwoFactorEnabled(): boolean {
  return getTwoFactorState()?.enabled ?? false;
}

function saveState(state: TwoFactorState | null) {
  try {
    if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

export async function startTwoFactorSetup(accountLabel: string): Promise<PendingSetup> {
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: accountLabel || "wallet",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });
  const uri = totp.toString();
  const qrDataUrl = await QRCode.toDataURL(uri, { margin: 1, width: 220 });
  return { secret: secret.base32, uri, qrDataUrl };
}

export function verifyTotpToken(base32Secret: string, token: string): boolean {
  if (!/^\d{6}$/.test(token.trim())) return false;
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(base32Secret),
  });
  return totp.validate({ token: token.trim(), window: 1 }) !== null;
}

function randomBackupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

export function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, randomBackupCode);
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function completeTwoFactorSetup(secret: string, backupCodes: string[]): Promise<void> {
  const backupCodeHashes = await Promise.all(backupCodes.map(sha256Hex));
  saveState({
    enabled: true,
    secret,
    backupCodeHashes,
    enabledAt: new Date().toISOString(),
  });
}

export async function verifyBackupCode(code: string): Promise<boolean> {
  const state = getTwoFactorState();
  if (!state) return false;
  const hash = await sha256Hex(code.trim().toUpperCase());
  return state.backupCodeHashes.includes(hash);
}

export function disableTwoFactor(): void {
  saveState(null);
}
