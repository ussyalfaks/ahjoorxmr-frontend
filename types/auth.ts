/**
 * Types for email/password authentication and account recovery
 */

export interface UserAccount {
  id: string;
  email: string;
  /** Hashed password - never exposed */
  passwordHash?: string;
  walletAddress?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface PasswordResetRequest {
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthSession {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  userAgent?: string;
}

/**
 * Validation result for password strength
 */
export interface PasswordStrength {
  isValid: boolean;
  score: 0 | 1 | 2 | 3 | 4;
  errors: string[];
  suggestions: string[];
}

/**
 * Common password validation rules
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/**
 * Checks password strength and returns validation result
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const errors: string[] = [];
  const suggestions: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Password must be less than ${PASSWORD_MAX_LENGTH} characters`);
  }

  if (!/[a-z]/.test(password)) {
    suggestions.push("Add lowercase letters");
  }

  if (!/[A-Z]/.test(password)) {
    suggestions.push("Add uppercase letters");
  }

  if (!/[0-9]/.test(password)) {
    suggestions.push("Add numbers");
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    suggestions.push("Add special characters (!@#$%^&*)");
  }

  const score = (password.length >= 8 ? 1 : 0) +
    (/[a-z]/.test(password) && /[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^a-zA-Z0-9]/.test(password) ? 1 : 0);

  return {
    isValid: errors.length === 0,
    score: score as 0 | 1 | 2 | 3 | 4,
    errors,
    suggestions,
  };
}

/**
 * Check if a reset token is expired
 */
export function isResetTokenExpired(expiresAt: Date | string): boolean {
  const expiry = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return Date.now() > expiry.getTime();
}

/**
 * Generate a secure random token (for reset links)
 */
export function generateResetToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}