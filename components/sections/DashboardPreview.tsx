import styles from "./DashboardPreview.module.css";

const stats = [
  { label: "Total Saved", value: "$1000" },
  { label: "Members", value: "8" },
  { label: "Next Payout", value: "$10" },
  { label: "Payout Rounds", value: "3" },
];

const groupMeta = [
  { label: "Members", value: "👥 2" },
  { label: "Contributions", value: "💎 3 STRK" },
  { label: "Duration", value: "⏱ 2 Days" },
  { label: "Current Round", value: "🔄 1/3" },
];

export default function DashboardPreview() {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {/* Stats row */}
        <div className={styles.statsRow}>
          {stats.map((s) => (
            <div key={s.label} className={styles.statBox}>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statValue}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Group section */}
        <div className={styles.sectionTitle}>Your Savings Groups</div>
        <div className={styles.groupCard}>
          <div className={styles.groupHeader}>
            <div className={styles.groupName}>
              <span className={styles.dot} />
              Family savings
              <span className={styles.tag}>Active</span>
            </div>
            <div className={styles.groupSub}>Ongoing Circle</div>
          </div>
          <div className={styles.metaGrid}>
            {groupMeta.map((m) => (
              <div key={m.label} className={styles.metaItem}>
                <div className={styles.metaLabel}>{m.label}</div>
                <div className={styles.metaValue}>{m.value}</div>
              </div>
            ))}
          </div>
          <button className={styles.viewBtn}>View Details →</button>
        </div>
      </div>
    </div>
  );
}
