"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export type LinkErrorType = "expired" | "invalid" | "not_found" | "forbidden";

interface DeepLinkErrorProps {
  type: LinkErrorType;
  message?: string;
  onRetry?: () => void;
}

const ERROR_MESSAGES: Record<LinkErrorType, string> = {
  expired: "This invitation link has expired. Please ask the organizer for a fresh invite.",
  invalid: "This link appears to be invalid. Please check the link and try again.",
  not_found: "The circle you're looking for doesn't exist or has been removed.",
  forbidden: "You don't have access to this circle. Contact the organizer for an invitation.",
};

export function DeepLinkError({ type, message, onRetry }: DeepLinkErrorProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      
      <h2 className="mb-2 text-lg font-semibold text-[var(--text)]">
        {type === "expired" && "Link Expired"}
        {type === "invalid" && "Invalid Link"}
        {type === "not_found" && "Circle Not Found"}
        {type === "forbidden" && "Access Denied"}
      </h2>
      
      <p className="mb-6 max-w-sm text-sm text-[var(--muted)]">
        {message || ERROR_MESSAGES[type]}
      </p>

      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--hover)]"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

interface DeepLinkHandlerProps {
  isAuthenticated: boolean;
  isLoading?: boolean;
  onResolve: (params: { circleId: string; action?: string; inviteToken?: string }) => void;
  onError?: (error: LinkErrorType) => void;
  children: React.ReactNode;
}

export function DeepLinkHandler({
  isAuthenticated,
  isLoading,
  onResolve,
  onError,
  children,
}: DeepLinkHandlerProps) {
  return <>{children}</>;
}