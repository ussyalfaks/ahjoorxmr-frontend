"use client";
import Link from "next/link";
import styles from "./Footer.module.css";

const footerLinks = ["Documentations", "Resources", "Securities", "Socials"];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
              <path d="M12 6v2m0 8v2M8.5 9.5l1.5 1.5m4 4l1.5 1.5M6 12h2m8 0h2M8.5 14.5l1.5-1.5m4-4l1.5-1.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          Ahjoor
        </Link>

        {/* Links */}
        <nav className={styles.links}>
          {footerLinks.map((l) => (
            <Link key={l} href="#" className={styles.link}>
              {l}
            </Link>
          ))}
        </nav>

        {/* Email subscribe */}
        <form className={styles.emailForm} onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter email address"
            className={styles.input}
            aria-label="Email address"
          />
          <button type="submit" className={styles.sendBtn}>
            Send
          </button>
        </form>

        <p className={styles.copy}>
          © {new Date().getFullYear()} Ahjoor. All rights reserved. Built with 💜 for communities worldwide.
        </p>
      </div>
    </footer>
  );
}
