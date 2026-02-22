import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/components/layout/Footer/Footer";
import HeroSection from "@/components/sections/HeroSection";
import SupportedBy from "@/components/sections/SupportedBy";
import DashboardPreview from "@/components/sections/DashboardPreview";
import HowItWorks from "@/components/sections/HowItWorks";
import WhyAhjoor from "@/components/sections/WhyAhjoor";
import FAQSection from "@/components/sections/FAQSection";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <SupportedBy />
      <DashboardPreview />
      <HowItWorks />
      <WhyAhjoor />
      <FAQSection />
      <Footer />
    </main>
  );
}
