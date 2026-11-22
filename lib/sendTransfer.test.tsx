import { describe, expect, it } from "vitest";
import { isKnownExchangeAddress, validateMemo } from "@/lib/sendTransfer";
import type { AddressBookContact } from "@/types/addressBook";

describe("validateMemo", () => {
  it("allows an empty optional memo", () => {
    expect(validateMemo("", "text")).toBeNull();
    expect(validateMemo("", "id")).toBeNull();
  });

  it("limits text memos by UTF-8 bytes", () => {
    expect(validateMemo("a".repeat(28), "text")).toBeNull();
    expect(validateMemo("a".repeat(29), "text")).not.toBeNull();
    expect(validateMemo("é".repeat(14), "text")).toBeNull();
    expect(validateMemo("é".repeat(15), "text")).not.toBeNull();
  });

  it("accepts only unsigned 64-bit integer ID memos", () => {
    expect(validateMemo("18446744073709551615", "id")).toBeNull();
    expect(validateMemo("18446744073709551616", "id")).not.toBeNull();
    expect(validateMemo("00000000000000000001", "id")).toBeNull();
    expect(validateMemo("12x", "id")).not.toBeNull();
  });
});

describe("isKnownExchangeAddress", () => {
  const contacts: AddressBookContact[] = [
    { id: "1", label: "Coinbase", address: "GEXCHANGE", createdAt: "" },
    { id: "2", label: "Friend", address: "GFRIEND", createdAt: "" },
  ];

  it("matches saved exchange contacts case-insensitively", () => {
    expect(isKnownExchangeAddress("gexchange", contacts)).toBe(true);
    expect(isKnownExchangeAddress("GFRIEND", contacts)).toBe(false);
    expect(isKnownExchangeAddress("GUNKNOWN", contacts)).toBe(false);
  });
});
