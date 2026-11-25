import { safeStorage } from "@/lib/safeStorage";
import { isValidStellarAddress } from "@/lib/stellar";
import type { AddressBookContact } from "@/types/addressBook";

// Client-side only for now (see issue tech notes) — swap for a profile/user
// API call once the backend exposes one, keeping this same read/write shape.
const STORAGE_KEY = "ahjoor:address-book";

export function getContacts(): AddressBookContact[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveContacts(contacts: AddressBookContact[]): void {
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch {
    // ignore storage errors
  }
}

/**
 * Loose format check — mock wallet addresses in this app aren't real hex
 * (e.g. "0x23g43g…"), so this validates shape (0x-prefixed, sane length)
 * rather than a strict hex/checksum rule.
 */
export function isValidAddressFormat(address: string): boolean {
  return /^0x[a-zA-Z0-9]{6,64}$/.test(address.trim());
}

export function isDuplicateAddress(address: string, contacts: AddressBookContact[], excludeId?: string): boolean {
  const normalized = address.trim().toLowerCase();
  return contacts.some(
    (contact) => contact.id !== excludeId && contact.address.trim().toLowerCase() === normalized
  );
}

export function addContact(input: { label: string; address: string; note?: string }): AddressBookContact {
  const contacts = getContacts();
  const contact: AddressBookContact = {
    id: `contact-${Date.now()}`,
    label: input.label.trim(),
    address: input.address.trim(),
    note: input.note?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  saveContacts([...contacts, contact]);
  return contact;
}

export function updateContact(id: string, input: { label: string; address: string; note?: string }): AddressBookContact[] {
  const contacts = getContacts().map((contact) =>
    contact.id === id
      ? { ...contact, label: input.label.trim(), address: input.address.trim(), note: input.note?.trim() || undefined }
      : contact
  );
  saveContacts(contacts);
  return contacts;
}

export function removeContact(id: string): AddressBookContact[] {
  const contacts = getContacts().filter((contact) => contact.id !== id);
  saveContacts(contacts);
  return contacts;
}

/* ============================================================
   Address Book CSV Export & Import Logic
   ============================================================ */

/**
 * Serializes the contacts array into RFC 4180 CSV format.
 */
export function exportAddressBookToCsv(contacts: AddressBookContact[] = getContacts()): string {
  const headers = ["Label", "Address", "Note", "CreatedAt"];
  const escapeCsv = (val: unknown): string => {
    const str = val === null || val === undefined ? "" : String(val);
    // Formula injection guard
    const guarded = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
    if (/[",\n\r]/.test(guarded)) {
      return `"${guarded.replace(/"/g, '""')}"`;
    }
    return guarded;
  };

  const rows = contacts.map((c) =>
    [c.label, c.address, c.note || "", c.createdAt || ""].map(escapeCsv).join(",")
  );

  // Prepend UTF-8 BOM so spreadsheet viewers render UTF-8 correctly
  return `\uFEFF${[headers.join(","), ...rows].join("\r\n")}`;
}

/**
 * Triggers a browser download of the exported CSV file.
 */
export function downloadAddressBookCsv(filename?: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const contacts = getContacts();
  const csv = exportAddressBookToCsv(contacts);
  const stamp = new Date().toISOString().slice(0, 10);
  const name = filename || `address-book-${stamp}.csv`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Parses CSV text into raw contact entries, supporting quotes, commas, and header row detection.
 */
export function parseAddressBookCsv(csvText: string): Array<{ label: string; address: string; note?: string }> {
  if (!csvText || !csvText.trim()) return [];

  // Strip BOM
  const cleanText = csvText.replace(/^\uFEFF/, "").trim();
  const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values.map((v) => (/^'(.*)$/.test(v) ? v.slice(1) : v));
  };

  const parsedRows = lines.map(parseLine);
  if (parsedRows.length === 0) return [];

  // Detect header row
  const firstRow = parsedRows[0].map((v) => v.toLowerCase().replace(/[^a-z]/g, ""));
  let labelIdx = 0;
  let addressIdx = 1;
  let noteIdx = 2;
  let startIndex = 0;

  const hasLabelHeader = firstRow.some((h) => h === "label" || h === "name");
  const hasAddressHeader = firstRow.some((h) => h === "address" || h === "wallet" || h === "stellaraddress");

  if (hasLabelHeader || hasAddressHeader) {
    startIndex = 1;
    labelIdx = firstRow.findIndex((h) => h === "label" || h === "name");
    addressIdx = firstRow.findIndex((h) => h === "address" || h === "wallet" || h === "stellaraddress");
    noteIdx = firstRow.findIndex((h) => h === "note" || h === "memo" || h === "notes");

    if (labelIdx === -1) labelIdx = 0;
    if (addressIdx === -1) addressIdx = 1;
  }

  const result: Array<{ label: string; address: string; note?: string }> = [];

  for (let i = startIndex; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    if (!row || row.length === 0) continue;
    const label = row[labelIdx] !== undefined ? row[labelIdx] : "";
    const address = row[addressIdx] !== undefined ? row[addressIdx] : "";
    const note = noteIdx !== -1 && row[noteIdx] !== undefined ? row[noteIdx] : undefined;

    if (label || address) {
      result.push({
        label: label.trim(),
        address: address.trim(),
        note: note?.trim() || undefined,
      });
    }
  }

  return result;
}

export interface ImportRowPreview {
  index: number;
  label: string;
  address: string;
  note?: string;
  status: "valid" | "duplicate" | "invalid";
  reason: string;
  existingContact?: AddressBookContact;
}

export interface AddressBookImportPreview {
  rows: ImportRowPreview[];
  toAddCount: number;
  toMergeCount: number;
  skippedCount: number;
  totalCount: number;
}

/**
 * Validates candidate CSV records against Stellar address rules and checks for duplicates.
 * Returns a preview summary with row-by-row status.
 */
export function previewAddressBookImport(
  rawContacts: Array<{ label: string; address: string; note?: string }>,
  existingContacts: AddressBookContact[] = getContacts()
): AddressBookImportPreview {
  const rows: ImportRowPreview[] = [];
  let toAddCount = 0;
  let toMergeCount = 0;
  let skippedCount = 0;

  const seenInBatch = new Map<string, number>();

  rawContacts.forEach((raw, index) => {
    const address = raw.address.trim();
    const label = raw.label.trim() || "Unnamed Contact";
    const note = raw.note?.trim();

    // 1. Validate with isValidStellarAddress from lib/stellar.ts
    const isValidStellar = isValidStellarAddress(address, { allowMuxed: true });

    if (!address || !isValidStellar) {
      skippedCount++;
      rows.push({
        index,
        label,
        address,
        note,
        status: "invalid",
        reason: !address
          ? "Wallet address is required"
          : "Invalid Stellar address (must start with G or M and be 56/69 characters)",
      });
      return;
    }

    // 2. Check for duplicate against existing contacts
    const existing = existingContacts.find(
      (c) => c.address.trim().toLowerCase() === address.toLowerCase()
    );

    if (existing) {
      toMergeCount++;
      rows.push({
        index,
        label,
        address,
        note,
        status: "duplicate",
        reason: `Matches existing contact "${existing.label}". Contact details will be merged.`,
        existingContact: existing,
      });
      return;
    }

    // 3. Check for duplicate within the imported file itself
    if (seenInBatch.has(address.toLowerCase())) {
      toMergeCount++;
      rows.push({
        index,
        label,
        address,
        note,
        status: "duplicate",
        reason: "Duplicate address in import file. Will be merged with earlier record.",
      });
      return;
    }

    // 4. Valid new contact
    seenInBatch.set(address.toLowerCase(), index);
    toAddCount++;
    rows.push({
      index,
      label,
      address,
      note,
      status: "valid",
      reason: "Valid Stellar address",
    });
  });

  return {
    rows,
    toAddCount,
    toMergeCount,
    skippedCount,
    totalCount: rawContacts.length,
  };
}

/**
 * Applies the verified import preview:
 * - Skips invalid rows
 * - Merges duplicate contacts (updating label/note)
 * - Adds new contacts
 * - Persists to storage
 */
export function applyAddressBookImport(
  preview: AddressBookImportPreview,
  existingContacts: AddressBookContact[] = getContacts()
): {
  added: number;
  merged: number;
  skipped: number;
  contacts: AddressBookContact[];
} {
  let contacts = [...existingContacts];
  let added = 0;
  let merged = 0;
  let skipped = 0;

  for (const row of preview.rows) {
    if (row.status === "invalid") {
      skipped++;
      continue;
    }

    if (row.status === "duplicate") {
      const existingIdx = contacts.findIndex(
        (c) => c.address.trim().toLowerCase() === row.address.trim().toLowerCase()
      );
      if (existingIdx !== -1) {
        const existing = contacts[existingIdx];
        contacts[existingIdx] = {
          ...existing,
          label: row.label.trim() || existing.label,
          note: row.note?.trim() || existing.note,
        };
        merged++;
      } else {
        contacts.push({
          id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          label: row.label.trim(),
          address: row.address.trim(),
          note: row.note?.trim(),
          createdAt: new Date().toISOString(),
        });
        merged++;
      }
      continue;
    }

    if (row.status === "valid") {
      contacts.push({
        id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        label: row.label.trim(),
        address: row.address.trim(),
        note: row.note?.trim(),
        createdAt: new Date().toISOString(),
      });
      added++;
    }
  }

  saveContacts(contacts);
  return { added, merged, skipped, contacts };
}
