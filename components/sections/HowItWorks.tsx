import Link from "next/link";

const steps = [
  {
    title: "Join or Create a Circle",
    desc: "Pick your savings group, set the rules.",
  },
  {
    title: "Contribute in Crypto",
    desc: "Everyone contributes on schedule.",
  },
  {
    title: "Payout in Turns",
    desc: "Each member receives the pooled funds when it's their turn.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="bg-[#0e0e16] px-6 py-24 text-center">
      <div className="max-w-[480px] mx-auto">
        <p className="text-[11px] tracking-[3.5px] uppercase text-[#8b7cf8] mb-3 font-medium">
          Process
        </p>
        <h2 className="font-['Sora'] font-extrabold tracking-[-0.8px] text-white mb-[14px] text-[clamp(28px,4vw,42px)]">
          How it Works
        </h2>
        <p className="text-[#7878a0] text-[16px] mb-[52px]">
          Three simple steps to start saving with your circle
        </p>

        <ol className="flex flex-col items-center gap-0 mb-12 list-none" aria-label="Steps to get started">
          {steps.map((s, i) => (
            <li key={s.title} className="flex flex-col items-center w-full">
              <div
                className="flex items-center gap-[18px] bg-[#13131e] border border-white/[0.07] rounded-[16px] px-7 py-[22px] w-full text-left transition-all duration-200 hover:border-[rgba(108,92,231,0.45)] hover:translate-x-1"
                style={{ "--glow": "rgba(108,92,231,0.3)" } as React.CSSProperties}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.boxShadow = "0 0 28px rgba(108,92,231,0.3)")}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div
                  className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-['Sora'] font-bold text-[15px] text-white"
                  style={{
                    background: "linear-gradient(135deg, #6c5ce7, #8b7cf8)",
                    boxShadow: "0 0 14px rgba(108,92,231,0.3)",
                  }}
                  aria-hidden="true"
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-['Sora'] text-[16px] font-bold text-white mb-1">
                    {s.title}
                  </h3>
                  <p className="text-[14px] text-[#7878a0]">{s.desc}</p>
                </div>
              </div>

              {i < steps.length - 1 && (
                <div className="text-[#8b7cf8] py-2 opacity-50" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </li>
          ))}
        </ol>

        <Link
          href="#"
          className="inline-block text-white no-underline px-8 py-[13px] rounded-[12px] font-['Sora'] font-semibold text-[15px] transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #6c5ce7, #8b7cf8)",
            boxShadow: "0 4px 20px rgba(108,92,231,0.3)",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.boxShadow = "0 10px 30px rgba(108,92,231,0.3)")}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(108,92,231,0.3)")}
        >
          Get Started Now
        </Link>
      </div>
    </section>
  );
}
