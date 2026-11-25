# Testing Guide (Issue #328)

This document provides comprehensive guidance on writing, running, and maintaining tests in the Ahjoor Frontend project.

---

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Test Structure](#test-structure)
3. [Unit Testing](#unit-testing)
4. [Component Testing](#component-testing)
5. [Hook Testing](#hook-testing)
6. [Integration Testing](#integration-testing)
7. [E2E Testing](#e2e-testing)
8. [Mocking & Fixtures](#mocking--fixtures)
9. [Test Organization](#test-organization)
10. [Best Practices](#best-practices)

---

## Testing Overview

The Ahjoor Frontend uses a **multi-tier testing strategy** to ensure reliability:

```
┌─────────────────────────────────────────┐
│   E2E Tests (Playwright)                │
│   - User workflows, full page flows    │
│   - Run before deployment              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   Integration Tests (Vitest)            │
│   - Multiple units working together    │
│   - API interactions, state changes    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   Unit Tests (Vitest)                   │
│   - Individual functions & components  │
│   - Fastest feedback loop              │
└─────────────────────────────────────────┘
```

### Testing Tools

- **Vitest**: Fast unit and component testing (Jest-compatible)
- **React Testing Library**: User-centric component testing
- **Playwright**: End-to-end testing
- **@axe-core/playwright**: Accessibility testing in E2E

### Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (development)
pnpm test:watch

# Run specific test file
pnpm test -- currencyFormat.test.ts

# Run E2E tests
pnpm test:e2e

# Run with coverage
pnpm test -- --coverage
```

---

## Test Structure

### Basic Test File Layout

```typescript
// lib/__tests__/myFunction.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { myFunction } from "../myFunction";

describe("myFunction", () => {
  beforeEach(() => {
    // Setup before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
    vi.restoreAllMocks();
  });

  it("does something correctly", () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });

  describe("when input is invalid", () => {
    it("throws an error", () => {
      expect(() => myFunction(invalidInput)).toThrow();
    });
  });
});
```

### Naming Conventions

- Test file: `functionName.test.ts` or `ComponentName.test.tsx`
- Test suite: `describe("FunctionName")` or `describe("ComponentName")`
- Test case: `it("should/does [behavior]")`

---

## Unit Testing

### Testing Utility Functions

```typescript
// ✅ GOOD: Comprehensive unit test
describe("formatCurrency", () => {
  it("formats USD currency correctly", () => {
    expect(formatCurrency(1234.56, "USD")).toBe("$1,234.56");
  });

  it("handles zero amount", () => {
    expect(formatCurrency(0, "USD")).toBe("$0.00");
  });

  it("throws on invalid currency", () => {
    expect(() => formatCurrency(100, "INVALID")).toThrow();
  });

  it("rounds to correct decimal places", () => {
    expect(formatCurrency(10.126, "USD")).toBe("$10.13");
  });
});
```

### Testing with Mocks

```typescript
// ✅ GOOD: Mock external dependencies
describe("fetchUserData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches and returns user data", async () => {
    const mockUser = { id: 1, name: "John" };
    
    vi.mock("../api", () => ({
      getUser: vi.fn().mockResolvedValue(mockUser),
    }));

    const result = await fetchUserData(1);
    expect(result).toEqual(mockUser);
  });

  it("handles API errors", async () => {
    vi.mock("../api", () => ({
      getUser: vi.fn().mockRejectedValue(new Error("API Error")),
    }));

    await expect(fetchUserData(1)).rejects.toThrow("API Error");
  });
});
```

---

## Component Testing

### Testing React Components

```typescript
// components/__tests__/Button.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";

describe("Button Component", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<Button onClick={handleClick}>Click</Button>);
    
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("disables when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Button className="custom-class">Button</Button>
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

### Testing Conditional Rendering

```typescript
// ✅ GOOD: Test all branches
describe("Modal Component", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<Modal isOpen={false}>Content</Modal>);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("renders modal when open", () => {
    render(<Modal isOpen={true}>Content</Modal>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={handleClose}>
        Content
      </Modal>
    );
    
    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(handleClose).toHaveBeenCalled();
  });
});
```

---

## Hook Testing

### Testing Custom Hooks

```typescript
// hooks/__tests__/useCounter.test.ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "../useCounter";

describe("useCounter Hook", () => {
  it("initializes with default value", () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it("increments count", () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it("decrements count", () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });

  it("resets to initial value", () => {
    const { result } = renderHook(() => useCounter(10));
    
    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });
    
    expect(result.current.count).toBe(10);
  });
});
```

---

## Integration Testing

### Testing Multiple Units Together

```typescript
// ✅ GOOD: Integration test with API
describe("UserProfile Integration", () => {
  it("displays user data after fetching", async () => {
    const mockUser = { id: 1, name: "John", email: "john@example.com" };
    
    vi.mock("../api", () => ({
      getUser: vi.fn().mockResolvedValue(mockUser),
    }));

    render(<UserProfile userId={1} />);
    
    // Initially shows loading
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // After fetch, shows user data
    await waitFor(() => {
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
  });

  it("handles fetch error", async () => {
    vi.mock("../api", () => ({
      getUser: vi.fn().mockRejectedValue(new Error("Network error")),
    }));

    render(<UserProfile userId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

---

## E2E Testing

### Playwright E2E Tests

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("user can view circles", async ({ page }) => {
    // Navigate to app
    await page.goto("http://localhost:3000/dashboard");

    // Wait for circles to load
    await page.waitForSelector("[data-testid='circle-list']");

    // Check circles are displayed
    const circles = await page.locator("[data-testid='circle-card']");
    expect(await circles.count()).toBeGreaterThan(0);
  });

  test("user can create new circle", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard");

    // Click create button
    await page.click("button:has-text('New Circle')");

    // Fill form
    await page.fill("input[name='name']", "Test Circle");
    await page.fill("input[name='description']", "Test Description");

    // Submit form
    await page.click("button:has-text('Create')");

    // Verify success
    await expect(page.locator("text=Circle created")).toBeVisible();
  });

  test("dashboard is accessible", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard");

    // Run accessibility checks
    const accessibilityScan = await page.evaluate(() => {
      // Basic accessibility checks
      return {
        hasHeadings: !!document.querySelector("h1"),
        hasLandmarks: !!document.querySelector("main"),
      };
    });

    expect(accessibilityScan.hasHeadings).toBe(true);
    expect(accessibilityScan.hasLandmarks).toBe(true);
  });
});
```

---

## Mocking & Fixtures

### Mock Data Fixtures

```typescript
// __mocks__/fixtures.ts
export const mockCircle = {
  id: "circle-1",
  name: "Emergency Fund",
  description: "Quick emergency savings",
  memberCount: 5,
  balance: 5000,
  currency: "USD",
};

export const mockUser = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  verified: true,
};

export const mockContribution = {
  id: "contrib-1",
  circleId: "circle-1",
  userId: "user-1",
  amount: 500,
  date: "2024-01-15",
  status: "completed",
};

// Usage in tests
import { mockCircle, mockUser } from "../__mocks__/fixtures";

describe("CircleCard", () => {
  it("displays circle information", () => {
    render(<CircleCard circle={mockCircle} />);
    expect(screen.getByText(mockCircle.name)).toBeInTheDocument();
  });
});
```

### Mocking API Calls

```typescript
// ✅ GOOD: Mock API client
vi.mock("../lib/api", () => ({
  apiClient: {
    getCircles: vi.fn().mockResolvedValue([mockCircle]),
    createCircle: vi.fn().mockResolvedValue(mockCircle),
    deleteCircle: vi.fn().mockResolvedValue({ success: true }),
  },
}));
```

---

## Test Organization

### File Structure

```
project/
├── lib/
│   ├── __tests__/
│   │   ├── utility.test.ts
│   │   └── helper.test.ts
│   ├── utility.ts
│   └── helper.ts
├── components/
│   ├── __tests__/
│   │   ├── Button.test.tsx
│   │   └── Modal.test.tsx
│   ├── Button.tsx
│   └── Modal.tsx
├── hooks/
│   ├── __tests__/
│   │   └── useCounter.test.ts
│   └── useCounter.ts
└── e2e/
    ├── dashboard.spec.ts
    └── circles.spec.ts
```

---

## Best Practices

### ✅ DO

- **Write descriptive test names**: `it("displays error message when email is invalid")`
- **Test behavior, not implementation**: Focus on what users see
- **Use semantic queries**: Prefer `getByRole()` over `getByTestId()`
- **Keep tests focused**: One concept per test
- **Use proper setup/teardown**: `beforeEach`, `afterEach`
- **Test accessibility**: Include `aria-*` attributes in tests
- **Mock external dependencies**: APIs, timers, local storage
- **Test edge cases**: Empty states, errors, loading states

### ❌ DON'T

- **Don't test implementation details**: Test the interface, not the internals
- **Don't skip error cases**: Always test failure paths
- **Don't use `waitFor` for everything**: Use specific queries first
- **Don't create tight coupling**: Tests should be maintainable
- **Don't forget to clean up**: Clear mocks between tests
- **Don't write brittle tests**: Avoid checking exact text matches
- **Don't test third-party libraries**: Trust that libraries work
- **Don't ignore slow tests**: Optimize or refactor slow tests

### Example: Good Test

```typescript
// ✅ GOOD: Clear, focused, behavior-driven
it("submits form with valid data", async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();

  render(<LoginForm onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText(/email/i), "user@example.com");
  await user.type(screen.getByLabelText(/password/i), "password123");
  await user.click(screen.getByRole("button", { name: /sign in/i }));

  expect(handleSubmit).toHaveBeenCalledWith({
    email: "user@example.com",
    password: "password123",
  });
});
```

### Example: Poor Test

```typescript
// ❌ POOR: Testing implementation, unclear intent
it("calls setLoginData", () => {
  const setLoginDataMock = vi.fn();
  const wrapper = mount(<LoginForm setLoginData={setLoginDataMock} />);
  const input = wrapper.find("input").first();
  input.value = "test@example.com";
  input.trigger("change");
  expect(setLoginDataMock).toHaveBeenCalled();
});
```

---

## Checklist for Test Coverage

- [ ] All utility functions have unit tests
- [ ] All components have at least basic tests
- [ ] Error cases are tested
- [ ] Loading states are tested
- [ ] User interactions are tested (clicks, inputs)
- [ ] API calls are mocked
- [ ] Accessibility is verified
- [ ] Edge cases are covered
- [ ] No skipped tests (`it.skip`, `describe.skip`)
- [ ] Tests run consistently (not flaky)
- [ ] Tests are fast (< 100ms per test on average)

