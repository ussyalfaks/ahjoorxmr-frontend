const partners = [
  {
    name: "Stellar",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l2.5 6.5H21l-5.5 4 2 6.5L12 15.5 6.5 19l2-6.5L3 8.5h6.5z"/>
      </svg>
    ),
  },
  {
    name: "Ethereum",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
    <div className="px-10 py-11 border-t border-white/[0.07] border-b border-white/[0.07] text-center bg-white/[0.01] max-sm:px-6">
      <p className="text-[11px] tracking-[3.5px] uppercase text-[#7878a0] mb-6 font-medium">
        Supported By
      </p>
      <div className="flex items-center justify-center gap-[60px] flex-wrap max-sm:gap-8" role="list" aria-label="Supported platforms">
        {partners.map((p) => (
          <div
            key={p.name}
            className="flex items-center gap-[10px] text-[#7878a0] transition-colors duration-200 hover:text-white group"
            role="listitem"
          >
            {p.isBase ? (
              <span
                className="w-7 h-7 rounded-[6px] flex items-center justify-center font-['Sora'] font-extrabold text-[14px] text-white flex-shrink-0"
                style={{ background: "#0052ff" }}
                aria-hidden="true"
              >
                b
              </span>
            ) : (
              <span className="opacity-60 flex items-center group-hover:opacity-100 transition-opacity duration-200" aria-hidden="true">
                {p.icon}
              </span>
            )}
            <span className="font-['Sora'] font-bold text-[18px] tracking-[-0.3px] max-sm:text-[16px]">
              {p.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
