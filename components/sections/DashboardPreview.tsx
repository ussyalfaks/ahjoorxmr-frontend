const stats = [
  { label: "Total Saved", value: "$1000" },
  { label: "Members", value: "8" },
  { label: "Next Payout", value: "$10" },
  { label: "Payout Rounds", value: "3" },
];

const groupMeta = [
  { label: "Members", value: "👥 2" },
  { label: "Contributions", value: "💎 3 STRK" },
  { label: "Duration", value: "⏱ 2 Days" },
  { label: "Current Round", value: "🔄 1/3" },
];

export default function DashboardPreview() {
  return (
    <div className="flex justify-center px-6 py-[72px]">
      <div
        className="bg-[var(--card)] border border-[var(--border)] rounded-[22px] p-7 w-full max-w-[580px]"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}
        role="region"
        aria-label="Dashboard preview"
      >
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-[26px] max-sm:grid-cols-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-[var(--bg2)] border border-[var(--border)] rounded-[12px] px-3 py-4 transition-colors duration-200 hover:border-[rgba(108,92,231,0.3)]"
            >
              <div className="text-[11px] text-[var(--muted)] mb-[6px] whitespace-nowrap overflow-hidden text-ellipsis">
                {s.label}
              </div>
              <div className="font-['Sora'] text-[22px] font-bold text-[var(--text)] tracking-[-0.5px]">
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Section title */}
        <div className="font-['Sora'] text-[14px] font-semibold text-[var(--muted2)] mb-[14px] tracking-[0.3px]">
          Your Savings Groups
        </div>

        {/* Group card */}
        <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-[14px] px-5 py-[18px]">
          {/* Group header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 font-['Sora'] font-semibold text-[15px] text-[var(--text)] mb-1">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "#4ade80", boxShadow: "0 0 8px rgba(74,222,128,0.5)" }}
                aria-hidden="true"
              />
              Family savings
              <span className="bg-[rgba(74,222,128,0.12)] text-[var(--success)] text-[11px] font-semibold px-[9px] py-[2px] rounded-full border border-[rgba(74,222,128,0.25)]">
                Active
              </span>
            </div>
            <div className="text-[13px] text-[var(--muted)]">Ongoing Circle</div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-4 gap-3 mb-4 max-sm:grid-cols-2">
            {groupMeta.map((m) => (
              <div key={m.label}>
                <div className="text-[11px] text-[var(--muted)] mb-[3px]">{m.label}</div>
                <div className="font-['Sora'] text-[13px] font-semibold text-[var(--text)]">{m.value}</div>
              </div>
            ))}
          </div>

          {/* View details button */}
          <button
            className="bg-[rgba(108,92,231,0.15)] border border-[rgba(108,92,231,0.3)] text-[#8b7cf8] px-4 py-2 rounded-[8px] font-['Sora'] text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[rgba(108,92,231,0.25)] hover:border-[#6c5ce7]"
            type="button"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}
