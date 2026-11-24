"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import { PASSWORD_MIN_LENGTH } from "@/types/auth";

const PASSWORD_STRENGTH_LABELS = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
const PASSWORD_STRENGTH_COLORS = ["text-red-500", "text-orange-500", "text-yellow-500", "text-lime-500", "text-green-500"];
const PASSWORD_BAR_COLORS = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];

function PasswordResetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [mode, setMode] = useState<"request" | "reset" | "success">("request");
  const [showPassword, setShowPassword] = useState(false);

  const {
    email,
    setEmail,
    isLoading,
    error,
    newPassword,
    confirmPassword,
    passwordStrength,
    setConfirmPassword,
    handlePasswordChange,
    requestReset,
    resetPassword,
    validateToken,
  } = usePasswordReset();

  useEffect(() => {
    if (token) {
      const result = validateToken(token);
      if (result.valid && !result.expired) {
        setMode("reset");
      } else if (result.expired) {
        setMode("request");
      }
    }
  }, [token, validateToken]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await requestReset(email);
    if (success) {
      setMode("success");
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await resetPassword();
    if (success) {
      setMode("success");
    }
  };

  if (mode === "success" && !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-[var(--text)]">Check Your Email</h1>
            <p className="mb-6 text-[var(--muted)]">
              We&apos;ve sent password reset instructions to <span className="font-medium text-[var(--text)]">{email}</span>
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "success" && token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-[var(--text)]">Password Reset Complete</h1>
            <p className="mb-6 text-[var(--muted)]">Your password has been reset. All previous sessions have been invalidated.</p>
            <Link href="/login" className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white hover:opacity-90">
              Sign In with New Password
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "request") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
          <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)]">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
          <h1 className="mb-2 text-2xl font-bold text-[var(--text)]">Forgot Password?</h1>
          <p className="mb-6 text-[var(--muted)]">Enter your email and we&apos;ll send you a reset link.</p>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--text)]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] py-2.5 pl-10 pr-4 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none" />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-[var(--primary)] py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50">
              {isLoading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
        <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)]">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-[var(--text)]">Reset Password</h1>
        <p className="mb-6 text-[var(--muted)]">Create a new password. Old sessions will be invalidated.</p>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {passwordStrength.errors.length > 0 && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
            {passwordStrength.errors[0]}
          </div>
        )}
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-[var(--text)]">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
              <input id="newPassword" type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => handlePasswordChange(e.target.value)} placeholder="Create a strong password" required minLength={PASSWORD_MIN_LENGTH} className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] py-2.5 pl-10 pr-10 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--faint)]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {newPassword && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i < passwordStrength.score ? PASSWORD_BAR_COLORS[passwordStrength.score - 1] : "bg-[var(--border)]"}`} />
                  ))}
                </div>
                <p className={`mt-1 text-xs ${passwordStrength.score > 0 ? PASSWORD_STRENGTH_COLORS[passwordStrength.score - 1] : ""}`}>
                  {PASSWORD_STRENGTH_LABELS[passwordStrength.score]}
                </p>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-[var(--text)]">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
              <input id="confirmPassword" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] py-2.5 pl-10 pr-4 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none" />
            </div>
            {confirmPassword && newPassword !== confirmPassword && <p className="mt-1 text-xs text-red-500">Passwords do not match</p>}
          </div>
          <button type="submit" disabled={isLoading || !passwordStrength.isValid || newPassword !== confirmPassword} className="w-full rounded-lg bg-[var(--primary)] py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50">
            {isLoading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

// useSearchParams() needs a Suspense boundary so the page can be statically prerendered.
export default function PasswordResetPage() {
  return (
    <Suspense>
      <PasswordResetContent />
    </Suspense>
  );
}
