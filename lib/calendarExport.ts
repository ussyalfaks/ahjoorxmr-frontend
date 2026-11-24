/**
 * calendarExport.ts
 * Generates RFC 5545 iCalendar (.ics) files for circle deadlines and payout dates,
 * respecting the user's chosen timezone.
 */

import { getTimezone } from "./timezone";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
}

/**
 * Formats a Date object into local date-time string YYYYMMDDTHHMMSS
 * in the specified timezone for iCalendar.
 */
export function formatIcsDateTime(date: Date, timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(date);

    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "00";
    const year = getPart("year");
    const month = getPart("month");
    const day = getPart("day");
    let hour = getPart("hour");
    if (hour === "24") hour = "00";
    const minute = getPart("minute");
    const second = getPart("second");

    return `${year}${month}${day}T${hour}${minute}${second}`;
  } catch {
    // Fallback to UTC ISO
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }
}

/**
 * Generates iCalendar (.ics) format string for the given events using the chosen timezone.
 */
export function generateCalendarIcs(events: CalendarEvent[], timeZone?: string): string {
  const tz = timeZone || getTimezone();
  const now = new Date();
  const nowUtc = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ahjoor//Rotating Savings Platform//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-TIMEZONE:${tz}`,
    `X-WR-CALNAME:Ahjoor Circle Deadlines`,
  ];

  for (const event of events) {
    const startFormatted = formatIcsDateTime(event.startDate, tz);
    const end = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000); // default 1h
    const endFormatted = formatIcsDateTime(end, tz);

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.id}@ahjoor.app`);
    lines.push(`DTSTAMP:${nowUtc}`);
    lines.push(`DTSTART;TZID=${tz}:${startFormatted}`);
    lines.push(`DTEND;TZID=${tz}:${endFormatted}`);
    lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
    }
    if (event.location) {
      lines.push(`LOCATION:${escapeIcsText(event.location)}`);
    }
    lines.push("STATUS:CONFIRMED");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Initiates client-side download of a .ics file.
 */
export function downloadIcsFile(filename: string, content: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
