"use client";

import { Search } from "lucide-react";
import { OPEN_COMMAND_PALETTE_EVENT } from "@/components/ui/CommandPalette";

export default function DashboardHeaderSearch() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT))}
      className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--ov-05)] border border-[var(--ov-1a)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-0f)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
      aria-label="Open command palette (Cmd+K)"
    >
      <Search size={18} aria-hidden="true" />
    </button>
  );
}
