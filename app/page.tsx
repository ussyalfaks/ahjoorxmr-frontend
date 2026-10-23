import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/components/layout/Footer/Footer";
import HeroSection from "@/components/sections/HeroSection";
import SupportedBy from "@/components/sections/SupportedBy";
import DashboardPreview from "@/components/sections/DashboardPreview";
import HowItWorks from "@/components/sections/HowItWorks";
import CalculatorSection from "@/components/sections/CalculatorSection";
import WhyAhjoor from "@/components/sections/WhyAhjoor";
import Testimonials from "@/components/sections/Testimonials";
import FAQSection from "@/components/sections/FAQSection";

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-gray-900 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to main content
      </a>
      <header>
        <Navbar />
      </header>
      <main id="main-content">
        <HeroSection />
        <SupportedBy />
        <DashboardPreview />
        <HowItWorks />
        <CalculatorSection />
        <WhyAhjoor />
        <Testimonials />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
