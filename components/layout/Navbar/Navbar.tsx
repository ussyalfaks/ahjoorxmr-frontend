"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "How it Works", href: "#how" },
  { label: "Features", href: "#why" },
  { label: "FAQs", href: "#faq" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-[20px] border-b border-white/[0.07]"
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

        {/* Desktop CTA */}
        <Link
          href="#"
          className="bg-[#6c5ce7] text-white no-underline px-[22px] py-[9px] rounded-[10px] font-['Sora'] text-[14px] font-semibold tracking-[-0.2px] transition-all duration-200 hover:bg-[#8b7cf8] hover:-translate-y-px max-md:hidden"
          style={{ boxShadow: "none" }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.boxShadow = "0 6px 20px rgba(108,92,231,0.3)")}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.boxShadow = "none")}
        >
          Get Started
        </Link>

        {/* Mobile hamburger */}
        <button
          className="hidden max-md:flex flex-col gap-[5px] bg-transparent border-0 cursor-pointer p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span
            className={`block w-[22px] h-[2px] bg-[#a0a0c0] rounded-[2px] transition-transform duration-300 ${
              menuOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block w-[22px] h-[2px] bg-[#a0a0c0] rounded-[2px] transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-[22px] h-[2px] bg-[#a0a0c0] rounded-[2px] transition-transform duration-300 ${
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
              className="text-[#7878a0] no-underline text-[15px] font-medium py-[10px] border-b border-white/[0.07] transition-colors duration-200 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="#"
            className="inline-block mt-3 bg-[#6c5ce7] text-white no-underline px-6 py-3 rounded-[10px] font-['Sora'] font-semibold text-[15px] text-center"
            onClick={() => setMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
