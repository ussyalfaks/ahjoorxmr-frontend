"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  value: string;
  className?: string;
}

export default function CopyButton({ value, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(value);
      } else {
        const el = document.createElement("textarea");
        el.value = value;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // silently ignore clipboard errors
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center p-1 rounded transition-colors hover:bg-[var(--ov-0f)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${className}`}
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <Check size={14} className="text-green-600 dark:text-green-400" />
      ) : (
        <Copy size={14} className="text-[var(--muted)] hover:text-[var(--text)]" />
      )}
    </button>
  );
}
