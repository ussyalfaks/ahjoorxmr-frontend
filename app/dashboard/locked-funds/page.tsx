"use client";

import { useState, useRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";

const TOKENS = ["USDT", "USDC", "STRK", "XLM"];

const lockedFunds = [
  { name: "Annual Savings", amount: "2000", token: "USDT", lockedUntil: "25 January, 2026" },
  { name: "Just For Fun", amount: "500", token: "USDC", lockedUntil: "25 January, 2026" },
  { name: "Summer Savings", amount: "500", token: "STRK", lockedUntil: "25 January, 2026" },
];

export default function LockedFundsPage() {
  const [tokenOpen, setTokenOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState("USDT");
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const openDropdown = () => {
    setTokenOpen(true);
    setFocusedIndex(TOKENS.indexOf(selectedToken));
  };

  const closeDropdown = useCallback(() => {
    setTokenOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  }, []);

  const selectToken = (token: string) => {
    setSelectedToken(token);
    closeDropdown();
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDropdown();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openDropdown();
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeDropdown();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => (i + 1) % TOKENS.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => (i - 1 + TOKENS.length) % TOKENS.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusedIndex >= 0) selectToken(TOKENS[focusedIndex]);
    } else if (e.key === "Tab") {
      closeDropdown();
    }
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold font-sora text-[var(--text)] shrink-0">My Locked Funds</h1>
        <div className="h-px bg-[var(--ov-1a)] w-full" aria-hidden="true" />
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3">
        <button className="px-5 py-2 bg-[var(--elevated)] hover:bg-[var(--elevated-hover)] text-[var(--text)] text-sm font-medium rounded-lg transition-colors border border-[var(--ov-1a)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]">
          Commit
        </button>

        {/* Token Dropdown */}
        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => (tokenOpen ? closeDropdown() : openDropdown())}
            onKeyDown={handleTriggerKeyDown}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--elevated)] hover:bg-[var(--elevated-hover)] text-[var(--text)] text-sm font-medium rounded-lg border border-[var(--ov-1a)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            aria-haspopup="listbox"
            aria-expanded={tokenOpen}
            aria-label={`Select token, currently ${selectedToken}`}
          >
            {selectedToken}
            <ChevronDown
              size={16}
              className={`transition-transform ${tokenOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {tokenOpen && (
            <ul
              ref={listRef}
              role="listbox"
              aria-label="Select token"
              onKeyDown={handleListKeyDown}
              tabIndex={-1}
              className="absolute top-full mt-1 left-0 bg-[var(--modal)] border border-[var(--ov-1a)] rounded-lg overflow-hidden z-10 min-w-full outline-none"
            >
              {TOKENS.map((t, idx) => (
                <li key={t} role="option" aria-selected={selectedToken === t}>
                  <button
                    type="button"
                    onClick={() => selectToken(t)}
                    data-index={idx}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:bg-[var(--ov-1a)] ${
                      focusedIndex === idx ? "bg-[var(--ov-1a)]" : "hover:bg-[var(--ov-0f)]"
                    } ${selectedToken === t ? "text-[var(--text)] font-semibold" : "text-[var(--muted)]"}`}
                    tabIndex={tokenOpen ? 0 : -1}
                    autoFocus={focusedIndex === idx}
                  >
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Locked Funds Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {lockedFunds.map((fund) => (
          <article
            key={fund.name}
            className="bg-[var(--content)] rounded-2xl p-6 flex flex-col gap-4 hover:bg-[var(--content-hover)] transition-colors"
          >
            <p className="text-[var(--muted)] text-sm font-medium">{fund.name}</p>
            <h2 className="text-3xl font-bold font-sora text-[var(--text)] tracking-tight">
              {fund.amount} {fund.token}
            </h2>
            <p className="text-[var(--muted)] text-sm">Locked until: {fund.lockedUntil}</p>
            <button className="mt-auto px-5 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium rounded-lg transition-colors w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--content)]">
              View Details
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
