"use client";

import { useState } from "react";
import styles from "./FAQSection.module.css";

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
    <section className={styles.section} id="faq">
      <div className={styles.inner}>
        <p className={styles.label}>Support</p>
        <h2 className={styles.h2}>Frequently Asked Questions</h2>
        <p className={styles.sub}>Got questions? We've got answers.</p>

        <div className={styles.list}>
          {faqs.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`${styles.item} ${isOpen ? styles.open : ""}`}
              >
                <button
                  className={styles.question}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span>{f.q}</span>
                  <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
                <div className={`${styles.answer} ${isOpen ? styles.answerOpen : ""}`}>
                  <p>{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
