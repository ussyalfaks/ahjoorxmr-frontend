import Link from "next/link";
import styles from "./WhyAhjoor.module.css";

const features = [
  {
    icon: "🌍",
    title: "Borderless Contributions",
    desc: "Join a savings circle from anywhere in the world. Whether your group members are in Lagos, London, or New York, Ahjoor removes location barriers.",
  },
  {
    icon: "🏦",
    title: "Bank-Grade Security",
    desc: "Your money is protected by smart contracts and enterprise-level security systems. Funds are automatically managed on-chain.",
  },
  {
    icon: "🔗",
    title: "On-Chain Transparency",
    desc: "Every contribution, payout, and transaction is recorded on the blockchain for all group members to see.",
  },
  {
    icon: "🚫",
    title: "No Middleman",
    desc: "Say goodbye to relying on a treasurer or group admin to manage your funds. Ahjoor eliminates the need for a central authority.",
  },
  {
    icon: "💵",
    title: "Stablecoin Option",
    desc: "Protect your group savings from crypto market volatility by contributing with stable coins. Your contributions hold their stable value.",
  },
  {
    icon: "⚡",
    title: "Automated Payouts",
    desc: "No delays, no manual reminders. When it's your turn, Ahjoor's smart contracts automatically release your payout.",
  },
];

export default function WhyAhjoor() {
  return (
    <section className={styles.section} id="why">
      <div className={styles.inner}>
        <p className={styles.label}>Features</p>
        <h2 className={styles.h2}>Why Ahjoor?</h2>
        <p className={styles.sub}>
          Built for communities, powered by blockchain — savings made trustless and borderless.
        </p>

        <div className={styles.grid}>
          {features.map((f) => (
            <div key={f.title} className={styles.card}>
              <div className={styles.icon}>{f.icon}</div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>

        <Link href="#" className={styles.cta}>
          Join a Circle Today
        </Link>
      </div>
    </section>
  );
}
