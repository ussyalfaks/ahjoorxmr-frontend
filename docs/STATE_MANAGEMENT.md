# State Management Patterns (Issue #337)

This document outlines recommended patterns and best practices for managing application state in the Ahjoor Frontend project.

---

## Table of Contents

1. [State Management Overview](#state-management-overview)
2. [Local Component State](#local-component-state)
3. [Custom Hooks for State](#custom-hooks-for-state)
4. [Context API for Shared State](#context-api-for-shared-state)
5. [Server State vs Client State](#server-state-vs-client-state)
6. [State Persistence](#state-persistence)
7. [State Machine Pattern](#state-machine-pattern)
8. [Lifting State Up](#lifting-state-up)
9. [Common Pitfalls](#common-pitfalls)
10. [Performance Optimization](#performance-optimization)

---

## State Management Overview

The Ahjoor Frontend uses a **layered approach** to state management:

```
┌─────────────────────────────────────────────┐
│   Server State (TanStack Query)             │
│   - API data, remote state, caching        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│   Shared Context State (Contexts/)          │
│   - Theme, wallet, user auth, filters      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│   Local Component State (useState/useReducer)│
│   - Form inputs, UI toggles, temporary data│
└─────────────────────────────────────────────┘
```

**Rule**: Use the **simplest state management level** that solves your problem.

---

## Local Component State

Use `useState` for state that only affects a single component.

### Guidelines

```tsx
// ✅ GOOD: Simple component state
function SearchBox() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}

// ✅ GOOD: Multiple related state values
function Modal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && (
        <div>
          {isLoading && <Spinner />}
          {error && <ErrorMessage error={error} />}
        </div>
      )}
    </>
  );
}

// ❌ WRONG: Over-complicating simple state
// Use useState, not useReducer for simple values
function BadComponent() {
  const [state, dispatch] = useReducer(reducer, { value: "" });
  // This is overkill for a single input field
}
```

### When to Upgrade

Move state up or to a custom hook when:
- Multiple components need the same state
- State changes become complex (multiple related fields)
- You're passing state through many component levels (prop drilling)

---

## Custom Hooks for State

Extract state logic into custom hooks to make it reusable and testable.

### Example: Custom Hook Pattern

```typescript
// hooks/useFormState.ts
interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

export function useFormState<T extends Record<string, any>>(
  initialValues: T,
  onSubmit?: (values: T) => Promise<void>
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!onSubmit) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values as T);
      } catch (error) {
        // Handle error
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors,
    setTouched,
  };
}

// Usage in component
export function LoginForm() {
  const form = useFormState(
    { email: "", password: "" },
    async (values) => {
      await loginUser(values);
    }
  );

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        name="email"
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />
      {form.touched.email && form.errors.email && (
        <span>{form.errors.email}</span>
      )}
    </form>
  );
}
```

---

## Context API for Shared State

Use Context for state shared across many components (avoid prop drilling).

### Example: Theme Context

```typescript
// contexts/ThemeContext.tsx
import React, { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Load from localStorage or system preference
    const stored = localStorage.getItem("theme") as Theme | null;
    return stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// Usage
export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={theme}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </header>
  );
}
```

### Context Pitfalls

```typescript
// ❌ WRONG: Context causes unnecessary re-renders
const CountContext = createContext(0);

export function CountProvider({ children }) {
  const [count, setCount] = useState(0);

  // This causes ALL consumers to re-render even if they only use setCount
  return (
    <CountContext.Provider value={{ count, setCount }}>
      {children}
    </CountContext.Provider>
  );
}

// ✅ CORRECT: Split context by concern
const CountValueContext = createContext(0);
const CountDispatchContext = createContext<(c: number) => void>(() => {});

export function CountProvider({ children }) {
  const [count, setCount] = useState(0);

  return (
    <CountValueContext.Provider value={count}>
      <CountDispatchContext.Provider value={setCount}>
        {children}
      </CountDispatchContext.Provider>
    </CountValueContext.Provider>
  );
}
```

---

## Server State vs Client State

### Server State (Remote Data)

Fetched from API, managed with **TanStack Query**:

```typescript
// ✅ GOOD: Use TanStack Query for server state
export function useCircles() {
  return useQuery({
    queryKey: queryKeys.circles.list(),
    queryFn: () => apiClient.getCircles(),
  });
}

// Usage in component
function CirclesList() {
  const { data: circles, isLoading, error } = useCircles();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorBanner error={error} />;

  return <ul>{circles?.map(c => <li key={c.id}>{c.name}</li>)}</ul>;
}
```

### Client State (UI State)

Local state not from API:

```typescript
// ✅ GOOD: Use useState for client state
function CirclesGrid() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date">("name");

  return (
    <>
      <div>
        <button onClick={() => setViewMode("grid")}>Grid View</button>
        <button onClick={() => setViewMode("list")}>List View</button>
      </div>
      {/* Render based on viewMode */}
    </>
  );
}
```

---

## State Persistence

### Local Storage Persistence

```typescript
// hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
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
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, value]
  );

  return [value, setStoredValue] as const;
}

// Usage: Remember user preferences
export function UserPreferences() {
  const [fontSize, setFontSize] = useLocalStorage("fontSize", 16);
  const [language, setLanguage] = useLocalStorage("language", "en");

  return (
    <>
      <select value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}>
        <option value={14}>Small</option>
        <option value={16}>Normal</option>
        <option value={18}>Large</option>
      </select>
    </>
  );
}
```

---

## State Machine Pattern

For complex state with many transitions, use `useReducer`:

```typescript
// State machine for modal
type ModalState = "closed" | "opening" | "open" | "closing";

type ModalAction =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "FINISH_OPEN" }
  | { type: "FINISH_CLOSE" };

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (state) {
    case "closed":
      return action.type === "OPEN" ? "opening" : "closed";
    case "opening":
      return action.type === "FINISH_OPEN" ? "open" : "opening";
    case "open":
      return action.type === "CLOSE" ? "closing" : "open";
    case "closing":
      return action.type === "FINISH_CLOSE" ? "closed" : "closing";
    default:
      return state;
  }
}

export function useModal(onOpen?: () => void, onClose?: () => void) {
  const [state, dispatch] = useReducer(modalReducer, "closed");

  const open = useCallback(() => {
    dispatch({ type: "OPEN" });
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    dispatch({ type: "CLOSE" });
    onClose?.();
  }, [onClose]);

  return {
    state,
    isOpen: state === "open" || state === "opening",
    isClosing: state === "closing",
    open,
    close,
    dispatch,
  };
}
```

---

## Lifting State Up

When multiple components share state, move it to their common parent.

```typescript
// ❌ BEFORE: State in multiple components
function SearchBox() {
  const [query, setQuery] = useState("");
  // SearchBox doesn't use query, but Results does
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

function Results() {
  const [query, setQuery] = useState(""); // Duplicate!
  // This state is out of sync with SearchBox
}

// ✅ AFTER: State lifted to parent
function Search() {
  const [query, setQuery] = useState("");

  return (
    <>
      <SearchBox query={query} onQueryChange={setQuery} />
      <Results query={query} />
    </>
  );
}

function SearchBox({ query, onQueryChange }) {
  return <input value={query} onChange={(e) => onQueryChange(e.target.value)} />;
}

function Results({ query }) {
  const { data } = useSearch(query);
  return <div>{/* Render results */}</div>;
}
```

---

## Common Pitfalls

### Pitfall 1: Using Objects as State

```typescript
// ❌ WRONG: Object mutation
const [user, setUser] = useState({ name: "", email: "" });

function updateName(newName) {
  user.name = newName; // Doesn't trigger re-render!
  setUser(user);
}

// ✅ CORRECT: Create new object
function updateName(newName) {
  setUser((prev) => ({ ...prev, name: newName }));
}
```

### Pitfall 2: State Depending on Props

```typescript
// ❌ WRONG: State doesn't update when prop changes
function Item({ id }) {
  const [data, setData] = useState(null);
  // This runs only once, so data won't update if id changes
}

// ✅ CORRECT: Update state when prop changes
function Item({ id }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData(id).then(setData);
  }, [id]); // Update when id changes
}
```

### Pitfall 3: Unnecessary State

```typescript
// ❌ WRONG: Derived state
function Component({ firstName, lastName }) {
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    setFullName(`${firstName} ${lastName}`);
  }, [firstName, lastName]);
  // fullName is derived from props, no need to store it
}

// ✅ CORRECT: Compute derived values directly
function Component({ firstName, lastName }) {
  const fullName = `${firstName} ${lastName}`;
}
```

---

## Performance Optimization

### Memoization of Context Consumers

```typescript
// ✅ Optimize context re-renders with useMemo
export function CountProvider({ children }) {
  const [count, setCount] = useState(0);

  const value = useMemo(
    () => ({ count, setCount }),
    [count]
  );

  return (
    <CountContext.Provider value={value}>
      {children}
    </CountContext.Provider>
  );
}
```

### Splitting Context by Concern

```typescript
// Split value and dispatch to prevent unnecessary re-renders
<ValueContext.Provider value={count}>
  <DispatchContext.Provider value={setCount}>
    {children}
  </DispatchContext.Provider>
</ValueContext.Provider>
```

---

## Checklist for State Management

- [ ] State is at the lowest component level it needs to be
- [ ] No prop drilling through more than 2 levels
- [ ] Server state uses TanStack Query
- [ ] Client state uses useState or custom hooks
- [ ] Shared state uses Context or custom hook
- [ ] Complex state transitions use useReducer or state machine
- [ ] State is never mutated directly
- [ ] useEffect dependencies are correct
- [ ] No unnecessary re-renders
- [ ] State is properly typed with TypeScript

