/**
 * Client-side export helpers for contribution/payout history.
 *
 * CSV is generated as a blob download. PDF goes through the browser's own
 * print-to-PDF via a sandboxed iframe, which keeps the bundle free of a PDF
 * library while still producing a paginated, styled document.
 */

export type ExportFormat = "csv" | "pdf";

/** One row of exported history. Columns are fixed by the export spec. */
export interface ExportRow {
  date: string;
  circleName: string;
  round: number | string;
  amount: string;
  type: string;
  transactionHash: string;
}

const COLUMNS: { key: keyof ExportRow; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "circleName", label: "Circle Name" },
  { key: "round", label: "Round #" },
  { key: "amount", label: "Amount" },
  { key: "type", label: "Type" },
  { key: "transactionHash", label: "Transaction Hash" },
];

/**
 * Escapes a CSV field. Wraps in quotes when the value contains a delimiter,
 * quote, or newline, and doubles any embedded quotes.
 *
 * The leading apostrophe on formula-triggering characters stops spreadsheet
 * apps from evaluating a pasted value as a formula.
 */
function escapeCsvField(value: unknown): string {
  const raw = value === null || value === undefined ? "" : String(value);
  const guarded = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;

  if (/[",\n\r]/.test(guarded)) {
    return `"${guarded.replace(/"/g, '""')}"`;
  }
  return guarded;
}

export function buildCsv(rows: ExportRow[]): string {
  const header = COLUMNS.map((c) => escapeCsvField(c.label)).join(",");
  const body = rows.map((row) =>
    COLUMNS.map((c) => escapeCsvField(row[c.key])).join(",")
  );
  // Leading BOM so Excel reads UTF-8 correctly.
  return `﻿${[header, ...body].join("\r\n")}`;
}

/** `contributions-family-savings-2026-07-28.csv` */
export function buildFilename(
  prefix: string,
  scope: string,
  format: ExportFormat,
  date = new Date()
): string {
  const slug = scope
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const stamp = date.toISOString().slice(0, 10);
  return [prefix, slug, stamp].filter(Boolean).join("-") + `.${format}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Give the download a tick to start before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportCsv(rows: ExportRow[], filename: string) {
  const blob = new Blob([buildCsv(rows)], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(blob, filename);
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildPrintableHtml(
  rows: ExportRow[],
  title: string,
  subtitle: string
): string {
  const head = COLUMNS.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("");
  const body =
    rows.length === 0
      ? `<tr><td colspan="${COLUMNS.length}" class="empty">No records to export.</td></tr>`
      : rows
          .map(
            (row) =>
              `<tr>${COLUMNS.map(
                (c) =>
                  `<td class="${c.key === "transactionHash" ? "hash" : ""}">${escapeHtml(
                    row[c.key]
                  )}</td>`
              ).join("")}</tr>`
          )
          .join("");

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  @page { size: A4 landscape; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #111; margin: 0; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  p.sub { font-size: 11px; color: #555; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  thead { display: table-header-group; }
  th { text-align: left; text-transform: uppercase; letter-spacing: .06em; font-size: 9px;
       color: #444; border-bottom: 1.5px solid #333; padding: 6px 8px; }
  td { padding: 6px 8px; border-bottom: .5px solid #ddd; }
  tr { page-break-inside: avoid; }
  td.hash { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 8.5px; word-break: break-all; }
  td.empty { text-align: center; color: #777; padding: 24px; }
</style></head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="sub">${escapeHtml(subtitle)}</p>
  <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
</body></html>`;
}

/**
 * Opens the browser print dialog (→ "Save as PDF") for the given rows.
 * Uses a hidden same-origin iframe so the current page is never replaced and
 * no popup blocker is involved.
 */
export function exportPdf(
  rows: ExportRow[],
  title: string,
  subtitle: string
): void {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  const cleanup = () => {
    if (iframe.parentNode) document.body.removeChild(iframe);
  };

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) {
      cleanup();
      return;
    }
    win.addEventListener("afterprint", cleanup, { once: true });
    win.focus();
    win.print();
    // Safety net for browsers that never fire afterprint.
    window.setTimeout(cleanup, 60000);
  };

  iframe.srcdoc = buildPrintableHtml(rows, title, subtitle);
}
