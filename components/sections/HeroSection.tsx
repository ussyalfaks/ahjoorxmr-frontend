import Image from "next/image";
import Link from "next/link";
import styles from "./HeroSection.module.css";

const coins = [
  { className: "coinTL" },
  { className: "coinTR" },
  { className: "coinBL" },
  { className: "coinBR" },
];

export default function HeroSection() {
  return (
    <section className={styles.hero} id="home">
      {/* Background glow */}
      <div className={styles.glow} />
      <div className={styles.glowSecondary} />

      {/* Badge */}
      <div className={`${styles.badge} animate-fade-up`}>
        <span className={styles.badgeDot} />
        Over $200,000 saved
      </div>

      {/* Headline */}
      <h1 className={`${styles.h1} animate-fade-up delay-1`}>
        Save With Friends..<br />
        <span className={styles.accent}>Save with Ahjoor</span>
      </h1>

      {/* Subtitle */}
      <p className={`${styles.subtitle} animate-fade-up delay-2`}>
        All on Your Decentralized Savings Group<br className={styles.brDesktop} /> In One Place
      </p>

      {/* CTAs */}
      <div className={`${styles.actions} animate-fade-up delay-3`}>
        <Link href="#" className={styles.btnPrimary}>
          Get Started Now
        </Link>
        <Link href="#how" className={styles.btnOutline}>
          How it Works ↓
        </Link>
      </div>

      {/* Hero image with floating coins */}
      <div className={`${styles.imgWrap} animate-fade-up delay-4`}>
        {coins.map((c, i) => (
          <div key={i} className={`${styles.coin} ${styles[c.className]}`}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="rgba(108,92,231,0.3)" stroke="#8b7cf8" strokeWidth="1.5"/>
              <path d="M12 6v12M9 8.5C9 7.12 10.34 6 12 6s3 1.12 3 2.5c0 1.38-1.34 2-3 2.5-1.66.5-3 1.12-3 2.5S10.34 18 12 18s3-1.12 3-2.5" stroke="#c4bbff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        ))}
        <div className={styles.imgGlow} />
        <Image
          src="/hero.png"
          alt="Friends saving together with Ahjoor"
          width={400}
          height={380}
          className={styles.img}
          priority
        />
      </div>
    </section>
  );
}
