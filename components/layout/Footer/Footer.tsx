"use client";
import Link from "next/link";

const footerLinks = ["Documentations", "Resources", "Securities", "Socials"];

export default function Footer() {
  return (
    <footer
      className="border-t border-white/[0.07] px-10 pt-16 pb-10 max-sm:px-6 max-sm:pt-12 max-sm:pb-8"
      style={{ background: "linear-gradient(to top, rgba(108,92,231,0.04), transparent)" }}
    >
      <div className="max-w-[900px] mx-auto flex flex-col items-center gap-7 text-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-['Sora'] font-bold text-[18px] text-white no-underline">
          <span
            className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6c5ce7, #8b7cf8)" }}
            aria-hidden="true"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
              <path d="M12 6v2m0 8v2M8.5 9.5l1.5 1.5m4 4l1.5 1.5M6 12h2m8 0h2M8.5 14.5l1.5-1.5m4-4l1.5-1.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          Ahjoor
        </Link>

        {/* Nav links */}
        <nav aria-label="Footer navigation" className="flex gap-7 flex-wrap justify-center max-sm:gap-4">
          {footerLinks.map((l) => (
            <Link
              key={l}
              href="#"
              className="text-[#7878a0] no-underline text-[14px] font-medium transition-colors duration-200 hover:text-white"
            >
              {l}
            </Link>
          ))}
        </nav>

        {/* Email subscribe */}
        <form
          className="flex gap-2 items-center max-sm:flex-col max-sm:w-full"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="footer-email" className="sr-only">Email address</label>
          <input
            id="footer-email"
            type="email"
            placeholder="Enter email address"
            className="bg-[#13131e] border border-white/[0.07] text-[#eeeef8] px-[18px] py-[11px] rounded-[10px] text-[14px] outline-none w-60 transition-all duration-200 placeholder:text-[#7878a0] focus:border-[#6c5ce7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.12)] max-sm:w-full"
          />
          <button
            type="submit"
            className="bg-[#6c5ce7] text-white border-0 px-[22px] py-[11px] rounded-[10px] font-['Sora'] font-semibold text-[14px] cursor-pointer transition-all duration-200 hover:bg-[#8b7cf8] hover:-translate-y-px max-sm:w-full"
          >
            Send
          </button>
        </form>

        <p className="text-[13px] text-[#7878a0]">
          © {new Date().getFullYear()} Ahjoor. All rights reserved. Built with 💜 for communities worldwide.
        </p>
      </div>
    </footer>
  );
}
