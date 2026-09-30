"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Link as LinkIcon, X } from "lucide-react";
import {
  buildInviteUrl,
  createInviteLink,
  getInviteLinks,
  getInviteStatus,
  INVITES_UPDATED_EVENT,
  revokeInviteLink,
  type InviteExpiry,
  type InviteLink,
} from "@/lib/inviteLinks";

const EXPIRY_OPTIONS: { value: InviteExpiry; label: string }[] = [
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "never", label: "Never" },
];

const STATUS_STYLES: Record<string, string> = {
  active: "text-green-600 dark:text-green-400",
  expired: "text-[var(--muted)]",
  revoked: "text-red-500",
  exhausted: "text-[var(--muted)]",
};

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
}

function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Never";
}

const btn =
  "flex items-center gap-2 px-4 py-2 bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-sm text-[var(--text)] font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]";

export default function InviteManager({ circleId }: { circleId: string }) {
  const [open, setOpen] = useState(false);
  const [expiry, setExpiry] = useState<InviteExpiry>("7d");
  const [maxUses, setMaxUses] = useState("");
  const [links, setLinks] = useState<InviteLink[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setLinks(getInviteLinks(circleId));
    sync();
    window.addEventListener(INVITES_UPDATED_EVENT, sync);
    return () => window.removeEventListener(INVITES_UPDATED_EVENT, sync);
  }, [circleId]);

  async function copy(token: string) {
    await copyText(buildInviteUrl(token));
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 1500);
  }

  async function generate() {
    const parsed = parseInt(maxUses, 10);
    const link = createInviteLink(circleId, expiry, Number.isFinite(parsed) ? parsed : null);
    await copy(link.token);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={btn}>
        <LinkIcon size={14} aria-hidden="true" />
        Manage Invites
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="invite-manager-title">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--bg)] border border-[var(--ov-14)] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 id="invite-manager-title" className="text-lg font-bold font-sora text-[var(--text)]">Invite links</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-[var(--muted)] hover:text-[var(--text)]">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap items-end gap-3 mb-6">
              <label className="text-sm text-[var(--muted)] flex flex-col gap-1">
                Expires after
                <select value={expiry} onChange={(e) => setExpiry(e.target.value as InviteExpiry)} className="bg-[var(--content)] text-[var(--text)] rounded-lg px-3 py-2">
                  {EXPIRY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-[var(--muted)] flex flex-col gap-1">
                Max uses
                <input type="number" min={1} placeholder="Unlimited" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className="w-32 bg-[var(--content)] text-[var(--text)] rounded-lg px-3 py-2" />
              </label>
              <button onClick={generate} className="px-4 py-2 rounded-lg bg-[#4B6B76] text-white text-sm font-medium">
                Generate &amp; copy link
              </button>
            </div>

            {links.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No invite links yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-[var(--muted)]">
                      <th className="py-2 pr-3">Created</th>
                      <th className="py-2 pr-3">Uses</th>
                      <th className="py-2 pr-3">Expires</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((l) => {
                      const status = getInviteStatus(l);
                      return (
                        <tr key={l.token} className="border-t border-[var(--ov-0f)] text-[var(--text)]">
                          <td className="py-2 pr-3">{formatDate(l.createdAt)}</td>
                          <td className="py-2 pr-3">{l.uses}{l.maxUses !== null ? ` / ${l.maxUses}` : ""}</td>
                          <td className="py-2 pr-3">{formatDate(l.expiresAt)}</td>
                          <td className={`py-2 pr-3 capitalize ${STATUS_STYLES[status]}`}>{status}</td>
                          <td className="py-2 flex gap-2 justify-end">
                            {status === "active" && (
                              <>
                                <button onClick={() => copy(l.token)} aria-label="Copy link" className="text-[var(--muted)] hover:text-[var(--text)]">
                                  {copiedToken === l.token ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                </button>
                                <button onClick={() => revokeInviteLink(l.token)} className="text-xs text-red-500 hover:underline">
                                  Revoke
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
