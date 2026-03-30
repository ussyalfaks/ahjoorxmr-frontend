"use client";

import { useState } from "react";
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

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold font-sora text-white shrink-0">My Locked Funds</h1>
        <div className="h-[1px] bg-[#ffffff1a] w-full" />
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3">
        <button className="px-5 py-2 bg-[#2a2a2a] hover:bg-[#333] text-white text-sm font-medium rounded-lg transition-colors border border-[#ffffff1a]">
          Commit
        </button>

        {/* Token Dropdown */}
        <div className="relative">
          <button
            onClick={() => setTokenOpen((o) => !o)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] text-white text-sm font-medium rounded-lg border border-[#ffffff1a] transition-colors"
            aria-haspopup="listbox"
            aria-expanded={tokenOpen}
          >
            {selectedToken}
            <ChevronDown size={16} className={`transition-transform ${tokenOpen ? "rotate-180" : ""}`} />
          </button>

          {tokenOpen && (
            <ul
              role="listbox"
              className="absolute top-full mt-1 left-0 bg-[#1e1e1e] border border-[#ffffff1a] rounded-lg overflow-hidden z-10 min-w-full"
            >
              {TOKENS.map((t) => (
                <li key={t}>
                  <button
                    role="option"
                    aria-selected={selectedToken === t}
                    onClick={() => { setSelectedToken(t); setTokenOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[#ffffff0f] ${
                      selectedToken === t ? "text-white font-semibold" : "text-[#9A9A9A]"
                    }`}
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
            className="bg-[#212124] rounded-2xl p-6 flex flex-col gap-4 hover:bg-[#26262a] transition-colors"
          >
            <p className="text-[#A1A1AA] text-sm font-medium">{fund.name}</p>
            <h2 className="text-3xl font-bold font-sora text-white tracking-tight">
              {fund.amount} {fund.token}
            </h2>
            <p className="text-[#A1A1AA] text-sm">Locked until: {fund.lockedUntil}</p>
            <button className="mt-auto px-5 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium rounded-lg transition-colors w-fit">
              View Details
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
