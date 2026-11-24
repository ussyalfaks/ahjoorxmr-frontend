/**
 * Stellar account (G-address) validation and SEP-2 federation lookups.
 *
 * Mirrors `Federation.Server.resolve` from `@stellar/stellar-sdk`: read the
 * domain's stellar.toml, find its FEDERATION_SERVER, then query it with
 * `type=name`. Implemented with `fetch` (like lib/horizonBalance.ts) so the
 * SDK isn't pulled into the client bundle just for this lookup — swap the body
 * of `resolveFederationAddress` for `Federation.Server.resolve(address)` if
 * the SDK is added as a dependency later.
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
// StrKey version byte for an ed25519 public key ("G...").
const ED25519_PUBLIC_KEY_VERSION = 6 << 3;
const STELLAR_TOML_MAX_BYTES = 100 * 1024;
const FEDERATION_TIMEOUT_MS = 8000;

// SEP-2: `name*domain`. The name part may itself contain "@" (e.g. an email),
// so only "*" and whitespace are excluded from it.
const FEDERATION_RE = /^[^*\s]+\*((?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,})$/i;

function base32Decode(input: string): Uint8Array | null {
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of input) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) return null;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

// CRC16-XModem, as used by StrKey checksums.
function crc16(bytes: Uint8Array): number {
  let crc = 0x0000;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc;
}

/** Strict StrKey check for an ed25519 public key (version byte + checksum). */
export function isValidStellarPublicKey(address: string): boolean {
  if (!/^G[A-Z2-7]{55}$/.test(address)) return false;
  const decoded = base32Decode(address);
  if (!decoded || decoded.length !== 35) return false;
  if (decoded[0] !== ED25519_PUBLIC_KEY_VERSION) return false;
  const payload = decoded.slice(0, 33);
  const checksum = decoded[33] | (decoded[34] << 8);
  return crc16(payload) === checksum;
}

export function isFederationAddress(address: string): boolean {
  return FEDERATION_RE.test(address.trim());
}

/** Lowercases the domain; the name part is case-sensitive per SEP-2. */
export function normalizeFederationAddress(address: string): string {
  const trimmed = address.trim();
  const star = trimmed.lastIndexOf("*");
  return `${trimmed.slice(0, star)}*${trimmed.slice(star + 1).toLowerCase()}`;
}

export function shortenStellarAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-6)}`;
}

export interface FederationRecord {
  stellarAddress: string;
  accountId: string;
  memoType?: string;
  memo?: string;
}

export class FederationError extends Error {}

async function fetchWithTimeout(url: string, signal?: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FEDERATION_TIMEOUT_MS);
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort);
  try {
    return await fetch(url, { signal: controller.signal, headers: { Accept: "application/json, text/plain" } });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

function readFederationServer(toml: string): string | null {
  const match = toml.match(/^\s*FEDERATION_SERVER\s*=\s*["']([^"']+)["']/m);
  return match ? match[1].trim() : null;
}

export async function resolveFederationAddress(address: string, signal?: AbortSignal): Promise<FederationRecord> {
  const normalized = normalizeFederationAddress(address);
  if (!isFederationAddress(normalized)) {
    throw new FederationError("Invalid federation address — use the format name*domain.com");
  }
  const domain = normalized.slice(normalized.lastIndexOf("*") + 1);

  let server: string | null;
  try {
    const res = await fetchWithTimeout(`https://${domain}/.well-known/stellar.toml`, signal);
    if (!res.ok) throw new FederationError(`${domain} has no stellar.toml`);
    const toml = await res.text();
    if (toml.length > STELLAR_TOML_MAX_BYTES) throw new FederationError(`${domain}'s stellar.toml is too large`);
    server = readFederationServer(toml);
  } catch (error) {
    if (signal?.aborted) throw error;
    throw error instanceof FederationError ? error : new FederationError(`Couldn't reach ${domain}`);
  }
  if (!server || !server.startsWith("https://")) {
    throw new FederationError(`${domain} doesn't run a federation server`);
  }

  let body: { account_id?: unknown; stellar_address?: unknown; memo_type?: unknown; memo?: unknown };
  try {
    const url = new URL(server);
    url.searchParams.set("q", normalized);
    url.searchParams.set("type", "name");
    const res = await fetchWithTimeout(url.toString(), signal);
    if (res.status === 404) throw new FederationError(`${normalized} wasn't found`);
    if (!res.ok) throw new FederationError(`Federation server for ${domain} returned an error`);
    body = await res.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    throw error instanceof FederationError ? error : new FederationError(`Couldn't resolve ${normalized}`);
  }

  const accountId = typeof body.account_id === "string" ? body.account_id : "";
  if (!isValidStellarPublicKey(accountId)) {
    throw new FederationError(`${normalized} didn't resolve to a valid Stellar account`);
  }

  return {
    stellarAddress: typeof body.stellar_address === "string" ? body.stellar_address : normalized,
    accountId,
    memoType: typeof body.memo_type === "string" ? body.memo_type : undefined,
    memo: body.memo == null ? undefined : String(body.memo),
  };
}
