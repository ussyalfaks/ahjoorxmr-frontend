"use client";

import { useState, useCallback } from "react";
import { validatePasswordStrength, type PasswordStrength, generateResetToken } from "@/types/auth";

interface UsePasswordResetOptions {
  onRequestReset?: (email: string) => Promise<{ success: boolean; error?: string }>;
  onResetPassword?: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  onInvalidateSessions?: (userId: string) => Promise<void>;
  /** Token expiry in minutes (default 30) */
  tokenExpiryMinutes?: number;
}

export function usePasswordReset({
  onRequestReset,
  onResetPassword,
  onInvalidateSessions,
  tokenExpiryMinutes = 30,
}: UsePasswordResetOptions = {}) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Reset password state
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    isValid: false,
    score: 0,
    errors: [],
    suggestions: [],
  });

  const requestReset = useCallback(async (emailAddress: string) => {
    setIsLoading(true);
    setError(null);
    setEmail(emailAddress);

    try {
      if (onRequestReset) {
        const result = await onRequestReset(emailAddress);
        if (!result.success) {
          setError(result.error || "Failed to request password reset");
          return false;
        }
      }
      // For demo/mock, simulate success
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onRequestReset]);

  const handlePasswordChange = useCallback((password: string) => {
    setNewPassword(password);
    setPasswordStrength(validatePasswordStrength(password));
  }, []);

  const resetPassword = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!resetToken) {
      setError("Invalid reset token");
      setIsLoading(false);
      return false;
    }

    if (!passwordStrength.isValid) {
      setError("Password does not meet requirements");
      setIsLoading(false);
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return false;
    }

    try {
      if (onResetPassword) {
        const result = await onResetPassword(resetToken, newPassword);
        if (!result.success) {
          setError(result.error || "Failed to reset password");
          setIsLoading(false);
          return false;
        }
        
        // Invalidate old sessions after successful reset
        const userId = localStorage.getItem("ahjoor_user_id");
        if (userId && onInvalidateSessions) {
          await onInvalidateSessions(userId);
        }
      }
      
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [resetToken, newPassword, confirmPassword, passwordStrength.isValid, onResetPassword, onInvalidateSessions]);

  const validateToken = useCallback((token: string): { valid: boolean; expired?: boolean } => {
    // In production, this would verify against backend
    // For demo, we check if token exists in session storage
    const stored = sessionStorage.getItem("ahjoor_reset_token");
    const expiry = sessionStorage.getItem("ahjoor_reset_token_expiry");
    
    if (!stored || stored !== token) {
      return { valid: false };
    }
    
    if (expiry && Date.now() > parseInt(expiry, 10)) {
      return { valid: true, expired: true };
    }
    
    setResetToken(token);
    return { valid: true };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setEmail("");
    setError(null);
    setSuccess(false);
    setResetToken(null);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordStrength({
      isValid: false,
      score: 0,
      errors: [],
      suggestions: [],
    });
  }, []);

  return {
    // Request state
    email,
    setEmail,
    isLoading,
    error,
    success,
    
    // Reset state
    resetToken,
    newPassword,
    confirmPassword,
    passwordStrength,
    setConfirmPassword,
    handlePasswordChange,
    
    // Actions
    requestReset,
    resetPassword,
    validateToken,
    clearError,
    reset,
  };
}