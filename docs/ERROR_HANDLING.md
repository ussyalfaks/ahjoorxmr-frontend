# Error Handling & Debugging Guide (Issue #329)

This document provides comprehensive guidance on error handling, debugging strategies, and best practices for maintaining reliability in the Ahjoor Frontend project.

---

## Table of Contents

1. [Error Handling Overview](#error-handling-overview)
2. [Try-Catch Patterns](#try-catch-patterns)
3. [Error Types & Classification](#error-types--classification)
4. [User-Facing Error Messages](#user-facing-error-messages)
5. [Error Boundaries](#error-boundaries)
6. [API Error Handling](#api-error-handling)
7. [Form Validation & Errors](#form-validation--errors)
8. [Logging & Monitoring](#logging--monitoring)
9. [Debugging Techniques](#debugging-techniques)
10. [Error Recovery Strategies](#error-recovery-strategies)

---

## Error Handling Overview

Error handling in this project follows these principles:

1. **Fail Fast**: Catch errors early before they cascade
2. **User-Centric**: Show clear, actionable error messages to users
3. **Recoverable**: Provide paths for users to recover from errors
4. **Logged**: Track errors for debugging and improvement
5. **Typed**: Use TypeScript to catch errors at compile time

---

## Try-Catch Patterns

### Basic Error Handling

```typescript
// ✅ GOOD: Clear error handling with recovery
async function fetchUserData(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to fetch user data:", message);
    throw new Error(`Failed to load user: ${message}`);
  }
}
```

### Async/Await Error Handling

```typescript
// ✅ GOOD: Explicit error handling in async functions
async function processTransaction(txData: Transaction) {
  try {
    const validated = validateTransaction(txData);
    const result = await submitTransaction(validated);
    return result;
  } catch (error) {
    if (error instanceof ValidationError) {
      // Handle validation errors specifically
      return { success: false, errors: error.details };
    }
    
    if (error instanceof NetworkError) {
      // Handle network errors specifically
      return { success: false, error: "Network error. Please try again." };
    }
    
    // Fallback for unexpected errors
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
```

### Promise Error Handling

```typescript
// ✅ GOOD: Catch promise rejections
function loadCircles() {
  return fetchCircles()
    .then(data => ({ success: true, data }))
    .catch(error => ({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }));
}
```

---

## Error Types & Classification

### Custom Error Classes

```typescript
// ✅ GOOD: Create domain-specific error classes
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public endpoint: string,
    message: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class ValidationError extends Error {
  constructor(
    public details: Record<string, string>,
    message: string = "Validation failed"
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NetworkError extends Error {
  constructor(message: string = "Network error") {
    super(message);
    this.name = "NetworkError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

// Usage
function validateEmail(email: string) {
  const errors: Record<string, string> = {};
  
  if (!email) {
    errors.email = "Email is required";
  } else if (!email.includes("@")) {
    errors.email = "Invalid email format";
  }
  
  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}
```

---

## User-Facing Error Messages

### Guidelines for Error Messages

```typescript
// ✅ GOOD: Clear, actionable error messages
function displayError(error: Error) {
  const userMessage = getUserFriendlyMessage(error);
  showNotification({
    type: "error",
    title: "Something went wrong",
    message: userMessage,
    action: getRecoveryAction(error),
  });
}

function getUserFriendlyMessage(error: Error): string {
  if (error instanceof ValidationError) {
    return "Please check your input and try again";
  }
  
  if (error instanceof NetworkError) {
    return "Network error. Please check your connection and try again";
  }
  
  if (error instanceof AuthenticationError) {
    return "Your session has expired. Please sign in again";
  }
  
  // Fallback for unknown errors
  return "An unexpected error occurred. Please try again later";
}

function getRecoveryAction(error: Error): Action | undefined {
  if (error instanceof NetworkError) {
    return { label: "Retry", action: "retry" };
  }
  
  if (error instanceof AuthenticationError) {
    return { label: "Sign In", action: "signIn" };
  }
  
  return undefined;
}

// ❌ WRONG: Unclear, technical error messages
showNotification({
  message: "TypeError: Cannot read property 'name' of undefined",
});

// ❌ WRONG: No recovery path
showNotification({
  message: "Error occurred",
});
```

---

## Error Boundaries

### React Error Boundary Component

```typescript
// components/ErrorBoundary.tsx
import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught:", error, errorInfo);
    // Log to error tracking service
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback?.(this.state.error!) || (
          <div className="error-boundary">
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            <button onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Usage
export function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}
```

---

## API Error Handling

### Structured API Error Response

```typescript
interface APIErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
  };
}

// ✅ GOOD: Handle API errors with context
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json() as APIErrorResponse;
      throw new APIError(
        response.status,
        url,
        errorData.error.message
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new NetworkError("Failed to connect to server");
    }

    throw error;
  }
}
```

---

## Form Validation & Errors

### Client-Side Validation

```typescript
interface FormErrors {
  [key: string]: string[];
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  // Validate email
  if (!data.email) {
    errors.email = ["Email is required"];
  } else if (!isValidEmail(data.email)) {
    errors.email = ["Please enter a valid email"];
  }

  // Validate password
  if (!data.password) {
    errors.password = ["Password is required"];
  } else if (data.password.length < 8) {
    errors.password = ["Password must be at least 8 characters"];
  }

  return errors;
}

// ✅ GOOD: Display validation errors to user
function FormComponent() {
  const [data, setData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate on client first
    const validationErrors = validateForm(data);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await submitForm(data);
    } catch (error) {
      setErrors({ form: [error instanceof Error ? error.message : "Submission failed"] });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors.form && <ErrorAlert messages={errors.form} />}
      
      <input
        type="email"
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        aria-invalid={!!errors.email}
        aria-describedby={errors.email ? "email-errors" : undefined}
      />
      {errors.email && (
        <ul id="email-errors" role="alert">
          {errors.email.map((err, i) => <li key={i}>{err}</li>)}
        </ul>
      )}
    </form>
  );
}
```

---

## Logging & Monitoring

### Structured Logging

```typescript
// lib/logger.ts
interface LogEntry {
  level: "debug" | "info" | "warn" | "error";
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export const logger = {
  debug: (message: string, context?: any) => {
    logToService({ level: "debug", message, context, timestamp: new Date().toISOString() });
  },

  info: (message: string, context?: any) => {
    logToService({ level: "info", message, context, timestamp: new Date().toISOString() });
  },

  warn: (message: string, context?: any) => {
    logToService({ level: "warn", message, context, timestamp: new Date().toISOString() });
  },

  error: (message: string, error?: Error, context?: any) => {
    logToService({
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  },
};

// Usage
async function fetchCircles() {
  try {
    logger.info("Fetching circles", { source: "dashboard" });
    const circles = await apiClient.getCircles();
    logger.debug("Circles fetched successfully", { count: circles.length });
    return circles;
  } catch (error) {
    logger.error("Failed to fetch circles", error instanceof Error ? error : new Error(String(error)), {
      retryAttempt: 1,
    });
    throw error;
  }
}
```

---

## Debugging Techniques

### Browser DevTools Usage

```typescript
// Use debugger breakpoints
function complexCalculation(values: number[]) {
  debugger; // Pauses execution when DevTools is open
  
  let total = 0;
  for (const value of values) {
    console.log(`Adding ${value}, total now: ${total + value}`);
    total += value;
  }
  
  return total;
}

// Use console methods effectively
console.group("Circle Creation");
console.log("Circle ID:", circleId);
console.log("Members:", memberCount);
console.table(members);
console.groupEnd();

// Use console.assert
console.assert(value > 0, "Value must be positive");
```

### Conditional Debugging

```typescript
// Enable debugging in development only
const DEBUG = process.env.NODE_ENV === "development";

function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data);
  }
}
```

---

## Error Recovery Strategies

### Automatic Retry Logic

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        logger.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms`, { error: lastError });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Usage
async function safelyFetchData() {
  return retryWithBackoff(() => apiClient.getData());
}
```

### Graceful Degradation

```typescript
// ✅ GOOD: Show partial content when some features fail
export function Dashboard() {
  const circlesResult = useQuery(() => apiClient.getCircles());
  const paymentsResult = useQuery(() => apiClient.getPayments());

  return (
    <div>
      {circlesResult.isLoading && <Skeleton />}
      {circlesResult.error && <ErrorBanner error={circlesResult.error} />}
      {circlesResult.data && <CirclesList circles={circlesResult.data} />}

      {paymentsResult.isLoading && <Skeleton />}
      {paymentsResult.error && <ErrorBanner error={paymentsResult.error} />}
      {paymentsResult.data && <PaymentsList payments={paymentsResult.data} />}
    </div>
  );
}
```

---

## Checklist for Error Handling

- [ ] All API calls have try-catch blocks
- [ ] Custom error classes defined for domain-specific errors
- [ ] User-facing error messages are clear and actionable
- [ ] Error boundaries wrap major feature areas
- [ ] Form validation errors are displayed inline
- [ ] Errors are logged with context information
- [ ] Error recovery paths provided (retry, reload, etc.)
- [ ] No sensitive information in error messages
- [ ] Fallback UI shown during errors
- [ ] TypeScript used to catch type errors early

