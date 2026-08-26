"use client";

import { useState, useRef } from "react";
import { SendHorizonal } from "lucide-react";
import { COMMENT_MAX_LENGTH } from "@/types/discussion";

interface CommentComposerProps {
  /** Called with the trimmed body text when the user submits. */
  onSubmit: (body: string) => Promise<void> | void;
  /** Disable the entire form (e.g. user is not a circle member). */
  disabled?: boolean;
  placeholder?: string;
}

export default function CommentComposer({
  onSubmit,
  disabled = false,
  placeholder = "Write a message…",
}: CommentComposerProps) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = body.trim();
  const remaining = COMMENT_MAX_LENGTH - trimmed.length;
  const isOverLimit = remaining < 0;
  const isEmpty = trimmed.length === 0;
  const canSubmit = !isEmpty && !isOverLimit && !busy && !disabled;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isEmpty) {
      setError("Message cannot be empty.");
      textareaRef.current?.focus();
      return;
    }
    if (isOverLimit) {
      setError(`Message must be ${COMMENT_MAX_LENGTH} characters or fewer.`);
      textareaRef.current?.focus();
      return;
    }

    setBusy(true);
    try {
      await onSubmit(trimmed);
      setBody("");
    } catch {
      setError("Failed to post message. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // Ctrl/Cmd + Enter submits
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Post a comment">
      <div
        className={`rounded-2xl border transition-colors ${
          error
            ? "border-[#FF5B5B55]"
            : "border-[var(--ov-0f)] focus-within:border-[#4B6B76]"
        } bg-[var(--content)]`}
      >
        <textarea
          ref={textareaRef}
          id="comment-body"
          rows={3}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled || busy}
          placeholder={disabled ? "Only circle members can post." : placeholder}
          aria-label="Comment body"
          aria-describedby={error ? "composer-error" : "composer-hint"}
          maxLength={COMMENT_MAX_LENGTH + 50} /* soft guard; we validate manually */
          className="w-full resize-none rounded-t-2xl bg-transparent px-4 pt-4 pb-2 text-sm text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />

        <div className="flex items-center justify-between px-4 pb-3 pt-1 gap-3">
          {/* Character counter */}
          <span
            id="composer-hint"
            className={`text-xs tabular-nums ${
              isOverLimit
                ? "text-[#FF5B5B]"
                : remaining <= 50
                ? "text-amber-500 dark:text-amber-400"
                : "text-[var(--faint)]"
            }`}
            aria-live="polite"
          >
            {remaining < COMMENT_MAX_LENGTH
              ? `${remaining} remaining`
              : `${COMMENT_MAX_LENGTH} max`}
          </span>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4B6B76] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#3D5A64] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SendHorizonal size={14} aria-hidden="true" />
            {busy ? "Posting…" : "Post"}
          </button>
        </div>
      </div>

      {error && (
        <p
          id="composer-error"
          role="alert"
          className="mt-2 text-xs text-[#FF5B5B]"
        >
          {error}
        </p>
      )}

      <p className="mt-1.5 text-[11px] text-[var(--faint)]">
        Tip: press{" "}
        <kbd className="rounded border border-[var(--ov-0f)] bg-[var(--ov-05)] px-1 py-0.5 font-mono text-[10px]">
          Ctrl
        </kbd>{" "}
        +{" "}
        <kbd className="rounded border border-[var(--ov-0f)] bg-[var(--ov-05)] px-1 py-0.5 font-mono text-[10px]">
          Enter
        </kbd>{" "}
        to post
      </p>
    </form>
  );
}
