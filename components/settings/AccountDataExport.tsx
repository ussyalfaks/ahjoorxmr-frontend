"use client";

import { useState } from "react";
import { Download, ShieldCheck } from "lucide-react";
import { buildAccountExport, getExportRetryAt, markExportRequested } from "@/lib/accountExport";

const NOTIFICATIONS_STORAGE_KEY = "ahjoorxmr:notification-settings";
const PROFILE_STORAGE_KEY = "ahjoorxmr:settings";

export default function AccountDataExport() {
  const [status, setStatus] = useState<"idle" | "success" | "error" | "limited">("idle");
  const [retryAt, setRetryAt] = useState<number | null>(null);

  const handleExport = () => {
    const nextAllowed = getExportRetryAt();
    if (nextAllowed) {
      setRetryAt(nextAllowed);
      setStatus("limited");
      return;
    }
    try {
      const settings = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) ?? "null");
      const notificationPreferences = JSON.parse(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) ?? "null");
      const payload = buildAccountExport(settings, notificationPreferences);
      const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `ahjoor-account-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      markExportRequested();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return <section className="rounded-2xl border border-[var(--ov-10)] bg-[var(--content)] p-6" aria-labelledby="account-export-title">
    <div className="flex items-start gap-3"><div className="rounded-xl bg-[#4B6B76]/15 p-2.5 text-[#4B6B76]"><ShieldCheck size={19} aria-hidden="true" /></div><div><h2 id="account-export-title" className="text-base font-bold font-sora text-[var(--text)]">Your account data</h2><p className="mt-1 max-w-2xl text-xs leading-relaxed text-[var(--muted)]">Download a JSON copy of your profile settings, notification preferences, contribution history, and payout history. The export is generated locally in your browser.</p></div></div>
    <button type="button" onClick={handleExport} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4B6B76] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#3D5A64] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"><Download size={15} aria-hidden="true" />Export my data</button>
    <p className="mt-3 text-[11px] text-[var(--muted)]" role="status" aria-live="polite">{status === "success" && "Export downloaded. The temporary download URL expires after 60 seconds and no data was uploaded."}{status === "limited" && retryAt && `For your privacy, another export can be requested after ${new Date(retryAt).toLocaleTimeString()}.`}{status === "error" && "The export could not be generated. Please try again."}{status === "idle" && "For privacy, exports are limited to one request every five minutes."}</p>
  </section>;
}
