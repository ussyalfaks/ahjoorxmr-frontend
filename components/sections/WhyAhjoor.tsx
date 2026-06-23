import Link from "next/link";

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
    <section id="why" className="px-6 py-24 text-center">
      <div className="max-w-[1000px] mx-auto">
        <p className="text-[11px] tracking-[3.5px] uppercase text-[#8b7cf8] mb-3 font-medium">
          Features
        </p>
        <h2 className="font-['Sora'] font-extrabold tracking-[-0.8px] text-white mb-[14px] text-[clamp(28px,4vw,42px)]">
          Why Ahjoor?
        </h2>
        <p className="text-[#7878a0] text-[16px] max-w-[500px] mx-auto mb-14">
          Built for communities, powered by blockchain — savings made trustless and borderless.
        </p>

        <div className="grid grid-cols-3 gap-[18px] mb-12 max-[900px]:grid-cols-2 max-sm:grid-cols-1">
          {features.map((f) => (
            <article
              key={f.title}
              className="bg-[#13131e] border border-white/[0.07] rounded-[18px] px-6 py-7 text-left transition-all duration-[250ms] relative overflow-hidden group hover:border-[rgba(108,92,231,0.4)] hover:-translate-y-[5px]"
              onMouseEnter={(e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.boxShadow = "0 20px 48px rgba(0,0,0,0.35)")}
              onMouseLeave={(e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.boxShadow = "none")}
            >
              {/* Top accent line on hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(90deg, transparent, #6c5ce7, transparent)" }} aria-hidden="true" />

              <div
                className="w-[50px] h-[50px] rounded-[13px] flex items-center justify-center text-[24px] mb-[18px] border border-[rgba(108,92,231,0.2)]"
                style={{ background: "rgba(108,92,231,0.15)" }}
                aria-hidden="true"
              >
                {f.icon}
              </div>
              <h3 className="font-['Sora'] text-[16px] font-bold text-white mb-[10px] tracking-[-0.2px]">
                {f.title}
              </h3>
              <p className="text-[14px] text-[#7878a0] leading-[1.75]">{f.desc}</p>
            </article>
          ))}
        </div>

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
          Join a Circle Today
        </Link>
      </div>
    </section>
  );
}
