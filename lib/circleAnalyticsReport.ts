/**
 * circleAnalyticsReport.ts
 * Generates an executive printable/PDF report for Circle Analytics.
 *
 * Adheres to the standard Ahjoor approach:
 * Uses a sandboxed iframe with browser print-to-PDF, rendering high-resolution
 * vector SVG charts, formatted typography, and structured data without adding
 * heavy external PDF library dependencies.
 */

export interface Round {
  round: number;
  contributions: number;
  contributors: number;
  paidOut: number;
  completedAt: string;
}

export interface ParticipantReliability {
  address: string;
  name: string;
  onTimeCount: number;
  lateCount: number;
  reliabilityScore: number;
}

export interface CircleAnalyticsData {
  circleId: string;
  circleName: string;
  rounds: Round[];
  participantReliability: ParticipantReliability[];
  totalSaved: number;
  totalPaidOut: number;
  contributions?: Array<{
    id: string;
    date?: string;
    dueDate?: string;
    amount: number;
    [key: string]: unknown;
  }>;
}

export interface ExportReportOptions {
  generatedAt?: Date;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

/**
 * Escapes HTML characters to prevent XSS.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Builds the export filename containing the circle name and the date.
 * E.g. `family-savings-analytics-2026-11-23.pdf`
 */
export function buildCircleAnalyticsFilename(circleName: string, date: Date = new Date()): string {
  const slug = (circleName || "circle")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const stamp = date.toISOString().slice(0, 10);
  return `${slug || "circle"}-analytics-${stamp}.pdf`;
}

/**
 * Generates an inline, high-contrast, fully vector SVG chart for the contribution trend.
 * Designed to render legibly on paper and in exported PDFs.
 */
export function generateContributionTrendChartSvg(rounds: Round[]): string {
  if (!rounds || rounds.length === 0) {
    return `<div style="padding: 32px; text-align: center; color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;">No completed rounds yet.</div>`;
  }

  const width = 680;
  const height = 240;
  const paddingLeft = 75;
  const paddingRight = 45;
  const paddingTop = 40;
  const paddingBottom = 45;

  const availableWidth = width - paddingLeft - paddingRight;
  const availableHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...rounds.map((r) => r.contributions), 10);

