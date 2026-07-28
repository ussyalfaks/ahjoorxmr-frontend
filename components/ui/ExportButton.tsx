"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileText, Sheet } from "lucide-react";
import {
  exportCsv,
  exportPdf,
  buildFilename,
  type ExportRow,
} from "@/lib/export";

interface ExportButtonProps {
  /** Called lazily so large datasets are only materialized on click. */
  getRows: () => ExportRow[];
  /** Used in the filename and PDF heading, e.g. a circle name. */
  scope: string;
  /** Filename prefix, e.g. "contributions" or "payouts". */
  prefix: string;
  title: string;
  disabled?: boolean;
  className?: string;
}

export default function ExportButton({
  getRows,
  scope,
  prefix,
  title,
  disabled = false,
  className = "",
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function runExport(format: "csv" | "pdf") {
    setOpen(false);
    setBusy(true);
    // Yield a frame so the menu closes and the button paints its busy state
    // before serializing what may be a large dataset.
    window.requestAnimationFrame(() => {
      try {
        const rows = getRows();
        const now = new Date();
        if (format === "csv") {
          exportCsv(rows, buildFilename(prefix, scope, "csv", now));
        } else {
          const stamp = new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
          }).format(now);
          exportPdf(
            rows,
            title,
            `${scope} · ${rows.length} record${rows.length === 1 ? "" : "s"} · Exported ${stamp}`
          );
        }
      } finally {
        setBusy(false);
      }
    });
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-lg border border-[#ffffff16] bg-[#ffffff08] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ffffff12] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
      >
        <Download size={15} aria-hidden="true" />
        {busy ? "Preparing…" : "Export"}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Export format"
          className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-xl border border-[#ffffff14] bg-[#1C1C1E] shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => runExport("csv")}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[#EBEBEB] transition-colors hover:bg-[#ffffff0a] focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            <Sheet size={15} aria-hidden="true" />
            Download CSV
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => runExport("pdf")}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[#EBEBEB] transition-colors hover:bg-[#ffffff0a] focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            <FileText size={15} aria-hidden="true" />
            Save as PDF
          </button>
        </div>
      )}
    </div>
  );
}
