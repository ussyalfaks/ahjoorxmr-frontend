"use client";

import { useId } from "react";
import { Globe } from "lucide-react";
import { useTimezone } from "@/hooks/useTimezone";
import {
  COMMON_TIMEZONES,
  getDefaultTimezone,
  getTimezoneAbbreviation,
  formatTimeWithTz,
} from "@/lib/timezone";

export default function TimezoneSetting() {
  const { timezone, setTimezone, timezoneAbbr } = useTimezone();
  const selectId = useId();
  const browserDefault = getDefaultTimezone();

  // Ensure current timezone and browser default are in the list
  const options = [...COMMON_TIMEZONES];
  if (!options.some((opt) => opt.value === timezone)) {
    options.unshift({ value: timezone, label: `${timezone} (Current)` });
  }
  if (!options.some((opt) => opt.value === browserDefault)) {
    options.unshift({ value: browserDefault, label: `${browserDefault} (Browser Default)` });
  }

  const now = new Date();
  const currentTimeDisplay = formatTimeWithTz(now, timezone);

  return (
    <div className="pt-4 border-t border-[var(--ov-10)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-start gap-2">
          <Globe size={16} className="text-[var(--muted)] mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <span className="block text-sm font-semibold text-[var(--text)]">
              Timezone
            </span>
            <span className="block text-xs text-[var(--muted)] mt-0.5">
              All deadlines, countdowns, and payout times will display in this timezone.
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--ov-0a)] text-[var(--text)] border border-[var(--ov-10)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" aria-hidden="true" />
            {currentTimeDisplay}
          </span>
        </div>
      </div>

      <div className="mt-2">
        <label htmlFor={selectId} className="sr-only">
          Select timezone
        </label>
        <select
          id={selectId}
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full sm:w-auto min-w-[280px] bg-[var(--modal)] border border-[var(--ov-14)] rounded-xl px-3.5 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76] cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} {opt.value === browserDefault ? "★ (Browser)" : ""}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-[var(--faint)]">
          Abbreviation: <strong className="text-[var(--text)]">{timezoneAbbr}</strong> &middot; Default: {browserDefault}
        </p>
      </div>
    </div>
  );
}
