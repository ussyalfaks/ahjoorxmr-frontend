"use client";

/**
 * Generates an HTML document for printing/PDF export of circle terms
 */

/** Circle data structure for agreement */
export interface CircleAgreementCircle {
  id: string;
  name: string;
  contribution: string;
  duration: string;
  totalRounds: number;
  currentRound: number;
  status: "active" | "completed" | "pending";
}

/** Data needed to generate a circle agreement PDF */
export interface CircleAgreementData {
  circle: CircleAgreementCircle;
  rules: string[];
  participants: { address: string; displayName?: string }[];
  schedule: { round: number; date: string; payout: string }[];
}
export function buildCircleAgreementHtml(data: CircleAgreementData): string {
  const { circle, rules, participants, schedule } = data;

  const escapeHtml = (s: string) => s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const rows = schedule.length > 0 
    ? schedule.map(r => `
        <tr>
          <td>${r.round}</td>
          <td>${escapeHtml(r.date)}</td>
          <td>${escapeHtml(r.payout)}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="3" class="empty">Schedule not yet determined</td></tr>`;

  const participantRows = participants.length > 0
    ? participants.map(p => `
        <tr>
          <td>${escapeHtml(p.displayName || p.address.slice(0, 8) + "..." + p.address.slice(-4))}</td>
          <td class="mono">${escapeHtml(p.address)}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="2" class="empty">No participants yet</td></tr>`;

  return `<!doctype html>
<html><head><meta charset="utf-8">
<title>Circle Agreement — ${escapeHtml(circle.name)}</title>
<style>
  @page { size: A4; margin: 20mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #111; line-height: 1.5; margin: 0; padding: 0; }
  .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #6c5ce7; }
  .logo { font-size: 24px; font-weight: bold; color: #6c5ce7; margin-bottom: 4px; }
  .subtitle { font-size: 12px; color: #666; }
  h2 { font-size: 16px; margin: 24px 0 12px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .field { }
  .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin-bottom: 2px; }
  .value { font-size: 14px; font-weight: 500; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #444; border-bottom: 1.5px solid #333; padding: 8px; }
  td { padding: 8px; border-bottom: 0.5px solid #eee; }
  td.empty { text-align: center; color: #888; font-style: italic; }
  .mono { font-family: ui-monospace, monospace; font-size: 10px; }
  .rules-list { padding-left: 20px; }
  .rules-list li { margin-bottom: 6px; font-size: 12px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #ddd; text-align: center; font-size: 10px; color: #888; }
  .badge { display: inline-block; background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 10px; text-transform: uppercase; }
</style>
</head><body>
  <div class="header">
    <div class="logo">Ahjoor</div>
    <div class="subtitle">Circle Agreement Summary</div>
  </div>

  <h2>Circle Details</h2>
  <div class="grid">
    <div class="field"><div class="label">Circle Name</div><div class="value">${escapeHtml(circle.name)}</div></div>
    <div class="field"><div class="label">Status</div><div class="value"><span class="badge">${circle.status}</span></div></div>
    <div class="field"><div class="label">Contribution</div><div class="value">${escapeHtml(circle.contribution)}</div></div>
    <div class="field"><div class="label">Duration</div><div class="value">${escapeHtml(circle.duration)}</div></div>
    <div class="field"><div class="label">Total Rounds</div><div class="value">${circle.totalRounds}</div></div>
    <div class="field"><div class="label">Current Round</div><div class="value">${circle.currentRound || 1}</div></div>
  </div>

  <h2>Payout Schedule</h2>
  <table><thead><tr><th>Round</th><th>Date</th><th>Payout To</th></tr></thead><tbody>${rows}</tbody></table>

  <h2>Participants</h2>
  <table><thead><tr><th>Name</th><th>Wallet Address</th></tr></thead><tbody>${participantRows}</tbody></table>

  ${rules.length > 0 ? `
  <h2>Circle Rules</h2>
  <ol class="rules-list">
    ${rules.map(r => `<li>${escapeHtml(r)}</li>`).join("")}
  </ol>
  ` : ""}

  <div class="footer">
    <p>This document is a summary for reference only and is not legally binding.</p>
    <p>Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
  </div>
</body></html>`;
}

/**
 * Triggers browser print dialog for the circle agreement
 */
export function printCircleAgreement(data: CircleAgreementData): void {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  const cleanup = () => {
    if (iframe.parentNode) document.body.removeChild(iframe);
  };

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) { cleanup(); return; }
    win.addEventListener("afterprint", cleanup, { once: true });
    win.focus();
    win.print();
    window.setTimeout(cleanup, 60000);
  };

  iframe.srcdoc = buildCircleAgreementHtml(data);
}

/**
 * Downloads circle agreement as PDF via print dialog
 */
export function downloadCircleAgreementPdf(
  data: CircleAgreementData,
  filename?: string
): void {
  printCircleAgreement(data);
}