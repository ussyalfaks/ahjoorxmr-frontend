"use client";

export interface ChartTableColumn {
  key: string;
  label: string;
  /** Right-align numeric columns. */
  numeric?: boolean;
}

export type ChartTableRow = Record<string, string | number>;

interface ChartViewToggleProps {
  showTable: boolean;
  onToggle: () => void;
  /** id of the table region the toggle controls. */
  controls: string;
}

/** "View as table" / "View as chart" switch shared by every chart. */
export function ChartViewToggle({ showTable, onToggle, controls }: ChartViewToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={showTable}
      // Only reference the table while it is rendered; a dangling id is invalid ARIA.
      aria-controls={showTable ? controls : undefined}
      className="rounded-full border border-[var(--ov-14)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
    >
      {showTable ? "View as chart" : "View as table"}
    </button>
  );
}

interface ChartDataTableProps {
  id: string;
  caption: string;
  columns: ChartTableColumn[];
  rows: ChartTableRow[];
}

/** Accessible data-table alternative to a chart, rendering the same data. */
export default function ChartDataTable({ id, caption, columns, rows }: ChartDataTableProps) {
  return (
    <div id={id} className="overflow-x-auto rounded-[1.5rem] border border-[var(--ov-10)] bg-[var(--surface)]">
      <table className="w-full text-left text-sm">
        <caption className="px-4 pt-4 text-left text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)] sm:px-6">
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-[var(--ov-10)]">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-3 font-medium text-[var(--muted)] sm:px-6 ${column.numeric ? "text-right" : ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-[var(--ov-06)] last:border-b-0">
              {columns.map((column, columnIndex) => {
                const value = row[column.key];
                const className = `px-4 py-3 text-[var(--text)] sm:px-6 ${column.numeric ? "text-right tabular-nums" : ""}`;
                return columnIndex === 0 ? (
                  <th key={column.key} scope="row" className={`${className} font-medium`}>
                    {value}
                  </th>
                ) : (
                  <td key={column.key} className={className}>
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
