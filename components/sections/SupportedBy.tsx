import styles from "./SupportedBy.module.css";

const partners = [
  {
    name: "Stellar",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.5 6.5H21l-5.5 4 2 6.5L12 15.5 6.5 19l2-6.5L3 8.5h6.5z"/>
      </svg>
    ),
  },
  {
    name: "Ethereum",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
      </svg>
    ),
  },
  {
    name: "base",
    isBase: true,
  },
];

export default function SupportedBy() {
  return (
    <div className={styles.wrap}>
      <p className={styles.label}>Supported By</p>
      <div className={styles.logos}>
        {partners.map((p) => (
          <div key={p.name} className={styles.brand}>
            {p.isBase ? (
              <span className={styles.baseIcon}>b</span>
            ) : (
              <span className={styles.icon}>{p.icon}</span>
            )}
            <span className={styles.brandName}>{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
