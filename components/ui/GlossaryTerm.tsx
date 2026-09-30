"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";
import { getGlossaryEntry, type GlossaryTermId } from "@/config/glossary";

interface GlossaryTermProps {
  term: GlossaryTermId;
  /** Text to render inline. Defaults to the glossary entry's label. */
  children?: React.ReactNode;
  /** Render only the info icon (for labels that already show the term). */
  iconOnly?: boolean;
  /** Where the tooltip opens. Use "bottom" near the top of scroll containers. */
  placement?: "top" | "bottom";
  className?: string;
}

/**
 * Inline explanation for a Web3 term. Desktop: opens on hover or keyboard
 * focus. Touch: tap the info icon to toggle. Escape, clicking outside or
 * blurring away dismisses it.
 */
export default function GlossaryTerm({
  term,
  children,
  iconOnly = false,
  placement = "top",
  className = "",
}: GlossaryTermProps) {
  const entry = getGlossaryEntry(term);
  const tooltipId = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  // Set when opened by a tap/click, so moving the mouse away doesn't close it.
  const [pinned, setPinned] = useState(false);

  const close = () => {
    setOpen(false);
    setPinned(false);
  };

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <span
      ref={wrapperRef}
      className={`relative inline-flex items-center gap-1 ${className}`}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse" && !pinned) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          // Keep Escape from also closing a parent modal.
          e.stopPropagation();
          close();
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close();
      }}
    >
      {!iconOnly && (
        <span className="underline decoration-dotted decoration-[var(--muted)] underline-offset-4">
          {children ?? entry.term}
        </span>
      )}
      <button
        type="button"
        aria-label={`What is ${entry.term.toLowerCase()}?`}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onFocus={() => setOpen(true)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (open && pinned) {
            close();
          } else {
            setOpen(true);
            setPinned(true);
          }
        }}
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
      >
        <Info size={13} aria-hidden="true" />
      </button>

      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`absolute left-1/2 z-[60] block ${placement === "top" ? "bottom-full mb-2" : "top-full mt-2"} w-64 max-w-[80vw] -translate-x-1/2 rounded-xl border border-[var(--ov-14)] bg-[var(--modal)] p-3 text-left text-xs font-normal normal-case leading-5 tracking-normal text-[var(--muted)] shadow-xl`}
        >
          <span className="mb-1 block text-sm font-semibold text-[var(--text)]">{entry.term}</span>
          {entry.definition}
          {entry.learnMoreHref && (
            <a
              href={entry.learnMoreHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-[#4B6B76] hover:underline"
            >
              Learn more
            </a>
          )}
        </span>
      )}
    </span>
  );
}
