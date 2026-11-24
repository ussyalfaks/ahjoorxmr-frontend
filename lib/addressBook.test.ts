import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import {
  exportAddressBookToCsv,
  parseAddressBookCsv,
  previewAddressBookImport,
  applyAddressBookImport,
} from "./addressBook.ts";
import type { AddressBookContact } from "../types/addressBook.d.ts";

// Sample valid Stellar public keys
const VALID_STELLAR_1 = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const VALID_STELLAR_2 = "GAYOLLLVPWNOYAK2ALVR7W3WEM22M2R2OG2V22B32M2Y222222222222";
const INVALID_ADDRESS_1 = "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b";
const INVALID_ADDRESS_2 = "not-a-valid-stellar-key";

describe("addressBook CSV import/export", () => {
  const existingContacts: AddressBookContact[] = [
    {
      id: "contact-1",
      label: "Emeka Existing",
      address: VALID_STELLAR_1,
      note: "Old Note",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ];

  describe("exportAddressBookToCsv", () => {
    it("exports contacts to CSV format with headers and escaping", () => {
      const csv = exportAddressBookToCsv(existingContacts);
      assert.ok(csv.includes("Label,Address,Note,CreatedAt"));
      assert.ok(csv.includes("Emeka Existing"));
      assert.ok(csv.includes(VALID_STELLAR_1));
      assert.ok(csv.includes("Old Note"));
    });

    it("escapes fields with commas, quotes, and prevents formula injection", () => {
      const trickyContacts: AddressBookContact[] = [
        {
          id: "contact-2",
          label: 'John, "The Boss"',
          address: VALID_STELLAR_2,
          note: "=SUM(A1:A10)",
          createdAt: "2026-01-01",
        },
      ];
      const csv = exportAddressBookToCsv(trickyContacts);
      assert.ok(csv.includes('"John, ""The Boss"""'));
      assert.ok(csv.includes("'=SUM(A1:A10)"));
    });
  });

  describe("parseAddressBookCsv", () => {
    it("parses CSV with headers", () => {
      const input = `Label,Address,Note\nAlice,${VALID_STELLAR_1},Co-organizer\nBob,${VALID_STELLAR_2},Friend`;
      const parsed = parseAddressBookCsv(input);
      assert.strictEqual(parsed.length, 2);
      assert.strictEqual(parsed[0].label, "Alice");
      assert.strictEqual(parsed[0].address, VALID_STELLAR_1);
      assert.strictEqual(parsed[0].note, "Co-organizer");
      assert.strictEqual(parsed[1].label, "Bob");
      assert.strictEqual(parsed[1].address, VALID_STELLAR_2);
    });

    it("parses CSV without headers", () => {
      const input = `Carol,${VALID_STELLAR_1},Work\nDave,${VALID_STELLAR_2},Family`;
      const parsed = parseAddressBookCsv(input);
      assert.strictEqual(parsed.length, 2);
      assert.strictEqual(parsed[0].label, "Carol");
    });

    it("handles empty and malformed CSV", () => {
      assert.strictEqual(parseAddressBookCsv("").length, 0);
      assert.strictEqual(parseAddressBookCsv("   \n  \n").length, 0);
    });
  });

  describe("previewAddressBookImport", () => {
    it("reports invalid Stellar addresses, detects duplicates, and marks valid new contacts", () => {
      const rawCandidates = [
        // 1. Valid new contact
        { label: "New Member", address: VALID_STELLAR_2, note: "New note" },
        // 2. Duplicate contact (matches VALID_STELLAR_1 in existingContacts)
        { label: "Emeka Updated", address: VALID_STELLAR_1, note: "Updated Note" },
        // 3. Invalid address
        { label: "Bad Contact", address: INVALID_ADDRESS_1, note: "Should be skipped" },
        // 4. Another invalid address
        { label: "Malformed", address: INVALID_ADDRESS_2 },
      ];

      const preview = previewAddressBookImport(rawCandidates, existingContacts);

      assert.strictEqual(preview.totalCount, 4);
      assert.strictEqual(preview.toAddCount, 1);
      assert.strictEqual(preview.toMergeCount, 1);
      assert.strictEqual(preview.skippedCount, 2);

      // Check row details
      assert.strictEqual(preview.rows[0].status, "valid");
      assert.strictEqual(preview.rows[1].status, "duplicate");
      assert.ok(preview.rows[1].reason.includes("merged"));
      assert.strictEqual(preview.rows[2].status, "invalid");
      assert.ok(preview.rows[2].reason.includes("Invalid Stellar address"));
      assert.strictEqual(preview.rows[3].status, "invalid");
    });
  });

  describe("applyAddressBookImport", () => {
    it("merges duplicate contacts, skips invalid addresses, and adds new contacts", () => {
      const rawCandidates = [
        { label: "New Member", address: VALID_STELLAR_2, note: "New note" },
        { label: "Emeka Merged", address: VALID_STELLAR_1, note: "Merged note" },
        { label: "Invalid One", address: INVALID_ADDRESS_1 },
      ];

      const preview = previewAddressBookImport(rawCandidates, existingContacts);
      const result = applyAddressBookImport(preview, existingContacts);

      assert.strictEqual(result.added, 1);
      assert.strictEqual(result.merged, 1);
      assert.strictEqual(result.skipped, 1);
      assert.strictEqual(result.contacts.length, 2);

      // Check that existing contact details were merged
      const mergedContact = result.contacts.find((c) => c.address === VALID_STELLAR_1);
      assert.ok(mergedContact);
      assert.strictEqual(mergedContact.label, "Emeka Merged");
      assert.strictEqual(mergedContact.note, "Merged note");

      // Check that new contact was added
      const newContact = result.contacts.find((c) => c.address === VALID_STELLAR_2);
      assert.ok(newContact);
      assert.strictEqual(newContact.label, "New Member");
    });
  });
});
