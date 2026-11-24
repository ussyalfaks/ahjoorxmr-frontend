import { MOCK_CONTRIBUTIONS } from "@/data/contributions";
import { MOCK_PAYOUT_HISTORY } from "@/data/payouts";
import type { ExportRow } from "@/lib/export";

/** Late contributions incur this share of the contribution as a penalty. */
export const LATE_PENALTY_RATE = 0.1;

export type StatementLineType = "Contribution" | "Payout" | "Penalty";

export interface StatementLine {
  id: string;
  date: string; // YYYY-MM-DD
  circleName: string;
  circleId?: string;
  round: number;
  type: StatementLineType;
  amount: number;
  transactionHash?: string;
  href?: string;
}

export interface MonthlyStatement {
  month: string; // YYYY-MM
  openingBalance: number;
  contributions: number;
  payouts: number;
  penalties: number;
  closingBalance: number;
  groups: { circleName: string; lines: StatementLine[] }[];
  lines: StatementLine[];
}

function allLines(): StatementLine[] {
  const lines: StatementLine[] = [];
  for (const c of MOCK_CONTRIBUTIONS) {
    if (!c.date) continue;
    const base = {
      date: c.date,
      circleName: c.circleName,
      circleId: c.circleId,
      round: c.round,
      transactionHash: c.transactionHash,
      href: `/dashboard/circles/${c.circleId}`,
    };
    lines.push({ ...base, id: c.id, type: "Contribution", amount: c.amount });
    if (c.status === "late") {
      lines.push({ ...base, id: `${c.id}-penalty`, type: "Penalty", amount: +(c.amount * LATE_PENALTY_RATE).toFixed(2) });
    }
  }
  for (const p of MOCK_PAYOUT_HISTORY) {
    if (p.status !== "completed") continue;
    lines.push({
      id: p.transaction_hash,
      date: p.payout_date.slice(0, 10),
      circleName: p.circle_name,
      round: p.round_number,
      type: "Payout",
      amount: p.amount,
      transactionHash: p.transaction_hash,
      href: `/dashboard/payouts/receipt/${p.transaction_hash}`,
    });
  }
  return lines.sort((a, b) => a.date.localeCompare(b.date));
}

/** Balance held in circles: contributions add, payouts received and penalties deduct. */
function net(lines: StatementLine[]): number {
  return lines.reduce((sum, l) => sum + (l.type === "Contribution" ? l.amount : -l.amount), 0);
}

function sumOf(lines: StatementLine[], type: StatementLineType) {
  return lines.filter((l) => l.type === type).reduce((s, l) => s + l.amount, 0);
}

export function getActiveMonths(): string[] {
  return Array.from(new Set(allLines().map((l) => l.date.slice(0, 7)))).sort().reverse();
}

export function buildMonthlyStatement(month: string): MonthlyStatement {
  const lines = allLines();
  const before = lines.filter((l) => l.date.slice(0, 7) < month);
  const inMonth = lines.filter((l) => l.date.slice(0, 7) === month);
  const openingBalance = net(before);

  const groupMap = new Map<string, StatementLine[]>();
  for (const l of inMonth) {
    const key = l.circleName.toLowerCase();
    groupMap.set(key, [...(groupMap.get(key) ?? []), l]);
  }

  return {
    month,
    openingBalance,
    contributions: sumOf(inMonth, "Contribution"),
    payouts: sumOf(inMonth, "Payout"),
    penalties: sumOf(inMonth, "Penalty"),
    closingBalance: openingBalance + net(inMonth),
    groups: Array.from(groupMap.values()).map((ls) => ({ circleName: ls[0].circleName, lines: ls })),
    lines: inMonth,
  };
}

export function statementToExportRows(statement: MonthlyStatement): ExportRow[] {
  return statement.lines.map((l) => ({
    date: l.date,
    circleName: l.circleName,
    round: l.round,
    amount: `${l.type === "Contribution" ? "" : "-"}${l.amount.toFixed(2)}`,
    type: l.type,
    transactionHash: l.transactionHash ?? "",
  }));
}
