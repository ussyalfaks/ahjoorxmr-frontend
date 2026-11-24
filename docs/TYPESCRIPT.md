# TypeScript & Type Safety Guide (Issue #341)

This document provides guidance on using TypeScript effectively throughout the Ahjoor Frontend project to catch bugs at compile time and improve code maintainability.

---

## Table of Contents

1. [TypeScript Overview](#typescript-overview)
2. [Type Definitions](#type-definitions)
3. [Interface vs Type](#interface-vs-type)
4. [Generics](#generics)
5. [Type Safety Best Practices](#type-safety-best-practices)
6. [Common Pitfalls](#common-pitfalls)
7. [Utility Types](#utility-types)
8. [Type Guards & Narrowing](#type-guards--narrowing)
9. [Async/Promise Types](#asyncpromise-types)
10. [Type Checking](#type-checking)

---

## TypeScript Overview

TypeScript adds static type checking to JavaScript, catching many common bugs before runtime. All new code in this project must be written in TypeScript.

### Project Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true
  }
}
```

---

## Type Definitions

### Basic Types

```typescript
// ✅ GOOD: Explicit types
const name: string = "John";
const age: number = 25;
const isActive: boolean = true;
const tags: string[] = ["important", "urgent"];
const count: Array<number> = [1, 2, 3];

// ✅ GOOD: Union types for multiple possibilities
type Status = "pending" | "active" | "completed";
const currentStatus: Status = "active";

// ✅ GOOD: Literal types
function navigate(direction: "left" | "right" | "up" | "down") {
  // direction can only be one of these values
}
```

### Object Types

```typescript
// ✅ GOOD: Define object shapes
interface User {
  id: string;
  name: string;
  email: string;
  age?: number; // Optional property
  verified: boolean;
}

type Circle = {
  id: string;
  name: string;
  members: User[];
  balance: number;
};

// ✅ GOOD: Type annotations on objects
const user: User = {
  id: "1",
  name: "John",
  email: "john@example.com",
  verified: true,
};

// ❌ WRONG: No type annotation
const circle = {
  id: "1",
  name: "Emergency Fund",
  members: [],
  balance: 5000,
};
```

---

## Interface vs Type

### When to Use Interface

```typescript
// ✅ USE INTERFACE: For object shapes that may be extended
interface BaseUser {
  id: string;
  name: string;
}

// Can be extended
interface AdminUser extends BaseUser {
  permissions: string[];
  role: "admin";
}

interface GuestUser extends BaseUser {
  expiresAt: Date;
}
```

### When to Use Type

```typescript
// ✅ USE TYPE: For unions, primitives, and complex shapes
type UserRole = "admin" | "user" | "guest";
type Callback<T> = (data: T) => void;
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

// Can't extend types with extends keyword, but can use intersection
type ExtendedUser = BaseUser & { permissions: string[] };
```

---

## Generics

### Generic Functions

```typescript
// ✅ GOOD: Generic function for reusability
function getItem<T>(array: T[], index: number): T | undefined {
  return array[index];
}

// Usage
const number = getItem<number>([1, 2, 3], 0); // number | undefined
const string = getItem<string>(["a", "b", "c"], 1); // string | undefined

// Type inference works automatically
const inferred = getItem([1, 2, 3], 0); // Inferred as number | undefined
```

### Generic Interfaces

```typescript
// ✅ GOOD: Generic interface for flexible data structures
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

interface User {
  id: string;
  name: string;
}

type UserResponse = ApiResponse<User>;
type UsersResponse = ApiResponse<User[]>;

// Usage
function handleResponse<T>(response: ApiResponse<T>) {
  if (response.success) {
    console.log(response.data); // T
  } else {
    console.error(response.error);
  }
}
```

### Generic Constraints

```typescript
// ✅ GOOD: Constrain generics to specific types
function merge<T extends object>(obj1: T, obj2: T): T {
  return { ...obj1, ...obj2 };
}

merge({ a: 1 }, { b: 2 }); // ✅ OK
merge("string1", "string2"); // ❌ ERROR: string is not object

// ✅ GOOD: Constrain to objects with specific keys
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "John", age: 25 };
const name = getProperty(user, "name"); // ✅ string
const age = getProperty(user, "unknown"); // ❌ ERROR
```

---

## Type Safety Best Practices

### Avoid `any` Type

```typescript
// ❌ WRONG: Using any defeats TypeScript
function processData(data: any) {
  return data.foo.bar.baz;
}

// ✅ CORRECT: Define proper types
interface DataShape {
  foo: {
    bar: {
      baz: string;
    };
  };
}

function processData(data: DataShape): string {
  return data.foo.bar.baz;
}
```

### Use Strict Null Checks

```typescript
// ✅ GOOD: Handle null and undefined explicitly
function getUserName(user: User | null): string {
  if (user === null) {
    return "Unknown";
  }
  return user.name;
}

// ✅ GOOD: Use optional chaining
function getUserEmail(user?: User): string | undefined {
  return user?.email;
}

// ✅ GOOD: Use nullish coalescing
function getDisplayName(user?: User): string {
  return user?.name ?? "Guest";
}
```

### Type Assertion (Use Carefully)

```typescript
// ❌ WRONG: Over-using type assertions
const value = "123" as any as number;

// ✅ CORRECT: Type assertion when you know better than TypeScript
const element = document.getElementById("myId") as HTMLInputElement;
element.value = "text";

// ✅ CORRECT: Narrow types with type guards instead
if (typeof value === "string") {
  const num = parseInt(value, 10);
}
```

---

## Common Pitfalls

### Pitfall 1: Implicit `any`

```typescript
// ❌ WRONG: Parameter types not specified
function processCircle(circle) {
  return circle.name.toUpperCase();
}

// ✅ CORRECT: Always specify types
function processCircle(circle: Circle): string {
  return circle.name.toUpperCase();
}
```

### Pitfall 2: Over-Generic

```typescript
// ❌ WRONG: Too generic, loses type information
function fetch<T>(url: string): Promise<T> {
  return fetchData(url);
}

// ✅ CORRECT: Be specific when possible
function fetchUsers(url: string): Promise<User[]> {
  return fetchData(url);
}
```

### Pitfall 3: Mutable Types

```typescript
// ❌ WRONG: Mutable array types can cause issues
type UserList = Array<User>;
const users: UserList = [];
users.push(null); // Type error not caught properly

// ✅ CORRECT: Use readonly for immutability
type UserList = ReadonlyArray<User>;
const users: UserList = [];
users.push(null); // ❌ Error: Argument of type 'null' is not assignable
```

---

## Utility Types

### Common Utility Types

```typescript
// Partial: Make all properties optional
type PartialUser = Partial<User>;
// { id?: string; name?: string; email?: string; ... }

// Required: Make all properties required
type RequiredUser = Required<User>;

// Readonly: Make all properties readonly
type ReadonlyUser = Readonly<User>;

// Pick: Select specific properties
type UserPreview = Pick<User, "id" | "name">;
// { id: string; name: string }

// Omit: Exclude specific properties
type UserWithoutEmail = Omit<User, "email">;
// { id: string; name: string; ... }

// Record: Create object with specific keys and type
type Permissions = Record<"read" | "write" | "delete", boolean>;
// { read: boolean; write: boolean; delete: boolean }

// Exclude: Remove types from union
type NotNull = Exclude<User | null | undefined, null | undefined>;
// User

// Extract: Keep only matching types from union
type Nullable = Extract<User | null | undefined, null | undefined>;
// null | undefined
```

### Usage Examples

```typescript
// ✅ GOOD: Using Partial for optional updates
interface UpdateUserInput extends Partial<Omit<User, "id">> {}

function updateUser(id: string, updates: UpdateUserInput): User {
  // Only allows updating existing User properties, excluding id
  return { ...getUser(id), ...updates };
}

// ✅ GOOD: Using Pick for specific responses
type UserResponse = Pick<User, "id" | "name" | "verified">;

function getPublicUserProfile(id: string): UserResponse {
  const user = getUser(id);
  return {
    id: user.id,
    name: user.name,
    verified: user.verified,
  };
}
```

---

## Type Guards & Narrowing

### typeof Guards

```typescript
// ✅ GOOD: Narrow types with typeof
function processValue(value: string | number): void {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  } else {
    console.log(value.toFixed(2));
  }
}
```

### instanceof Guards

```typescript
// ✅ GOOD: Narrow types with instanceof
class Circle {
  constructor(public radius: number) {}
}

function getArea(shape: Circle | number): number {
  if (shape instanceof Circle) {
    return Math.PI * shape.radius ** 2;
  }
  return shape;
}
```

### Custom Type Guards

```typescript
// ✅ GOOD: Create reusable type guards
function isUser(obj: any): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.name === "string"
  );
}

function processData(data: unknown): void {
  if (isUser(data)) {
    console.log(data.name); // data is now User
  }
}
```

### Discriminated Unions

```typescript
// ✅ GOOD: Use discriminant property to narrow types
type Result<T> =
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function handleResult<T>(result: Result<T>): void {
  if (result.status === "success") {
    console.log(result.data); // data is available
  } else {
    console.error(result.error); // error is available
  }
}
```

---

## Async/Promise Types

### Promise Types

```typescript
// ✅ GOOD: Explicitly type Promise return values
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// ✅ GOOD: Void for functions with no return
async function logData(data: any): Promise<void> {
  console.log(data);
}

// ✅ GOOD: Never for functions that never return
async function throwError(): Promise<never> {
  throw new Error("This never returns");
}
```

### Error Handling

```typescript
// ✅ GOOD: Type caught errors
interface ApiError {
  code: string;
  message: string;
}

async function safelyFetchUser(id: string): Promise<User | null> {
  try {
    return await fetchUser(id);
  } catch (error) {
    const apiError = error as ApiError;
    console.error(apiError.message);
    return null;
  }
}
```

---

## Type Checking

### Running Type Checks

```bash
# Type check the entire project
pnpm typecheck

# Type check specific file
pnpm typecheck src/lib/utils.ts

# Watch mode for development
pnpm typecheck --watch
```

### In Editor

- Enable TypeScript type checking in your editor
- Use IntelliSense for autocomplete
- Hover over values to see inferred types
- Fix any red squiggly lines before committing

---

## TypeScript Configuration Best Practices

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## Checklist for TypeScript Code

- [ ] All functions have parameter type annotations
- [ ] All functions have return type annotations
- [ ] No `any` types (unless absolutely necessary)
- [ ] All object types defined with `interface` or `type`
- [ ] No `const` assertions with `as const` on changing values
- [ ] Type guards used for narrow types
- [ ] Null/undefined handled explicitly
- [ ] No unnecessary type assertions
- [ ] TypeScript strict mode enabled
- [ ] No unused types or interfaces
- [ ] All errors typed properly (not `any`)

