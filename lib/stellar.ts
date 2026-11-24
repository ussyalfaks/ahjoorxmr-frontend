let StrKeySdk: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sdk = require("@stellar/stellar-sdk");
  StrKeySdk = sdk?.StrKey || sdk;
} catch {
  // Fall back to Stellar Base32 specification when SDK is unavailable
}

export const INVALID_STELLAR_ADDRESS_MESSAGE = "Enter a valid Stellar address (starts with G or M).";

/**
 * Validate a Stellar address.
 *
 * By default only Ed25519 public keys (G...) are accepted. Pass
 * `{ allowMuxed: true }` to also accept muxed accounts (M...).
 */
export function isValidStellarAddress(
  address: string | null | undefined,
  options: { allowMuxed?: boolean } = {}
): boolean {
  if (!address) return false;
  const trimmed = address.trim();
  if (!trimmed) return false;

  try {
    if (StrKeySdk) {
      if (StrKeySdk.isValidEd25519PublicKey(trimmed)) return true;
      if (options.allowMuxed && StrKeySdk.isValidMed25519PublicKey(trimmed)) return true;
      return false;
    }
  } catch {
    // fallback
  }

  // Fallback Stellar address validation according to Stellar SEP-0023 / StrKey spec:
  // - Ed25519 Public Key: 56 chars, begins with 'G', RFC 4648 Base32 alphabet (A-Z, 2-7)
  // - Med25519 Muxed Account: 69 chars, begins with 'M', RFC 4648 Base32 alphabet (A-Z, 2-7)
  if (/^G[A-Z2-7]{55}$/.test(trimmed)) return true;
  if (options.allowMuxed && /^M[A-Z2-7]{68}$/.test(trimmed)) return true;
  return false;
}
