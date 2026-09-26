"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value`, but only updates its own copy after `delay` ms have
 * passed without `value` changing again. Use it to avoid re-filtering
 * or re-fetching on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}