import { describe, expect, it } from "vitest";
import { buildCsv, buildPrintableHtml, type ExportColumn } from "./export";
import { buildSettlementReport } from "./settlementReport";

describe("buildSettlementReport", () => {
  it("calculates member credits and refunds and reconciles the total", () => {
    const report = buildSettlementReport(
      [
        { address: "member-1", totalContributed: 100, payoutReceived: 120, penalties: 0 },
        { address: "member-2", totalContributed: 100, payoutReceived: 80, penalties: 0 },
      ],
      "USDT"
    );

    expect(report.members.map((member) => member.creditOrRefund)).toEqual([20, -20]);
    expect(report.totals).toEqual({
      totalContributed: 200,
      payoutReceived: 200,
      penalties: 0,
      creditOrRefund: 0,
    });
    expect(report.reconciled).toBe(true);
  });

  it("includes assessed penalties and flags non-zero circle balances", () => {
    const report = buildSettlementReport(
      [
        { address: "member-1", totalContributed: 100, payoutReceived: 110, penalties: 10 },
        { address: "member-2", totalContributed: 100, payoutReceived: 110, penalties: 10 },
      ],
      "USDT"
    );
    const unbalanced = buildSettlementReport(
      [{ address: "member-1", totalContributed: 100, payoutReceived: 90, penalties: 0 }],
      "USDT"
    );

    expect(report.totals).toMatchObject({ penalties: 20, creditOrRefund: 0 });
    expect(report.reconciled).toBe(true);
    expect(unbalanced.reconciled).toBe(false);
  });

  it("rejects invalid monetary inputs", () => {
    expect(() =>
      buildSettlementReport(
        [{ address: "member-1", totalContributed: -1, payoutReceived: 0, penalties: 0 }],
        "USDT"
      )
    ).toThrow(RangeError);
  });
});

describe("settlement export columns", () => {
  const columns: ExportColumn[] = [
    { key: "member", label: "Member" },
    { key: "creditOrRefund", label: "Credit / (Refund)" },
  ];
  const rows = [{ member: "Member 1", creditOrRefund: "20 USDT credit" }];

  it("uses supplied report columns in CSV and printable PDF content", () => {
    expect(buildCsv(rows, columns)).toContain("Member,Credit / (Refund)");
    expect(buildCsv(rows, columns)).toContain("Member 1,20 USDT credit");

    const html = buildPrintableHtml(rows, "Settlement", "Circle settlement", columns);
    expect(html).toContain("<th>Credit / (Refund)</th>");
    expect(html).toContain('<td class="">20 USDT credit</td>');
  });
});
