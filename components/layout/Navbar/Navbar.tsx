"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Navbar.module.css";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "How it Works", href: "#how" },
  { label: "Features", href: "#why" },
  { label: "FAQs", href: "#faq" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
              <path d="M12 6v2m0 8v2M8.5 9.5l1.5 1.5m4 4l1.5 1.5M6 12h2m8 0h2M8.5 14.5l1.5-1.5m4-4l1.5-1.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          Ahjoor
        </Link>

        {/* Desktop links */}
        <ul className={styles.links}>
          {navLinks.map((l) => (
            <li key={l.label}>
              <Link href={l.href} className={styles.link}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link href="#" className={styles.cta}>
          Get Started
        </Link>

        {/* Mobile hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={menuOpen ? styles.barTop + " " + styles.open : styles.barTop} />
          <span className={menuOpen ? styles.barMid + " " + styles.open : styles.barMid} />
          <span className={menuOpen ? styles.barBot + " " + styles.open : styles.barBot} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link href="#" className={styles.mobileCta}>
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
