"use client";

import { useEffect, useState } from "react";
import {
  getTimezone,
  setTimezone,
  getTimezoneAbbreviation,
  formatTimeWithTz,
  formatDateTimeWithTz,
  formatDeadlineWithTz,
  TIMEZONE_UPDATED_EVENT,
} from "@/lib/timezone";

export function useTimezone() {
  const [currentTz, setCurrentTz] = useState<string>(() => getTimezone());

  useEffect(() => {
    setCurrentTz(getTimezone());

    const handleUpdate = () => {
      setCurrentTz(getTimezone());
    };

    window.addEventListener(TIMEZONE_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(TIMEZONE_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const changeTimezone = (newTz: string) => {
    setTimezone(newTz);
    setCurrentTz(newTz);
  };

  const abbr = getTimezoneAbbreviation(new Date(), currentTz);

  return {
    timezone: currentTz,
    setTimezone: changeTimezone,
    timezoneAbbr: abbr,
    formatTime: (d: Date | string | number, opts?: Intl.DateTimeFormatOptions) =>
      formatTimeWithTz(d, currentTz, opts),
    formatDateTime: (d: Date | string | number, opts?: Intl.DateTimeFormatOptions) =>
      formatDateTimeWithTz(d, currentTz, opts),
    formatDeadline: (d: Date | string | number | null | undefined) =>
      formatDeadlineWithTz(d, currentTz),
  };
}
