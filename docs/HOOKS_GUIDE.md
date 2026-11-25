# React Hooks Development Guide (Issue #321)

This document provides comprehensive guidance on writing, testing, and maintaining custom React hooks throughout the Ahjoor Frontend project.

---

## Table of Contents

1. [Hook Fundamentals](#hook-fundamentals)
2. [Naming Conventions](#naming-conventions)
3. [Creating Custom Hooks](#creating-custom-hooks)
4. [Hook Patterns & Best Practices](#hook-patterns--best-practices)
5. [Data Fetching Hooks](#data-fetching-hooks)
6. [State Management Hooks](#state-management-hooks)
7. [Effect Cleanup & Dependencies](#effect-cleanup--dependencies)
8. [Testing Hooks](#testing-hooks)
9. [Performance Optimization](#performance-optimization)
10. [Common Pitfalls](#common-pitfalls)

---

## Hook Fundamentals

Hooks are functions that "hook into" React features. They allow you to use state and other React features without writing class components. All hooks in this project are custom, isolated, and follow React's official guidelines.

### React Hook Rules

1. **Only call hooks at the top level** — Don't call them inside loops, conditions, or nested functions.
2. **Only call hooks from React components** — Call them from functional components or custom hooks, not regular JavaScript functions.
3. **Use the ESLint plugin** — Enforce hook rules with `eslint-plugin-react-hooks`.

---

## Naming Conventions

All custom hooks follow this naming pattern:

```
use<Feature><Behavior>
```

### Examples

| Hook Name | Purpose |
| --- | --- |
| `useBookmarks` | Manage user's bookmarked circles |
| `useDebouncedValue` | Debounce input values with delay |
| `useNumberFormat` | Format numbers with locale support |
| `useFeatureSpotlight` | Manage feature spotlight visibility state |
| `useCircleChainState` | Manage circle's blockchain chain state |
| `useLoadMore` | Handle paginated "load more" UI pattern |

---

## Creating Custom Hooks

### Hook Structure

```typescript
// hooks/useMyHook.ts

import { useState, useEffect, useCallback } from "react";

interface UseMyHookOptions {
  // Configuration options
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseMyHookReturn {
  data: any | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing data.
 *
 * @param options - Configuration options
 * @returns Hook state and methods
 */
export function useMyHook(options: UseMyHookOptions = {}): UseMyHookReturn {
  const { enabled = true, onSuccess, onError } = options;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchData(); // Your data source
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [enabled, onSuccess, onError]);

  useEffect(() => {
    if (enabled) {
      refetch();
    }
  }, [enabled, refetch]);

  return { data, loading, error, refetch };
}
```

### Key Elements

1. **Clear Interface Definitions**: Use TypeScript interfaces for options and return types
2. **JSDoc Comments**: Document purpose, parameters, and return values
3. **Explicit Return Types**: Always type the hook's return value
4. **Configuration Options**: Accept flexible options object instead of multiple parameters
5. **Callback Handlers**: Support success and error callbacks for integration

---

## Hook Patterns & Best Practices

### Pattern 1: Fetch & Cache

```typescript
export function useCircles() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef<Circle[] | null>(null);

  useEffect(() => {
    // Return cached data if available
    if (cacheRef.current) {
      setCircles(cacheRef.current);
      return;
    }

    const fetchCircles = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getCircles();
        cacheRef.current = data;
        setCircles(data);
      } finally {
        setLoading(false);
      }
    };

    fetchCircles();
  }, []);

  return { circles, loading };
}
```

### Pattern 2: Debounced Value

```typescript
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

### Pattern 3: Toggleable State

```typescript
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  const set = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []);

  return [value, toggle, set];
}
```

### Pattern 4: Local Storage Sync

```typescript
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback(
    (val: T | ((prev: T) => T)) => {
      try {
        const valueToStore = val instanceof Function ? val(value) : val;
        setValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    },
    [key, value]
  );

  return [value, setStoredValue] as const;
}
```

---

## Data Fetching Hooks

For hooks that fetch data, follow these patterns:

```typescript
interface UseDataHookOptions {
  enabled?: boolean;
  cacheTime?: number;
  staleTime?: number;
  retry?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useData(id: string, options: UseDataHookOptions = {}) {
  const { enabled = true, onSuccess, onError, retry = 3 } = options;
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const retryCount = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      dispatch({ type: "LOADING" });

      try {
        const data = await apiClient.getData(id);
        dispatch({ type: "SUCCESS", payload: data });
        onSuccess?.(data);
        retryCount.current = 0;
      } catch (error) {
        if (retryCount.current < retry) {
          retryCount.current++;
          setTimeout(fetchData, 1000 * retryCount.current); // Exponential backoff
        } else {
          const err = error instanceof Error ? error : new Error(String(error));
          dispatch({ type: "ERROR", payload: err });
          onError?.(err);
        }
      }
    };

    fetchData();
  }, [id, enabled, onSuccess, onError, retry]);

  return state;
}
```

---

## State Management Hooks

For complex state logic, use `useReducer`:

```typescript
type Action = 
  | { type: "SET_VALUE"; payload: any }
  | { type: "RESET" }
  | { type: "ERROR"; payload: Error };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_VALUE":
      return { ...state, value: action.payload };
    case "RESET":
      return initialState;
    case "ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function useFormState(initial: State) {
  const [state, dispatch] = useReducer(reducer, initial);
  
  const setValue = useCallback((payload: any) => {
    dispatch({ type: "SET_VALUE", payload });
  }, []);

  return { state, setValue, dispatch };
}
```

---

## Effect Cleanup & Dependencies

### Cleanup Pattern

```typescript
// Always clean up side effects
useEffect(() => {
  const subscription = dataSource.subscribe(handleUpdate);
  
  return () => {
    // Cleanup: unsubscribe
    subscription.unsubscribe();
  };
}, []);

// Cleanup timers
useEffect(() => {
  const timer = setTimeout(() => {
    // Do something
  }, 1000);

  return () => clearTimeout(timer);
}, []);

// Cleanup event listeners
useEffect(() => {
  const handleResize = () => {
    // Handle resize
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```

### Dependency Array Best Practices

```typescript
// ❌ WRONG: Missing dependencies
useEffect(() => {
  console.log(value); // 'value' is not in dependencies
}, []);

// ✅ CORRECT: Include all dependencies
useEffect(() => {
  console.log(value);
}, [value]);

// ✅ CORRECT: Use useCallback for stable function references
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]); // Only recreated when 'value' changes

useEffect(() => {
  element.addEventListener("click", handleClick);
  return () => element.removeEventListener("click", handleClick);
}, [handleClick]);
```

---

## Testing Hooks

### Hook Testing Setup

```typescript
// hooks/__tests__/useMyHook.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useMyHook } from "../useMyHook";

describe("useMyHook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() => useMyHook());
    
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("updates state when enabled", async () => {
    const { result } = renderHook(() => useMyHook({ enabled: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
      expect(result.current.loading).toBe(false);
    });
  });

  it("calls onSuccess callback when data is fetched", async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useMyHook({ onSuccess }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("handles errors gracefully", async () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useMyHook({ onError }));

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(onError).toHaveBeenCalled();
    });
  });

  it("refetch works correctly", async () => {
    const { result } = renderHook(() => useMyHook());

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toBeDefined();
  });
});
```

---

## Performance Optimization

### Memoization

```typescript
// Use useMemo to prevent unnecessary recalculations
export function useExpensiveCalculation(data: Data[]) {
  const result = useMemo(() => {
    return data.reduce((acc, item) => acc + item.value, 0);
  }, [data]);

  return result;
}

// Use useCallback to prevent unnecessary re-renders of children
export function useHandler() {
  const handleClick = useCallback(() => {
    console.log("Clicked");
  }, []);

  return handleClick;
}
```

### Lazy Initialization

```typescript
// Initialize state lazily to avoid expensive calculations on every render
export function useHeavyState(initialExpensiveValue: () => ExpensiveType) {
  const [state, setState] = useState(() => initialExpensiveValue());
  return [state, setState];
}
```

---

## Common Pitfalls

### Pitfall 1: Infinite Loops

```typescript
// ❌ WRONG: Dependencies not included
useEffect(() => {
  setData(fetchedData);
}, []); // Missing 'fetchedData' as dependency

// ✅ CORRECT: Include all dependencies
useEffect(() => {
  setData(fetchedData);
}, [fetchedData]);
```

### Pitfall 2: Stale Closures

```typescript
// ❌ WRONG: Callback captures stale value
function useBadCallback(value: number) {
  const callback = () => console.log(value);
  return callback;
}

// ✅ CORRECT: Update callback when value changes
function useGoodCallback(value: number) {
  const callback = useCallback(() => {
    console.log(value);
  }, [value]);
  return callback;
}
```

### Pitfall 3: Missing Cleanup

```typescript
// ❌ WRONG: Event listener not cleaned up
useEffect(() => {
  window.addEventListener("resize", handleResize);
}, []);

// ✅ CORRECT: Clean up event listener
useEffect(() => {
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```

### Pitfall 4: Conditional Hook Calls

```typescript
// ❌ WRONG: Hooks called conditionally
if (shouldFetch) {
  useData();
}

// ✅ CORRECT: Pass condition as option
useData({ enabled: shouldFetch });
```

---

## File Organization

```
hooks/
├── __tests__/
│   ├── useBookmarks.test.ts
│   ├── useData.test.ts
│   └── ...
├── useBookmarks.ts
├── useCircleChainState.ts
├── useData.ts
└── ... (other hooks)
```

---

## Checklist for New Hooks

- [ ] Hook starts with `use` prefix
- [ ] TypeScript interfaces defined for options and return type
- [ ] JSDoc comments included
- [ ] All React Hook Rules followed (no conditional calls)
- [ ] Dependencies array correctly specified
- [ ] Cleanup functions in useEffect where needed
- [ ] Error handling implemented
- [ ] Loading state included (if async)
- [ ] Unit tests written and passing
- [ ] No circular dependencies with other hooks

