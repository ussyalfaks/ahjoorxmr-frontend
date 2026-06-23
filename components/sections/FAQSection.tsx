"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What if someone doesn't pay their turn?",
    a: "Smart contracts automatically enforce contribution schedules. If a member misses a payment, they can be flagged or excluded from future rounds depending on the circle's rules set at creation. The circle remains protected through code, not trust.",
  },
  {
    q: "How is this different from a local savings group?",
    a: "Unlike traditional savings groups that rely on trust and a central administrator, Ahjoor uses blockchain technology to automate rules, payouts, and transparency — no middleman required. Everything is verifiable on-chain.",
  },
  {
    q: "Can I use stablecoins instead of volatile crypto?",
    a: "Yes! Ahjoor supports stablecoin contributions so your group savings are protected from market volatility. This makes the experience familiar and predictable for everyone in the circle.",
  },
  {
    q: "Which blockchains are supported?",
    a: "Ahjoor currently supports Ethereum, Stellar, and Base. We're actively working to expand to more chains so your circle can use whatever network works best for your group.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-[#0e0e16] px-6 py-24 text-center">
      <div className="max-w-[720px] mx-auto">
        <p className="text-[11px] tracking-[3.5px] uppercase text-[#8b7cf8] mb-3 font-medium">
          Support
        </p>
        <h2 className="font-['Sora'] font-extrabold tracking-[-0.8px] text-white mb-[14px] text-[clamp(28px,4vw,42px)]">
          Frequently Asked Questions
        </h2>
        <p className="text-[#7878a0] text-[16px] mb-12">Got questions? We&apos;ve got answers.</p>

        <div className="flex flex-col gap-3 text-left" role="list" aria-label="Frequently asked questions">
          {faqs.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`bg-[#13131e] border rounded-[14px] overflow-hidden transition-colors duration-200 ${
                  isOpen ? "border-[rgba(108,92,231,0.35)]" : "border-white/[0.07]"
                }`}
                role="listitem"
              >
                <button
                  className={`flex justify-between items-center gap-4 w-full px-6 py-5 bg-transparent border-0 cursor-pointer font-['DM_Sans'] text-[15px] font-medium text-left transition-colors duration-200 hover:text-white ${
                    isOpen ? "text-white" : "text-[#eeeef8]"
                  }`}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                >
                  <span>{f.q}</span>
                  <span
                    className={`flex-shrink-0 flex transition-all duration-300 ${
                      isOpen ? "rotate-180 text-[#8b7cf8]" : "text-[#7878a0]"
                    }`}
                    aria-hidden="true"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>

                <div
                  id={`faq-answer-${i}`}
                  className={`overflow-hidden transition-all duration-[350ms] ease-in-out ${
                    isOpen ? "max-h-[200px]" : "max-h-0"
                  }`}
                  role="region"
                >
                  <p className="px-6 pb-5 text-[14px] text-[#7878a0] leading-[1.75]">{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
