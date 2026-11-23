"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import {
  exportCircleAnalyticsReport,
  type CircleAnalyticsData,
} from "@/lib/circleAnalyticsReport";

interface ExportReportButtonProps {
  analytics: CircleAnalyticsData;
  className?: string;
  disabled?: boolean;
}

export function ExportReportButton({
  analytics,
  className = "",
  disabled = false,
}: ExportReportButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleExport = () => {
    setBusy(true);
    window.requestAnimationFrame(() => {
      try {
        exportCircleAnalyticsReport(analytics, {
          onAfterPrint: () => setBusy(false),
        });
      } catch (err) {
        console.error("Failed to export report:", err);
      } finally {
        window.setTimeout(() => setBusy(false), 1500);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled || busy}
      aria-label="Export circle analytics report"
      className={`inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--elevated)] hover:border-[var(--border-hover)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${className}`}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {busy ? "Preparing report…" : "Export report"}
    </button>
  );
}

export default ExportReportButton;
