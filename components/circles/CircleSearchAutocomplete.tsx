"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Clock, Search, X } from "lucide-react";
import type { DiscoverCircle } from "@/data/circles";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRecentSearches } from "@/hooks/useRecentSearches";

const CATEGORY_LABELS: Record<string, string> = {
  family: "Family",
  friends: "Friends",
  community: "Community",
  business: "Business",
  emergency: "Emergency",
  other: "Other",
};

interface CircleSearchAutocompleteProps {
  /** The circles to build name/category suggestions from (usually the current tab's list). */
  circles: DiscoverCircle[];
  /** Called with the debounced query whenever it should be applied to the list. */
  onQueryChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CircleSearchAutocomplete({
  circles,
  onQueryChange,
  placeholder = "Search circles…",
  className = "",
}: CircleSearchAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const { recentSearches, addSearch, clearSearches } = useRecentSearches();

  // Suggestions react instantly to typing; the filter applied to the
  // circle grid/list is debounced so it doesn't re-run on every keystroke.
  const debouncedValue = useDebouncedValue(inputValue, 250);
  useEffect(() => {
    onQueryChange(debouncedValue);
  }, [debouncedValue, onQueryChange]);

  // Unique circle names + category labels, built once per circles list.
  const suggestionPool = useMemo(() => {
    const names = new Map<string, string>();
    const categories = new Map<string, string>();
    for (const c of circles) {
      names.set(c.name.toLowerCase(), c.name);
      if (c.category) {
        categories.set(c.category, CATEGORY_LABELS[c.category] ?? c.category);
      }
    }
    return [...names.values(), ...categories.values()];
  }, [circles]);

  const matchedSuggestions = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return [];
    return suggestionPool.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
  }, [suggestionPool, inputValue]);

  const showRecents = inputValue.trim().length === 0;
  const options = showRecents ? recentSearches : matchedSuggestions;

  // Close on outside click.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /** Commits a value (from a click, Enter, or a chosen suggestion) immediately, bypassing the debounce. */
  const commit = useCallback(
    (value: string) => {
      setInputValue(value);
      onQueryChange(value);
      if (value.trim()) addSearch(value.trim());
      setIsOpen(false);
      setActiveIndex(-1);
    },
    [addSearch, onQueryChange]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    setIsOpen(true);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }
    if (!options.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < options.length) {
        commit(options[activeIndex]);
      } else if (inputValue.trim()) {
        commit(inputValue.trim());
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  const activeOptionId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="text"
        role="combobox"
        aria-expanded={isOpen && options.length > 0}
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        aria-autocomplete="list"
        aria-label="Search circles"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full h-9 pl-8 pr-8 rounded-lg border border-[var(--ov-14)] bg-[var(--ov-05)] text-sm text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76] transition-colors"
      />
      {inputValue && (
        <button
          type="button"
          onClick={() => commit("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] focus-visible:outline-none"
          aria-label="Clear search"
        >
          <X size={13} aria-hidden="true" />
        </button>
      )}

      {isOpen && (options.length > 0 || showRecents) && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={showRecents ? "Recent searches" : "Search suggestions"}
          className="absolute z-20 mt-1 w-full rounded-lg border border-[var(--ov-14)] bg-[var(--content)] shadow-lg overflow-hidden"
        >
          {showRecents && (
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--ov-1a)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Recent
              </span>
              {recentSearches.length > 0 && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={clearSearches}
                  className="text-[10px] text-[var(--muted)] hover:text-[var(--text)]"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {options.length === 0 && showRecents && (
            <p className="px-3 py-2 text-xs text-[var(--muted)]">No recent searches</p>
          )}

          {options.map((opt, i) => (
            <button
              key={opt}
              id={`${listboxId}-option-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              type="button"
              onMouseDown={(e) => e.preventDefault()} // keep input focus so blur doesn't beat the click
              onClick={() => commit(opt)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                i === activeIndex
                  ? "bg-[var(--ov-14)] text-[var(--text)]"
                  : "text-[var(--text)] hover:bg-[var(--ov-07)]"
              }`}
            >
              {showRecents && (
                <Clock size={12} className="text-[var(--muted)] shrink-0" aria-hidden="true" />
              )}
              <span className="truncate">{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}