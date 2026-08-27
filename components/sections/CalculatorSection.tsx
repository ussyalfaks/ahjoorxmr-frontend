import SavingsCalculator from "@/components/calculator/SavingsCalculator";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CalculatorSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-[var(--background)] border-y border-[var(--border)]">
      {/* Decorative gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4B6B76]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="lg:w-1/3 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold font-sora text-[var(--text)] mb-6 tracking-tight">
              Plan your goals <span className="text-[#4B6B76]">with precision</span>
            </h2>
            <p className="text-[var(--muted)] text-lg mb-8 leading-relaxed">
              Use our interactive simulator to calculate your exact payout schedule before you even start a circle. 
              Adjust the contribution amount, participant count, and frequency to find the perfect balance.
            </p>
            <div className="flex justify-center lg:justify-start">
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 bg-[var(--ov-0a)] hover:bg-[var(--ov-1a)] text-[var(--text)] px-6 py-3 rounded-xl font-medium transition-colors border border-[var(--border)]"
              >
                Open Full Calculator
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="lg:w-2/3 w-full">
            <SavingsCalculator />
          </div>
        </div>
      </div>
    </section>
  );
}
