"use client";

import { useEffect, useRef, useState } from "react";
import { BookUser, Pencil, Plus, Trash2, X, Download, Upload } from "lucide-react";
import CopyButton from "@/components/ui/CopyButton";
import { useToast } from "@/components/ui/Toast";
import { useUndoableRemoval } from "@/hooks/useUndoableRemoval";
import { truncateAddress } from "@/contexts/WalletContext";
import {
  addContact,
  getContacts,
  isDuplicateAddress,
  isValidAddressFormat,
  removeContact,
  updateContact,
  downloadAddressBookCsv,
  parseAddressBookCsv,
  previewAddressBookImport,
  applyAddressBookImport,
  type AddressBookImportPreview,
} from "@/lib/addressBook";
import AddressBookImportModal from "@/components/wallet/AddressBookImportModal";
import type { AddressBookContact } from "@/types/addressBook";

interface ContactFormState {
  label: string;
  address: string;
  note: string;
}

const EMPTY_FORM: ContactFormState = { label: "", address: "", note: "" };

function ContactForm({
  initial,
  existingContacts,
  editingId,
  onCancel,
  onSaved,
}: {
  initial: ContactFormState;
  existingContacts: AddressBookContact[];
  editingId?: string;
  onCancel: () => void;
  onSaved: (contacts: AddressBookContact[]) => void;
}) {
  const { showToast } = useToast();
  const [form, setForm] = useState<ContactFormState>(initial);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const label = form.label.trim();
    const address = form.address.trim();

    if (!label) {
      setError("Give this contact a label.");
      return;
    }
    if (!isValidAddressFormat(address)) {
      setError("That doesn't look like a valid wallet address.");
      return;
    }
    if (isDuplicateAddress(address, existingContacts, editingId)) {
      setError("This address is already saved.");
      return;
    }

    if (editingId) {
      const updated = updateContact(editingId, { label, address, note: form.note });
      onSaved(updated);
      showToast({ title: "Contact updated", variant: "success" });
    } else {
      addContact({ label, address, note: form.note });
      onSaved(getContacts());
      showToast({ title: "Contact saved", variant: "success" });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-[var(--ov-14)] bg-[var(--ov-05)] p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-label" className="block text-xs text-[var(--muted)] mb-1.5">
            Label
          </label>
          <input
            id="contact-label"
            type="text"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="e.g. Emeka"
            className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
          />
        </div>
        <div>
          <label htmlFor="contact-address" className="block text-xs text-[var(--muted)] mb-1.5">
            Wallet address
          </label>
          <input
            id="contact-address"
            type="text"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="0x…"
            className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-3 py-2 text-sm font-mono text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-note" className="block text-xs text-[var(--muted)] mb-1.5">
          Note (optional)
        </label>
        <input
          id="contact-note"
          type="text"
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          placeholder="e.g. Circle co-organizer"
          className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[var(--ov-14)] px-3.5 py-2 text-sm text-[var(--text)] hover:bg-[var(--ov-0a)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-[#4B6B76] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#3D5A64] transition-colors"
        >
          {editingId ? "Save changes" : "Save contact"}
        </button>
      </div>
    </form>
  );
}

export default function AddressBookSection() {
  const [contacts, setContacts] = useState<AddressBookContact[]>([]);
  const [mode, setMode] = useState<"idle" | "adding" | { editingId: string }>("idle");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // #245: the "Delete? Confirm" step above is a separate safety net
  // (catches a stray click); this is the actual undo window required by
  // the issue, deferring the persisted `removeContact()` call itself
  // until it closes.
  const { remove, isPending } = useUndoableRemoval<string>();
  const { showToast } = useToast();

  const [importPreview, setImportPreview] = useState<AddressBookImportPreview | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isApplyingImport, setIsApplyingImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setContacts(getContacts());
  }, []);

  function handleDelete(id: string) {
    const target = contacts.find((c) => c.id === id);
    setDeletingId(null);
    remove(id, {
      title: "Contact removed",
      message: target?.label,
      commit: () => setContacts(removeContact(id)),
    });
  }

  const handleExportCsv = () => {
    downloadAddressBookCsv();
    showToast({ title: "Address book exported to CSV", variant: "success" });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const rawContacts = parseAddressBookCsv(text);
      if (rawContacts.length === 0) {
        showToast({ title: "No contact entries found in file", variant: "error" });
        return;
      }

      const preview = previewAddressBookImport(rawContacts, contacts);
      setImportPreview(preview);
      setIsImportModalOpen(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;
    setIsApplyingImport(true);
    try {
      const result = applyAddressBookImport(importPreview, contacts);
      setContacts(result.contacts);
      setIsImportModalOpen(false);
      setImportPreview(null);
      showToast({
        title: "Import complete",
        message: `Added ${result.added}, merged ${result.merged}, skipped ${result.skipped}.`,
        variant: "success",
      });
    } finally {
      setIsApplyingImport(false);
    }
  };

  return (
    <div className="bg-[var(--content)] p-6 md:p-8 rounded-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-2">
          <BookUser size={18} className="text-[var(--muted)]" aria-hidden="true" />
          <div>
            <p className="text-[var(--text)] text-lg font-bold font-sora">Saved Contacts</p>
            <p className="text-[var(--muted)] text-sm">Label frequently used wallet addresses for quick sends</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={contacts.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[var(--text)] bg-[var(--modal)] hover:bg-[var(--ov-0a)] border border-[var(--border)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            title="Export saved contacts to CSV"
          >
            <Download size={15} aria-hidden="true" />
            Export CSV
          </button>

          <label
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[var(--text)] bg-[var(--modal)] hover:bg-[var(--ov-0a)] border border-[var(--border)] rounded-lg transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-[#4B6B76]"
            title="Import contacts from CSV"
          >
            <Upload size={15} aria-hidden="true" />
            Import CSV
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="sr-only"
            />
          </label>

          {mode === "idle" && (
            <button
              onClick={() => setMode("adding")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-white hover:bg-gray-200 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              <Plus size={16} aria-hidden="true" />
              Add Contact
            </button>
          )}
        </div>
      </div>

      {mode === "adding" && (
        <div className="mb-4">
          <ContactForm
            initial={EMPTY_FORM}
            existingContacts={contacts}
            onCancel={() => setMode("idle")}
            onSaved={(updated) => {
              setContacts(updated);
              setMode("idle");
            }}
          />
        </div>
      )}

      {contacts.filter((c) => !isPending(c.id)).length === 0 && mode === "idle" ? (
        <p className="text-sm text-[var(--muted)]">No saved contacts yet.</p>
      ) : (
        <div className="space-y-2">
          {contacts.filter((c) => !isPending(c.id)).map((contact) => {
            const isEditing = typeof mode === "object" && mode.editingId === contact.id;
            if (isEditing) {
              return (
                <ContactForm
                  key={contact.id}
                  initial={{ label: contact.label, address: contact.address, note: contact.note ?? "" }}
                  existingContacts={contacts}
                  editingId={contact.id}
                  onCancel={() => setMode("idle")}
                  onSaved={(updated) => {
                    setContacts(updated);
                    setMode("idle");
                  }}
                />
              );
            }
            return (
              <div
                key={contact.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[var(--ov-1a)] bg-[var(--ov-05)] gap-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{contact.label}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-xs text-[var(--muted)]">
                      {truncateAddress(contact.address)}
                    </span>
                    <CopyButton value={contact.address} />
                  </div>
                  {contact.note && <p className="text-xs text-[var(--faint)] mt-1">{contact.note}</p>}
                </div>
                <div className="flex items-center gap-1 self-end sm:self-auto">
                  {deletingId === contact.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-500">Delete?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(contact.id)}
                        className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(null)}
                        className="rounded-lg border border-[var(--ov-14)] px-2.5 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--ov-0a)]"
                      >
                        <X size={12} aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setMode({ editingId: contact.id })}
                        aria-label={`Edit ${contact.label}`}
                        className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-0a)] rounded-lg transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(contact.id)}
                        aria-label={`Delete ${contact.label}`}
                        className="p-2 text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddressBookImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportPreview(null);
        }}
        preview={importPreview}
        onConfirm={handleConfirmImport}
        isApplying={isApplyingImport}
      />
    </div>
  );
}
