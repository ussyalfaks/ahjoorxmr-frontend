"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { Copy, Check, ChevronDown, X } from "lucide-react";
import { useWallet, AVAILABLE_WALLETS, truncateAddress, type WalletId } from "@/contexts/WalletContext";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "How it Works", href: "#how" },
  { label: "Features", href: "#why" },
  { label: "FAQs", href: "#faq" },
];

function WalletSelectModal({ onClose, onSelect }: { onClose: () => void; onSelect: (id: WalletId) => void }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-sm mx-4 rounded-2xl border border-[#ffffff14] p-6"
        style={{ background: "#1C1C1E" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="wallet-modal-title" className="text-lg font-bold text-white font-sora">
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#ffffff0f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            aria-label="Close wallet selector"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-[#A1A1AA] text-sm mb-5">
          Choose a Starknet-compatible wallet to connect.
        </p>

        <div className="space-y-3">
          {AVAILABLE_WALLETS.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => onSelect(wallet.id)}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-[#ffffff08] hover:bg-[#ffffff12] border border-[#ffffff0f] hover:border-[#4B6B76] text-white text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              <span className="w-8 h-8 rounded-full bg-[#ffffff14] flex items-center justify-center text-base" aria-hidden="true">
                {wallet.id === "argent" ? "🔷" : "🔶"}
              </span>
              <span>{wallet.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConnectedDropdown({ address, onCopy, onDisconnect, onClose }: {
  address: string;
  onCopy: () => void;
  onDisconnect: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div ref={ref} className="relative">
      <div
        className="absolute right-0 top-3 w-52 rounded-xl border border-[#ffffff14] overflow-hidden z-150"
        style={{ background: "#1C1C1E" }}
        role="menu"
        aria-label="Wallet options"
      >
        <div className="px-4 py-3 border-b border-[#ffffff0f]">
          <p className="text-xs text-[#A1A1AA] mb-0.5">Connected</p>
          <p className="text-sm text-white font-mono">{truncateAddress(address)}</p>
        </div>
        <button
          onClick={onCopy}
          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#c0c0c0] hover:text-white hover:bg-[#ffffff0a] transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          role="menuitem"
        >
          <Copy size={14} aria-hidden="true" />
          Copy Address
        </button>
        <button
          onClick={onDisconnect}
          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#FF5B5B] hover:bg-[#ff5b5b12] transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#FF5B5B]"
          role="menuitem"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const { address, isConnected, connect, disconnect } = useWallet();

  const handleSelectWallet = useCallback(async (walletId: WalletId) => {
    await connect(walletId);
    setShowWalletModal(false);
  }, [connect]);

  const handleCopyAddress = useCallback(() => {
    if (!address) return;
    try {
      navigator.clipboard.writeText(address);
    } catch {
      const el = document.createElement("textarea");
      el.value = address;
      el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    setShowDropdown(false);
  }, [address]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setShowDropdown(false);
  }, [disconnect]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-100 backdrop-blur-[20px] border-b border-white/[0.07]"
        style={{ background: "rgba(10,10,15,0.82)" }}
      >

        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-10 py-[18px] max-md:px-6 max-md:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-[9px] font-['Sora'] font-bold text-[19px] text-white no-underline tracking-[-0.3px]">
            <span
              className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6c5ce7, #8b7cf8)",
                boxShadow: "0 0 16px rgba(108,92,231,0.3)",
              }}
              aria-hidden="true"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                <path d="M12 6v2m0 8v2M8.5 9.5l1.5 1.5m4 4l1.5 1.5M6 12h2m8 0h2M8.5 14.5l1.5-1.5m4-4l1.5-1.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            Ahjoor
          </Link>

          {/* Desktop nav links */}
          <ul className="list-none flex gap-9 max-md:hidden" role="list">
            {navLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-[14px] font-medium text-[#7878a0] no-underline transition-colors duration-200 hover:text-white relative group"
                >
                  {l.label}
                  <span className="absolute -bottom-[3px] left-0 w-0 h-px bg-[#8b7cf8] transition-all duration-200 group-hover:w-full" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTA / Wallet */}
          <div className="max-md:hidden flex items-center gap-3">
            {isConnected && address ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown((v) => !v)}
                  className="flex items-center gap-2 border border-[#ffffff1a] rounded-[10px] px-4 py-[9px] bg-[#ffffff08] text-white text-[14px] font-semibold font-['Sora'] tracking-[-0.2px] transition-all duration-200 hover:bg-[#ffffff12] hover:border-[#4B6B76] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                  aria-haspopup="menu"
                  aria-expanded={showDropdown}
                >
                  <span className="w-2 h-2 rounded-full bg-[#4ADE80] shrink-0" aria-hidden="true" />
                  <span className="font-mono">{truncateAddress(address)}</span>
                  {copied ? (
                    <Check size={14} className="text-[#4ADE80]" aria-hidden="true" />
                  ) : (
                    <ChevronDown size={14} className="text-[#A1A1AA]" aria-hidden="true" />
                  )}
                </button>
                {showDropdown && (
                  <ConnectedDropdown
                    address={address}
                    onCopy={handleCopyAddress}
                    onDisconnect={handleDisconnect}
                    onClose={() => setShowDropdown(false)}
                  />
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="bg-[#6c5ce7] text-white px-[22px] py-[9px] rounded-[10px] font-['Sora'] text-[14px] font-semibold tracking-[-0.2px] transition-all duration-200 hover:bg-[#8b7cf8] hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c5ce7]"
                style={{ boxShadow: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 20px rgba(108,92,231,0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="hidden max-md:flex flex-col gap-[5px] bg-transparent border-0 cursor-pointer p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span
              className={`block w-[22px] h-0.5 bg-[#a0a0c0] rounded-xs transition-transform duration-300 ${
                menuOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`block w-[22px] h-0.5 bg-[#a0a0c0] rounded-xs transition-opacity duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-[22px] h-0.5 bg-[#a0a0c0] rounded-xs transition-transform duration-300 ${
                menuOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="flex flex-col px-6 pt-4 pb-6 gap-1 border-t border-white/[0.07]">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-[#7878a0] no-underline text-[15px] font-medium py-2.5 border-b border-white/[0.07] transition-colors duration-200 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {isConnected && address ? (
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1 py-2">
                  <span className="w-2 h-2 rounded-full bg-[#4ADE80]" aria-hidden="true" />
                  <span className="text-white font-mono text-[14px]">{truncateAddress(address)}</span>
                </div>
                <button
                  onClick={() => { handleCopyAddress(); setMenuOpen(false); }}
                  className="flex items-center gap-2 text-[#c0c0c0] text-[15px] font-medium py-3 border-b border-white/[0.07] transition-colors hover:text-white"
                >
                  <Copy size={14} aria-hidden="true" />
                  Copy Address
                </button>
                <button
                  onClick={() => { handleDisconnect(); setMenuOpen(false); }}
                  className="inline-block mt-1 text-[#FF5B5B] text-[15px] font-semibold py-3 text-left"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setShowWalletModal(true); setMenuOpen(false); }}
                className="inline-block mt-3 bg-[#6c5ce7] text-white px-6 py-3 rounded-[10px] font-['Sora'] font-semibold text-[15px] text-center"
              >
                Connect Wallet
              </button>
            )}
          </div>
        )}
      </nav>

      {showWalletModal && (
        <WalletSelectModal
          onClose={() => setShowWalletModal(false)}
          onSelect={handleSelectWallet}
        />
      )}
    </>
  );
}
