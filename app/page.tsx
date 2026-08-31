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
    <main>
      <Navbar />
      <HeroSection />
      <SupportedBy />
      <DashboardPreview />
      <HowItWorks />
      <CalculatorSection />
      <WhyAhjoor />
      <Testimonials />
      <FAQSection />
      <Footer />
    </main>
  );
}
