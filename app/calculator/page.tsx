import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/components/layout/Footer/Footer";
import SavingsCalculator from "@/components/calculator/SavingsCalculator";

export default function CalculatorPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-[var(--background)] pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold font-sora text-[var(--text)] mb-4">
              Simulate Your Savings
            </h1>
            <p className="text-[var(--muted)] text-lg max-w-2xl mx-auto">
              Use our interactive calculator to see projected payouts and timeline based on your group size and contribution preferences.
            </p>
          </div>
          <SavingsCalculator />
        </div>
      </div>
      <Footer />
    </main>
  );
}