  // Compute coordinate points
  const points = rounds.map((r, i) => {
    const x = paddingLeft + (availableWidth * i) / Math.max(rounds.length - 1, 1);
    const y = paddingTop + availableHeight - (r.contributions / maxVal) * availableHeight;
    return { x, y, round: r.round, contributions: r.contributions, completedAt: r.completedAt };
  });

  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + availableHeight} L ${points[0].x} ${paddingTop + availableHeight} Z`;

  // Ticks at 0%, 25%, 50%, 75%, 100%
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const gridLines = ticks
    .map((pct) => {
      const y = paddingTop + availableHeight * (1 - pct);
      const val = Math.round(maxVal * pct);
      return `
        <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3,3" stroke-width="1" />
        <text x="${paddingLeft - 8}" y="${y + 4}" text-anchor="end" font-size="10" font-family="-apple-system, BlinkMacSystemFont, sans-serif" fill="#64748b">${val.toLocaleString()} USDT</text>
      `;
    })
    .join("");

  // Point circles and callout badges
  const pointElements = points
    .map((p) => {
      return `
        <circle cx="${p.x}" cy="${p.y}" r="5" fill="#6c5ce7" stroke="#ffffff" stroke-width="2" />
        <g transform="translate(${p.x}, ${p.y - 12})">
          <rect x="-32" y="-14" width="64" height="18" rx="4" fill="#6c5ce7" />
          <text x="0" y="-2" text-anchor="middle" font-size="9" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, sans-serif" fill="#ffffff">${p.contributions.toLocaleString()} USDT</text>
        </g>
        <text x="${p.x}" y="${height - 24}" text-anchor="middle" font-size="11" font-weight="600" font-family="-apple-system, BlinkMacSystemFont, sans-serif" fill="#1e293b">Round ${p.round}</text>
        <text x="${p.x}" y="${height - 10}" text-anchor="middle" font-size="9" font-family="-apple-system, BlinkMacSystemFont, sans-serif" fill="#64748b">${escapeHtml(p.completedAt)}</text>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Contribution Trend Chart">
      <defs>
        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#6c5ce7" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#6c5ce7" stop-opacity="0.02" />
        </linearGradient>
      </defs>
      <!-- Base Background Box -->
      <rect x="0" y="0" width="${width}" height="${height}" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
      <!-- Grid & Y-Axis -->
      ${gridLines}
      <!-- Baseline axis -->
      <line x1="${paddingLeft}" y1="${paddingTop + availableHeight}" x2="${width - paddingRight}" y2="${paddingTop + availableHeight}" stroke="#cbd5e1" stroke-width="1.5" />
      <!-- Fill Area -->
      <path d="${areaPath}" fill="url(#trendGradient)" />
      <!-- Trend Line -->
      <path d="${linePath}" fill="none" stroke="#6c5ce7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <!-- Data Points & Labels -->
      ${pointElements}
    </svg>
  `;
}

/**
 * Builds the complete standalone HTML document for printing / saving as PDF.
 */
export function buildCircleAnalyticsReportHtml(
  data: CircleAnalyticsData,
  options: { generatedAt?: Date } = {}
): string {
  const generatedAt = options.generatedAt ?? new Date();
  const filename = buildCircleAnalyticsFilename(data.circleName, generatedAt);
  const title = filename.replace(/\.pdf$/, "");

  const dateFormatted = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(generatedAt);

  // Calculate average reliability
  const participants = data.participantReliability || [];
  const avgReliability =
    participants.length > 0
      ? Math.round(
          participants.reduce((sum, p) => sum + (p.reliabilityScore || 0), 0) /
            participants.length
        )
      : 100;

  // Rounds summary rows
  const roundsRows =
    data.rounds.length > 0
      ? data.rounds
          .map(
            (r) => `
        <tr>
          <td><strong>Round ${r.round}</strong></td>
          <td>${escapeHtml(r.completedAt)}</td>
          <td style="text-align: right; font-weight: 600;">${r.contributions.toLocaleString()} USDT</td>
          <td style="text-align: center;">${r.contributors}</td>
          <td style="text-align: right;">${r.paidOut.toLocaleString()} USDT</td>
        </tr>
      `
          )
          .join("")
      : `<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 16px;">No rounds completed yet</td></tr>`;

  // Member table rows
  const memberRows =
    participants.length > 0
      ? participants
          .map((p) => {
            const scoreClass =
              p.reliabilityScore >= 80
                ? "score-bar-high"
                : p.reliabilityScore >= 50
                ? "score-bar-med"
                : "score-bar-low";

            return `
        <tr>
          <td>
            <div style="font-weight: 600; color: #0f172a;">${escapeHtml(p.name)}</div>
          </td>
          <td>
            <span class="mono">${escapeHtml(p.address)}</span>
          </td>
          <td style="text-align: center;">
            <span class="badge badge-success">${p.onTimeCount} on-time</span>
          </td>
          <td style="text-align: center;">
            <span class="badge ${p.lateCount > 0 ? "badge-warning" : "badge-neutral"}">${p.lateCount} late</span>
          </td>
          <td style="text-align: right;">
            <div class="score-container">
              <div class="score-track">
                <div class="score-bar ${scoreClass}" style="width: ${Math.min(Math.max(p.reliabilityScore, 0), 100)}%;"></div>
              </div>
              <span class="badge badge-score">${p.reliabilityScore}%</span>
            </div>
          </td>
        </tr>
      `;
          })
          .join("")
      : `<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 16px;">No members recorded</td></tr>`;

  const chartSvg = generateContributionTrendChartSvg(data.rounds);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 14mm 14mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      line-height: 1.5;
      font-size: 13px;
    }
    .report-container {
      max-width: 100%;
      margin: 0 auto;
    }
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #6c5ce7;
      padding-bottom: 16px;
      margin-bottom: 22px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #6c5ce7;
      letter-spacing: -0.02em;
    }
    .report-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin: 4px 0 2px 0;
    }
    .report-subtitle {
      font-size: 12px;
      color: #64748b;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #64748b;
    }
    .meta-item {
      margin-bottom: 3px;
    }
    .meta-label {
      font-weight: 600;
      color: #475569;
    }

    /* Key Stats Grid */
    .stats-section {
      margin-bottom: 22px;
      page-break-inside: avoid;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
    }
    .stat-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 6px;
    }
    .stat-value {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }
    .stat-hint {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 2px;
    }

    /* Section Styling */
    .section {
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    .section-header {
      margin-bottom: 12px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }
    .section-subtitle {
      font-size: 11px;
      color: #64748b;
      margin: 2px 0 0 0;
    }

    /* Chart Container */
    .chart-container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 14px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 8px 12px;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #cbd5e1;
    }
    td {
      padding: 8px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: #475569;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 600;
      line-height: 1.3;
    }
    .badge-success {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }
    .badge-warning {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    .badge-neutral {
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }
    .badge-score {
      background: #ede9fe;
      color: #6c5ce7;
      border: 1px solid #ddd6fe;
      font-weight: 700;
      min-width: 44px;
      text-align: center;
    }

    /* Score Progress Bar */
    .score-container {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: 140px;
      justify-content: flex-end;
    }
    .score-track {
      flex: 1;
      height: 6px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }
    .score-bar {
      height: 100%;
      border-radius: 9999px;
    }
    .score-bar-high {
      background: #10b981;
    }
    .score-bar-med {
      background: #f59e0b;
    }
    .score-bar-low {
      background: #ef4444;
    }

    /* Footer */
    .report-footer {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="report-container">
    <!-- Header -->
    <header class="report-header">
      <div>
        <div class="brand-title">Ahjoor</div>
        <h1 class="report-title">${escapeHtml(data.circleName)} Analytics</h1>
        <p class="report-subtitle">Official Circle Performance &amp; Member Analytics Report</p>
      </div>
      <div class="meta-box">
        <div class="meta-item"><span class="meta-label">Date:</span> ${escapeHtml(dateFormatted)}</div>
        <div class="meta-item"><span class="meta-label">Circle ID:</span> <span class="mono">${escapeHtml(data.circleId)}</span></div>
        <div class="meta-item"><span class="meta-label">Scope:</span> Organizer Executive Summary</div>
      </div>
    </header>

    <!-- Key Stats -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Saved</div>
          <div class="stat-value">${data.totalSaved.toLocaleString()} USDT</div>
          <div class="stat-hint">Cumulative circle contributions</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Paid Out</div>
          <div class="stat-value">${data.totalPaidOut.toLocaleString()} USDT</div>
          <div class="stat-hint">Successfully distributed</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Participants</div>
          <div class="stat-value">${participants.length}</div>
          <div class="stat-hint">Active circle members</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg Reliability</div>
          <div class="stat-value">${avgReliability}%</div>
          <div class="stat-hint">${data.rounds.length} completed rounds</div>
        </div>
      </div>
    </section>

    <!-- Contribution Trend Chart -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Contribution Trend</h2>
        <p class="section-subtitle">Contributions per round over time with payout timeline</p>
      </div>
      <div class="chart-container">
        ${chartSvg}
      </div>
      <table>
        <thead>
          <tr>
            <th>Round</th>
            <th>Date Completed</th>
            <th style="text-align: right;">Contributions (USDT)</th>
            <th style="text-align: center;">Contributors</th>
            <th style="text-align: right;">Paid Out (USDT)</th>
          </tr>
        </thead>
        <tbody>
          ${roundsRows}
        </tbody>
      </table>
    </section>

    <!-- Member Table -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Member Table</h2>
        <p class="section-subtitle">Individual reliability score, on-time frequency, and late counts</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Wallet Address</th>
            <th style="text-align: center;">On-Time Contributions</th>
            <th style="text-align: center;">Late Contributions</th>
            <th style="text-align: right;">Reliability Score</th>
          </tr>
        </thead>
        <tbody>
          ${memberRows}
        </tbody>
      </table>
    </section>

    <!-- Footer -->
    <footer class="report-footer">
      <div>Ahjoor Protocol &middot; Confidential Circle Analytics Report &middot; Generated for Organizers</div>
      <div>Page 1 of 1</div>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Triggers the browser print dialog (destination: "Save as PDF") for the circle analytics report
 * via a sandboxed hidden iframe.
 *
 * The browser uses the document <title> as the default PDF filename,
 * ensuring the exported file name includes the circle name and date.
 */
export function exportCircleAnalyticsReport(
  data: CircleAnalyticsData,
  options: ExportReportOptions = {}
): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const generatedAt = options.generatedAt ?? new Date();
  const html = buildCircleAnalyticsReportHtml(data, { generatedAt });

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  let timer: ReturnType<typeof setTimeout> | undefined;

  const cleanup = () => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (typeof document !== "undefined" && iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
    options.onAfterPrint?.();
  };

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) {
      cleanup();
      return;
    }
    options.onBeforePrint?.();
    win.addEventListener("afterprint", cleanup, { once: true });
    win.focus();
    win.print();
    // Safety fallback
    timer = setTimeout(cleanup, 60000);
    if (timer && typeof (timer as any).unref === "function") {
      (timer as any).unref();
    }
  };

  iframe.srcdoc = html;
}
