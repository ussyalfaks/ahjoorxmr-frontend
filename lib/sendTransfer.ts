import type { AddressBookContact } from "@/types/addressBook";

const MAX_STELLAR_TEXT_MEMO_BYTES = 28;
const MAX_STELLAR_MEMO_ID = "18446744073709551615";

export type MemoType = "text" | "id";

export function validateMemo(memo: string, type: MemoType): string | null {
  if (memo.length === 0) return null;

  if (type === "text") {
    return new TextEncoder().encode(memo).length <= MAX_STELLAR_TEXT_MEMO_BYTES
      ? null
      : "Text memos must be 28 bytes or fewer.";
  }

  if (!/^\d+$/.test(memo)) return "ID memos must contain only digits.";
  const normalizedId = memo.replace(/^0+(?=\d)/, "");
  if (
    normalizedId.length > MAX_STELLAR_MEMO_ID.length ||
    (normalizedId.length === MAX_STELLAR_MEMO_ID.length && normalizedId > MAX_STELLAR_MEMO_ID)
  ) {
    return "ID memos must be a valid unsigned 64-bit integer.";
  }
  return null;
}

export function isKnownExchangeAddress(
  address: string,
  contacts: AddressBookContact[],
): boolean {
  const normalizedAddress = address.trim().toLowerCase();
  return contacts.some((contact) => {
    if (contact.address.trim().toLowerCase() !== normalizedAddress) return false;
    return /\b(exchange|binance|coinbase|kraken|bitstamp|bitfinex|kucoin|okx|bybit)\b/i.test(
      `${contact.label} ${contact.note ?? ""}`,
    );
  });
}
