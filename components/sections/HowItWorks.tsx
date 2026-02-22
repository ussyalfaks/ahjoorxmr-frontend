import Link from "next/link";
import styles from "./HowItWorks.module.css";

const steps = [
  {
    title: "Join or Create a Circle",
    desc: "Pick your savings group, set the rules.",
    icon: "🔵",
  },
  {
    title: "Contribute in Crypto",
    desc: "Everyone contributes on schedule.",
    icon: "💎",
  },
  {
    title: "Payout in Turns",
    desc: "Each member receives the pooled funds when it's their turn.",
    icon: "💸",
  },
];

export default function HowItWorks() {
  return (
    <section className={styles.section} id="how">
      <div className={styles.inner}>
        <p className={styles.label}>Process</p>
        <h2 className={styles.h2}>How it Works</h2>
        <p className={styles.sub}>Three simple steps to start saving with your circle</p>

        <div className={styles.steps}>
          {steps.map((s, i) => (
            <div key={s.title} className={styles.stepGroup}>
              <div className={styles.step}>
                <div className={styles.stepNum}>{i + 1}</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className={styles.arrow}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <Link href="#" className={styles.cta}>
          Get Started Now
        </Link>
      </div>
    </section>
  );
}
