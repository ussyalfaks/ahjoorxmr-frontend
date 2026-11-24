"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DateRangePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Select date range",
  disabled = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const [selectingEnd, setSelectingEnd] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days: Date[] = [];
    
    // Add empty slots for days before the first day of the month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(new Date(year, month, -(firstDayOfWeek - i - 1)));
    }

    // Add all days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isInRange = (date: Date): boolean => {
    if (!value.startDate || !value.endDate) return false;
    return date >= value.startDate && date <= value.endDate;
  };

  const isDisabledDate = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDisabledDate(date)) return;

    if (!value.startDate || (value.startDate && value.endDate) || selectingEnd) {
      onChange({ startDate: date, endDate: null });
      setSelectingEnd(false);
    } else {
      if (date >= value.startDate) {
        onChange({ startDate: value.startDate, endDate: date });
        setIsOpen(false);
      } else {
        onChange({ startDate: date, endDate: value.startDate });
        setIsOpen(false);
      }
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, date: Date) => {
    let newFocusedDate: Date | null = null;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        handleDateClick(date);
        break;
      case "ArrowLeft":
        e.preventDefault();
        newFocusedDate = new Date(date);
        newFocusedDate.setDate(date.getDate() - 1);
        break;
      case "ArrowRight":
        e.preventDefault();
        newFocusedDate = new Date(date);
        newFocusedDate.setDate(date.getDate() + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        newFocusedDate = new Date(date);
        newFocusedDate.setDate(date.getDate() - 7);
        break;
      case "ArrowDown":
        e.preventDefault();
        newFocusedDate = new Date(date);
        newFocusedDate.setDate(date.getDate() + 7);
        break;
      case "Home":
        e.preventDefault();
        newFocusedDate = new Date(date.getFullYear(), date.getMonth(), 1);
        break;
      case "End":
        e.preventDefault();
        newFocusedDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
    }

    if (newFocusedDate) {
      setFocusedDate(newFocusedDate);
      // Change month if necessary
      if (newFocusedDate.getMonth() !== currentMonth.getMonth()) {
        setCurrentMonth(new Date(newFocusedDate.getFullYear(), newFocusedDate.getMonth()));
      }
    }
  };

  const formatDateRange = (): string => {
    if (!value.startDate) return placeholder;
    const start = value.startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (!value.endDate) return start;
    const end = value.endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${start} - ${end}`;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label="Select date range"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 dark:border-[var(--border)] bg-white dark:bg-[var(--content)] px-3 py-2 text-sm text-gray-900 dark:text-[var(--text)] hover:border-gray-400 dark:hover:border-[var(--muted)] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={!value.startDate ? "text-gray-400 dark:text-[var(--muted)]" : ""}>
          {formatDateRange()}
        </span>
        <Calendar className="h-4 w-4 text-gray-400 dark:text-[var(--muted)]" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Date range picker"
          className="absolute z-50 mt-2 rounded-lg border border-gray-200 dark:border-[var(--border)] bg-white dark:bg-[var(--content)] p-4 shadow-lg"
        >
          {/* Month Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-[var(--hover)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-[var(--text)]" />
            </button>
            <h2
              className="text-sm font-semibold text-gray-900 dark:text-[var(--text)]"
              aria-live="polite"
            >
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-[var(--hover)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-[var(--text)]" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 dark:text-[var(--muted)]"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div
            className="grid grid-cols-7 gap-1"
            role="grid"
            aria-label="Calendar dates"
          >
            {days.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isSelected = value.startDate && isSameDay(date, value.startDate);
              const isEndDate = value.endDate && isSameDay(date, value.endDate);
              const inRange = isInRange(date);
              const disabled = isDisabledDate(date);
              const isFocused = focusedDate && isSameDay(date, focusedDate);

              return (
                <div
                  key={index}
                  role="gridcell"
                  tabIndex={isCurrentMonth && !disabled ? 0 : -1}
                  onClick={() => isCurrentMonth && handleDateClick(date)}
                  onKeyDown={(e) => isCurrentMonth && handleKeyDown(e, date)}
                  aria-label={date.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  aria-selected={Boolean(isSelected || isEndDate)}
                  aria-disabled={disabled}
                  className={`
                    flex h-8 w-8 items-center justify-center rounded text-sm
                    ${!isCurrentMonth ? "text-gray-300 dark:text-[var(--faint)]" : ""}
                    ${isSelected || isEndDate ? "bg-blue-600 text-white font-semibold" : ""}
                    ${inRange && !isSelected && !isEndDate ? "bg-blue-100 dark:bg-blue-900/30" : ""}
                    ${!disabled && isCurrentMonth && !isSelected && !isEndDate && !inRange ? "hover:bg-gray-100 dark:hover:bg-[var(--hover)] text-gray-900 dark:text-[var(--text)] cursor-pointer" : ""}
                    ${disabled ? "text-gray-300 dark:text-[var(--faint)] cursor-not-allowed" : ""}
                    ${isFocused ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[var(--content)]" : ""}
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[var(--content)]
                  `}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>

          {/* Quick Select Options */}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 dark:border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                onChange({ startDate: today, endDate: today });
                setIsOpen(false);
              }}
              className="rounded px-2 py-1 text-xs text-gray-600 dark:text-[var(--text)] hover:bg-gray-100 dark:hover:bg-[var(--hover)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const lastWeek = new Date(today);
                lastWeek.setDate(today.getDate() - 7);
                onChange({ startDate: lastWeek, endDate: today });
                setIsOpen(false);
              }}
              className="rounded px-2 py-1 text-xs text-gray-600 dark:text-[var(--text)] hover:bg-gray-100 dark:hover:bg-[var(--hover)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const lastMonth = new Date(today);
                lastMonth.setDate(today.getDate() - 30);
                onChange({ startDate: lastMonth, endDate: today });
                setIsOpen(false);
              }}
              className="rounded px-2 py-1 text-xs text-gray-600 dark:text-[var(--text)] hover:bg-gray-100 dark:hover:bg-[var(--hover)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Last 30 Days
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
