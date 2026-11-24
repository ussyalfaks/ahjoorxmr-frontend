import { describe, it } from "node:test";
import assert from "node:assert";
import {
  buildCircleAnalyticsFilename,
  generateContributionTrendChartSvg,
  buildCircleAnalyticsReportHtml,
  exportCircleAnalyticsReport,
  type CircleAnalyticsData,
} from "./circleAnalyticsReport.ts";

const MOCK_ANALYTICS: CircleAnalyticsData = {
  circleId: "family-savings",
  circleName: "Family savings",
  rounds: [
    { round: 1, contributions: 100, contributors: 2, paidOut: 100, completedAt: "2024-01-15" },
    { round: 2, contributions: 100, contributors: 2, paidOut: 100, completedAt: "2024-01-22" },
    { round: 3, contributions: 100, contributors: 2, paidOut: 0, completedAt: "2024-01-29" },
  ],
  participantReliability: [
    {
      address: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b",
      name: "You",
      onTimeCount: 3,
      lateCount: 0,
      reliabilityScore: 100,
    },
    {
      address: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f",
      name: "Emeka",
      onTimeCount: 2,
      lateCount: 1,
      reliabilityScore: 67,
    },
  ],
  totalSaved: 300,
  totalPaidOut: 200,
};

describe("circleAnalyticsReport", () => {
  describe("buildCircleAnalyticsFilename", () => {
    it("includes the slugified circle name and the date in the filename", () => {
      const fixedDate = new Date("2026-11-23T12:00:00Z");
      const filename = buildCircleAnalyticsFilename("Family savings", fixedDate);
      assert.strictEqual(filename, "family-savings-analytics-2026-11-23.pdf");
      assert.ok(filename.includes("family-savings"));
      assert.ok(filename.includes("2026-11-23"));
      assert.ok(filename.endsWith(".pdf"));
    });

    it("handles special characters and whitespace in circle name", () => {
      const fixedDate = new Date("2024-01-15T00:00:00Z");
      const filename = buildCircleAnalyticsFilename("My @Awesome* Circle! #42", fixedDate);
      assert.strictEqual(filename, "my-awesome-circle-42-analytics-2024-01-15.pdf");
    });

    it("falls back to 'circle' when name is empty", () => {
      const fixedDate = new Date("2025-05-10T00:00:00Z");
      const filename = buildCircleAnalyticsFilename("", fixedDate);
      assert.strictEqual(filename, "circle-analytics-2025-05-10.pdf");
    });
  });

  describe("generateContributionTrendChartSvg", () => {
    it("renders an SVG with legible chart elements for rounds", () => {
      const svg = generateContributionTrendChartSvg(MOCK_ANALYTICS.rounds);

      // Verify SVG container & accessibility
      assert.ok(svg.includes("<svg"));
      assert.ok(svg.includes('viewBox="0 0 680 240"'));
      assert.ok(svg.includes('aria-label="Contribution Trend Chart"'));

      // Verify trend line and area fill
      assert.ok(svg.includes('stroke="#6c5ce7"'));
      assert.ok(svg.includes('fill="url(#trendGradient)"'));

      // Verify data points and round labels
      assert.ok(svg.includes("Round 1"));
      assert.ok(svg.includes("Round 2"));
      assert.ok(svg.includes("Round 3"));
      assert.ok(svg.includes("100 USDT"));
      assert.ok(svg.includes("2024-01-15"));
    });

    it("handles empty rounds gracefully", () => {
      const emptySvg = generateContributionTrendChartSvg([]);
      assert.ok(emptySvg.includes("No completed rounds yet"));
    });
  });

  describe("buildCircleAnalyticsReportHtml", () => {
    it("includes key stats, contribution trend chart, and member table", () => {
      const fixedDate = new Date("2026-11-23T10:00:00Z");
      const html = buildCircleAnalyticsReportHtml(MOCK_ANALYTICS, { generatedAt: fixedDate });

      // Document title contains circle name and date for default PDF save filename
      assert.ok(html.includes("<title>family-savings-analytics-2026-11-23</title>"));

      // Key stats
      assert.ok(html.includes("300 USDT")); // Total Saved
      assert.ok(html.includes("200 USDT")); // Total Paid Out
      assert.ok(html.includes("Total Saved"));
      assert.ok(html.includes("Total Paid Out"));
      assert.ok(html.includes("Participants"));
      assert.ok(html.includes("Avg Reliability"));

      // Contribution trend chart
      assert.ok(html.includes("Contribution Trend"));
      assert.ok(html.includes("<svg"));
      assert.ok(html.includes("Round 1"));
      assert.ok(html.includes("Round 2"));
      assert.ok(html.includes("Round 3"));

      // Member table
      assert.ok(html.includes("Member Table"));
      assert.ok(html.includes("You"));
      assert.ok(html.includes("Emeka"));
      assert.ok(html.includes("0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b"));
      assert.ok(html.includes("0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f"));
      assert.ok(html.includes("3 on-time"));
      assert.ok(html.includes("1 late"));
      assert.ok(html.includes("100%"));
      assert.ok(html.includes("67%"));

      // Print-friendly CSS rules
      assert.ok(html.includes("@page {"));
      assert.ok(html.includes("print-color-adjust: exact"));
    });

    it("escapes user input to prevent XSS", () => {
      const xssData: CircleAnalyticsData = {
        circleId: "xss<script>alert(1)</script>",
        circleName: "Safe <img src=x onerror=alert(1)> Circle",
        rounds: [],
        participantReliability: [
          {
            address: "0x123<script>",
            name: "Hacker <script>evil()</script>",
            onTimeCount: 0,
            lateCount: 0,
            reliabilityScore: 0,
          },
        ],
        totalSaved: 0,
        totalPaidOut: 0,
      };

      const html = buildCircleAnalyticsReportHtml(xssData);
      assert.ok(!html.includes("<script>alert(1)</script>"));
      assert.ok(!html.includes("<img src=x onerror=alert(1)>"));
      assert.ok(!html.includes("<script>evil()</script>"));
      assert.ok(html.includes("&lt;script&gt;"));
    });
  });

  describe("exportCircleAnalyticsReport", () => {
    it("handles running in headless or non-browser environments gracefully", () => {
      // In Node environment without window/document, it does not throw
      assert.doesNotThrow(() => {
        exportCircleAnalyticsReport(MOCK_ANALYTICS);
      });
    });

    it("creates an iframe and triggers print in a browser-like DOM environment", () => {
      let printCalled = false;
      let focusCalled = false;
      let appendedIframe: any = null;

      const mockWindow: any = {
        focus: () => {
          focusCalled = true;
        },
        print: () => {
          printCalled = true;
        },
        addEventListener: (event: string, cb: () => void) => {
          if (event === "afterprint") {
            setTimeout(cb, 10);
          }
        },
      };

      const mockIframe: any = {
        style: {},
        setAttribute: () => {},
        parentNode: {
          removeChild: () => {},
        },
        get contentWindow() {
          return mockWindow;
        },
      };

      const originalWindow = (globalThis as any).window;
      const originalDocument = (globalThis as any).document;

      (globalThis as any).window = mockWindow;
      (globalThis as any).document = {
        createElement: (tag: string) => {
          if (tag === "iframe") {
            return mockIframe;
          }
          return {};
        },
        body: {
          appendChild: (el: any) => {
            appendedIframe = el;
            setTimeout(() => {
              if (el.onload) el.onload();
            }, 5);
          },
        },
      };

      let beforePrintCalled = false;
      let afterPrintCalled = false;

      exportCircleAnalyticsReport(MOCK_ANALYTICS, {
        onBeforePrint: () => {
          beforePrintCalled = true;
        },
        onAfterPrint: () => {
          afterPrintCalled = true;
        },
      });

      // Trigger load
      assert.ok(appendedIframe);
      assert.ok(appendedIframe.srcdoc.includes("Family savings"));
      mockIframe.onload();

      assert.ok(focusCalled);
      assert.ok(printCalled);
      assert.ok(beforePrintCalled);

      // Clean up globals
      (globalThis as any).window = originalWindow;
      (globalThis as any).document = originalDocument;
    });
  });
});
