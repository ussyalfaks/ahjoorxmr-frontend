import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-[130px] pb-20 relative overflow-hidden max-sm:pt-[110px] max-sm:pb-[60px]"
    >
      {/* Background glow */}
      <div
        className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[760px] h-[760px] pointer-events-none animate-pulse-glow"
        style={{ background: "radial-gradient(circle, rgba(108,92,231,0.16) 0%, transparent 68%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,124,248,0.08) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Badge */}
      <div className="animate-fade-up inline-flex items-center gap-2 bg-[rgba(108,92,231,0.12)] border border-[rgba(108,92,231,0.35)] text-[#8b7cf8] px-[18px] py-[7px] rounded-full text-[13px] font-semibold mb-7 tracking-[0.2px]">
        <span className="w-[7px] h-[7px] bg-[#4ade80] rounded-full animate-pulse-badge" aria-hidden="true" />
        Over $200,000 saved
      </div>

      {/* Headline */}
      <h1 className="animate-fade-up delay-1 font-['Sora'] font-extrabold leading-[1.08] tracking-[-1.5px] text-white mb-[22px] text-[clamp(38px,6vw,72px)]">
        Save With Friends..<br />
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(135deg, #8b7cf8 0%, #c4bbff 100%)" }}
        >
          Save with Ahjoor
        </span>
      </h1>

      {/* Subtitle */}
      <p className="animate-fade-up delay-2 text-[#7878a0] max-w-[440px] mx-auto mb-[38px] leading-[1.6] text-[clamp(16px,2.5vw,19px)]">
        All on Your Decentralized Savings Group{" "}
        <br className="hidden sm:block" />
        In One Place
      </p>

      {/* CTAs */}
      <div className="animate-fade-up delay-3 flex gap-[14px] justify-center flex-wrap mb-16">
        <Link
          href="#"
          className="text-white no-underline px-7 py-[13px] rounded-[12px] font-['Sora'] font-semibold text-[15px] transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #6c5ce7, #8b7cf8)",
            boxShadow: "0 4px 20px rgba(108,92,231,0.3)",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.boxShadow = "0 10px 30px rgba(108,92,231,0.3)")}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(108,92,231,0.3)")}
        >
          Get Started Now
        </Link>
        <Link
          href="#how"
          className="bg-transparent border border-white/[0.07] text-[#eeeef8] no-underline px-7 py-[13px] rounded-[12px] font-['Sora'] font-medium text-[15px] transition-all duration-200 hover:bg-[#13131e] hover:border-[#6c5ce7] hover:-translate-y-0.5"
        >
          How it Works ↓
        </Link>
      </div>

      {/* Hero image with floating coins */}
      <div className="animate-fade-up delay-4 relative w-[380px] max-w-[90vw]">
        {/* Floating coin — top left */}
        <div
          className="absolute top-6 -left-7 w-[52px] h-[52px] border border-[rgba(139,124,248,0.5)] rounded-full flex items-center justify-center z-[2] animate-float"
          style={{
            background: "linear-gradient(135deg, #1a1a30, #2a2845)",
            boxShadow: "0 0 20px rgba(108,92,231,0.3), inset 0 0 12px rgba(108,92,231,0.1)",
          }}
          aria-hidden="true"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="rgba(108,92,231,0.3)" stroke="#8b7cf8" strokeWidth="1.5"/>
            <path d="M12 6v12M9 8.5C9 7.12 10.34 6 12 6s3 1.12 3 2.5c0 1.38-1.34 2-3 2.5-1.66.5-3 1.12-3 2.5S10.34 18 12 18s3-1.12 3-2.5" stroke="#c4bbff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Floating coin — top right */}
        <div
          className="absolute top-6 -right-7 w-[52px] h-[52px] border border-[rgba(139,124,248,0.5)] rounded-full flex items-center justify-center z-[2] animate-float-delay-1"
          style={{
            background: "linear-gradient(135deg, #1a1a30, #2a2845)",
            boxShadow: "0 0 20px rgba(108,92,231,0.3), inset 0 0 12px rgba(108,92,231,0.1)",
          }}
          aria-hidden="true"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="rgba(108,92,231,0.3)" stroke="#8b7cf8" strokeWidth="1.5"/>
            <path d="M12 6v12M9 8.5C9 7.12 10.34 6 12 6s3 1.12 3 2.5c0 1.38-1.34 2-3 2.5-1.66.5-3 1.12-3 2.5S10.34 18 12 18s3-1.12 3-2.5" stroke="#c4bbff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Floating coin — bottom left */}
        <div
          className="absolute bottom-6 -left-7 w-[52px] h-[52px] border border-[rgba(139,124,248,0.5)] rounded-full flex items-center justify-center z-[2] animate-float-delay-2 max-sm:-left-[10px]"
          style={{
            background: "linear-gradient(135deg, #1a1a30, #2a2845)",
            boxShadow: "0 0 20px rgba(108,92,231,0.3), inset 0 0 12px rgba(108,92,231,0.1)",
          }}
          aria-hidden="true"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="rgba(108,92,231,0.3)" stroke="#8b7cf8" strokeWidth="1.5"/>
            <path d="M12 6v12M9 8.5C9 7.12 10.34 6 12 6s3 1.12 3 2.5c0 1.38-1.34 2-3 2.5-1.66.5-3 1.12-3 2.5S10.34 18 12 18s3-1.12 3-2.5" stroke="#c4bbff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Floating coin — bottom right */}
        <div
          className="absolute bottom-6 -right-7 w-[52px] h-[52px] border border-[rgba(139,124,248,0.5)] rounded-full flex items-center justify-center z-[2] animate-float-delay-3 max-sm:-right-[10px]"
          style={{
            background: "linear-gradient(135deg, #1a1a30, #2a2845)",
            boxShadow: "0 0 20px rgba(108,92,231,0.3), inset 0 0 12px rgba(108,92,231,0.1)",
          }}
          aria-hidden="true"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="rgba(108,92,231,0.3)" stroke="#8b7cf8" strokeWidth="1.5"/>
            <path d="M12 6v12M9 8.5C9 7.12 10.34 6 12 6s3 1.12 3 2.5c0 1.38-1.34 2-3 2.5-1.66.5-3 1.12-3 2.5S10.34 18 12 18s3-1.12 3-2.5" stroke="#c4bbff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Image glow */}
        <div
          className="absolute inset-[-20px] z-0"
          style={{ background: "radial-gradient(circle, rgba(108,92,231,0.2) 0%, transparent 70%)" }}
          aria-hidden="true"
        />

        <Image
          src="/hero.png"
          alt="Friends saving together with Ahjoor"
          width={400}
          height={380}
          className="w-full h-auto rounded-[22px] object-cover relative z-[1]"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}
          priority
        />
      </div>
    </section>
  );
}
