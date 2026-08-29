import type { AddressBookContact } from "@/types/addressBook";

// Client-side only for now (see issue tech notes) — swap for a profile/user
// API call once the backend exposes one, keeping this same read/write shape.
const STORAGE_KEY = "ahjoor:address-book";

export function getContacts(): AddressBookContact[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveContacts(contacts: AddressBookContact[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
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
