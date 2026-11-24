"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, FileText, Printer } from "lucide-react";
import { buildFilename, exportCsv, exportPdf } from "@/lib/export";
import { buildMonthlyStatement, getActiveMonths, statementToExportRows } from "@/lib/statements";

const money = (n: number) => `$${n.toFixed(2)}`;

function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function StatementsPage() {
  const activeMonths = useMemo(() => getActiveMonths(), []);
  const [month, setMonth] = useState(activeMonths[0] ?? new Date().toISOString().slice(0, 7));
  const statement = useMemo(() => buildMonthlyStatement(month), [month]);
  const title = `Account statement — ${monthLabel(month)}`;

  function downloadPdf() {
    exportPdf(
      statementToExportRows(statement),
      title,
      `Opening ${money(statement.openingBalance)} · Contributions ${money(statement.contributions)} · Payouts ${money(statement.payouts)} · Penalties ${money(statement.penalties)} · Closing ${money(statement.closingBalance)}`
    );
  }

  const summary = [
    { label: "Opening balance", value: statement.openingBalance },
    { label: "Contributions", value: statement.contributions },
    { label: "Payouts received", value: statement.payouts },
    { label: "Penalties", value: statement.penalties },
    { label: "Closing balance", value: statement.closingBalance },
  ];

  return (
    <div className="space-y-6 print:text-black">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sora text-[var(--text)] print:text-black">{title}</h1>
          <p className="text-sm text-[var(--muted)]">All contributions, payouts and penalties across your circles.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <label className="text-sm text-[var(--muted)] flex items-center gap-2">
            Month
            <input
              type="month"
              value={month}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
              className="bg-[var(--content)] text-[var(--text)] rounded-lg px-3 py-2"
            />
          </label>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-sm text-[var(--text)]">
            <Printer size={14} aria-hidden="true" /> Print
          </button>
          <button onClick={downloadPdf} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-sm text-[var(--text)]">
            <FileText size={14} aria-hidden="true" /> PDF
          </button>
          <button
            onClick={() => exportCsv(statementToExportRows(statement), buildFilename("statement", month, "csv"))}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-sm text-[var(--text)]"
          >
            <Download size={14} aria-hidden="true" /> CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {summary.map((s) => (
          <div key={s.label} className="rounded-xl bg-[var(--content)] p-4 print:border print:border-gray-300">
            <p className="text-xs text-[var(--muted)]">{s.label}</p>
            <p className="text-lg font-semibold text-[var(--text)] print:text-black">{money(s.value)}</p>
          </div>
        ))}
      </div>

      {statement.lines.length === 0 ? (
        <div className="rounded-xl bg-[var(--content)] p-10 text-center">
          <p className="text-[var(--text)] font-medium">No activity in {monthLabel(month)}</p>
          <p className="text-sm text-[var(--muted)] mt-1">
            {activeMonths.length > 0 ? (
              <>
                Try{" "}
                <button className="underline" onClick={() => setMonth(activeMonths[0])}>
                  {monthLabel(activeMonths[0])}
                </button>
                , your most recent month with activity.
              </>
            ) : (
              "Contributions, payouts and penalties will appear here."
            )}
          </p>
        </div>
      ) : (
        statement.groups.map((g) => (
          <section key={g.circleName} className="rounded-xl bg-[var(--content)] p-5 print:border print:border-gray-300 break-inside-avoid">
            <h2 className="font-semibold font-sora text-[var(--text)] print:text-black mb-3">{g.circleName}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-[var(--muted)]">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Round</th>
                    <th className="py-2 pr-3 text-right">Amount</th>
                    <th className="py-2">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {g.lines.map((l) => (
                    <tr key={l.id} className="border-t border-[var(--ov-0f)] text-[var(--text)] print:text-black">
                      <td className="py-2 pr-3">{l.date}</td>
                      <td className="py-2 pr-3">{l.type}</td>
                      <td className="py-2 pr-3">#{l.round}</td>
                      <td className={`py-2 pr-3 text-right ${l.type === "Contribution" ? "" : "text-red-500"}`}>
                        {l.type === "Contribution" ? "+" : "−"}
                        {money(l.amount)}
                      </td>
                      <td className="py-2 font-mono text-xs">
                        {l.transactionHash && l.href ? (
                          <Link href={l.href} className="text-[#4B6B76] hover:underline">
                            {l.transactionHash.slice(0, 10)}…
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
