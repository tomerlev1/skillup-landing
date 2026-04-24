import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import TrustBarSection from "@/components/landing/TrustBarSection";
import QuickAnswerSection from "@/components/landing/QuickAnswerSection";
import PainPointsSection from "@/components/landing/PainPointsSection";
import KineticTickerSection from "@/components/landing/KineticTickerSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import SubjectsSection from "@/components/landing/SubjectsSection";
import ForTutorsSection from "@/components/landing/ForTutorsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <section id="hero" className="relative w-full">
          <HeroSection />
        </section>

        <TrustBarSection />

        <QuickAnswerSection />

        <section id="why-skillup" className="w-full">
          <PainPointsSection />
        </section>

        <KineticTickerSection />

        <section id="how-it-works" className="w-full">
          <HowItWorksSection />
        </section>

        <SubjectsSection />

        <ForTutorsSection />

        <section id="features" className="w-full">
          <FeaturesSection />
        </section>

        <TestimonialsSection />

        <FAQSection />

        <section id="download" className="w-full">
          <CTASection />
        </section>
      </main>
      <Footer />
    </>
  );
}
