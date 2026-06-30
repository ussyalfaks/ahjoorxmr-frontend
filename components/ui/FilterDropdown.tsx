"use client";

import { useEffect, useRef, useState } from "react";

export type FilterOption = "all" | "your_turn" | "waiting" | "completed";

const FILTER_LABELS: Record<FilterOption, string> = {
  all: "All",
  your_turn: "Your Turn",
  waiting: "Waiting",
  completed: "Completed",
};

const FILTER_OPTIONS: FilterOption[] = ["all", "your_turn", "waiting", "completed"];

interface FilterDropdownProps {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
}

export function FilterDropdown({ value, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = value !== "all";

  return (
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm sm:w-40 ${
          isActive
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span>{FILTER_LABELS[value]}</span>
        {isActive && (
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden />
        )}
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-10 mt-1 w-full sm:w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          {FILTER_OPTIONS.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={value === option}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                  value === option
                    ? "font-medium text-blue-700"
                    : "text-gray-700"
                }`}
              >
                {FILTER_LABELS[option]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}