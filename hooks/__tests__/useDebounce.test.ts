import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useState, useEffect } from "react";

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

describe("useDebouncedValue", () => {
  it("updates value after specified delay", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ val, delay }: { val: string; delay: number }) => useDebouncedValue(val, delay),
      { initialProps: { val: "hello", delay: 300 } }
    );

    expect(result.current).toBe("hello");

    rerender({ val: "world", delay: 300 });
    expect(result.current).toBe("hello");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("world");
    vi.useRealTimers();
  });
});
