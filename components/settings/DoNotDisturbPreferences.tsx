"use client";

import { useEffect, useState } from "react";
import { Moon } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import { useToast } from "@/components/ui/Toast";
import {
  DEFAULT_DND_SCHEDULE,
  DND_EXEMPTABLE_TYPES,
  getDndSchedule,
  getLocalTimezone,
  isWithinQuietHours,
  saveDndSchedule,
  type DndSchedule,
} from "@/lib/doNotDisturb";
import type { NotificationType } from "@/types/notification";

const DAYS = [
  { value: 1, short: "Mon", long: "Monday" },
  { value: 2, short: "Tue", long: "Tuesday" },
  { value: 3, short: "Wed", long: "Wednesday" },
  { value: 4, short: "Thu", long: "Thursday" },
  { value: 5, short: "Fri", long: "Friday" },
  { value: 6, short: "Sat", long: "Saturday" },
  { value: 0, short: "Sun", long: "Sunday" },
];

export default function DoNotDisturbPreferences() {
  const { showToast } = useToast();
  const [schedule, setSchedule] = useState<DndSchedule>(DEFAULT_DND_SCHEDULE);
  const [savedSchedule, setSavedSchedule] = useState<DndSchedule>(DEFAULT_DND_SCHEDULE);
  const [timezone, setTimezone] = useState("local time");

  useEffect(() => {
    const stored = getDndSchedule();
    setSchedule(stored);
    setSavedSchedule(stored);
    setTimezone(getLocalTimezone());
  }, []);

  const update = (patch: Partial<DndSchedule>) => setSchedule((s) => ({ ...s, ...patch }));

  const toggleDay = (day: number) =>
    update({
      days: schedule.days.includes(day) ? schedule.days.filter((d) => d !== day) : [...schedule.days, day],
    });

  const toggleExempt = (type: NotificationType, exempt: boolean) =>
    update({
      exemptTypes: exempt
        ? [...schedule.exemptTypes, type]
        : schedule.exemptTypes.filter((t) => t !== type),
    });

  const invalid = schedule.enabled && (schedule.start === schedule.end || schedule.days.length === 0);
  const dirty = JSON.stringify(schedule) !== JSON.stringify(savedSchedule);
  const activeNow = isWithinQuietHours(savedSchedule);

  const handleSave = () => {
    if (invalid) return;
    saveDndSchedule(schedule);
    setSavedSchedule(schedule);
    showToast({
      title: schedule.enabled ? "Do Not Disturb scheduled" : "Do Not Disturb turned off",
      message: schedule.enabled
        ? `Quiet hours ${schedule.start}–${schedule.end} (${timezone}).`
        : "You'll receive push and sound alerts as they happen.",
      variant: "success",
    });
  };

  return (
    <section className="p-6 rounded-2xl bg-[var(--content)] border border-[var(--ov-10)] space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold font-sora text-[var(--text)] flex items-center gap-2">
            <Moon size={18} aria-hidden="true" />
            Do Not Disturb
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Silence push and sound alerts during quiet hours. Anything that arrives is held and
            shows up in your notification center when quiet hours end.
          </p>
        </div>
        {activeNow && (
          <span className="shrink-0 rounded-full bg-[#4B6B76]/15 px-2.5 py-1 text-xs font-medium text-[#4B6B76]">
            Active now
          </span>
        )}
      </div>

      <Toggle
        id="dnd-enabled"
        checked={schedule.enabled}
        onChange={(enabled) => update({ enabled })}
        label="Enable quiet hours"
        description={`Times use your timezone: ${timezone}`}
      />

      <fieldset disabled={!schedule.enabled} className="space-y-5 disabled:opacity-50">
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="dnd-start" className="block text-xs text-[var(--muted)] mb-1.5">
              Starts
            </label>
            <input
              id="dnd-start"
              type="time"
              value={schedule.start}
              onChange={(e) => update({ start: e.target.value })}
              className="bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-2.5 text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
            />
          </div>
          <div>
            <label htmlFor="dnd-end" className="block text-xs text-[var(--muted)] mb-1.5">
              Ends
            </label>
            <input
              id="dnd-end"
              type="time"
              value={schedule.end}
              onChange={(e) => update({ end: e.target.value })}
              className="bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-2.5 text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
            />
          </div>
        </div>
        {schedule.end < schedule.start && (
          <p className="-mt-3 text-xs text-[var(--muted)]">Overnight: ends the following morning.</p>
        )}

        <fieldset>
          <legend className="text-xs text-[var(--muted)] mb-2">On these days</legend>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const selected = schedule.days.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  aria-pressed={selected}
                  aria-label={day.long}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
                    selected
                      ? "bg-[#4B6B76] text-white"
                      : "bg-[var(--ov-0a)] text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {day.short}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-1">
          <legend className="text-xs text-[var(--muted)] mb-1">Critical alerts that still come through</legend>
          {DND_EXEMPTABLE_TYPES.map((item) => (
            <Toggle
              key={item.type}
              id={`dnd-exempt-${item.type}`}
              checked={schedule.exemptTypes.includes(item.type)}
              onChange={(checked) => toggleExempt(item.type, checked)}
              label={item.label}
              description={item.description}
            />
          ))}
        </fieldset>
      </fieldset>

      {invalid && (
        <p role="alert" className="text-xs text-red-400">
          {schedule.days.length === 0 ? "Pick at least one day." : "Start and end times must be different."}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={!dirty || invalid}
        className="rounded-lg bg-[#4B6B76] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3D5A64] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
      >
        Save quiet hours
      </button>
    </section>
  );
}
