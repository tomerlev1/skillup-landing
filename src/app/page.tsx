import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import QuickAnswerSection from "@/components/landing/QuickAnswerSection";
import TrustBarSection from "@/components/landing/TrustBarSection";
import PainPointsSection from "@/components/landing/PainPointsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import SubjectsSection from "@/components/landing/SubjectsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ForTutorsSection from "@/components/landing/ForTutorsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import StatsSection from "@/components/landing/StatsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <section id="hero" className="relative min-h-svh w-full">
          <HeroSection />
        </section>

        <QuickAnswerSection />

        <TrustBarSection />

        <section id="why-skillup" className="w-full">
          <PainPointsSection />
        </section>

        <div className="hairline mx-auto max-w-5xl" />

        <section id="how-it-works" className="w-full">
          <HowItWorksSection />
        </section>

        <SubjectsSection />

        <TestimonialsSection />

        <ForTutorsSection />

        <section id="features" className="w-full">
          <FeaturesSection />
        </section>

        <div className="hairline mx-auto max-w-5xl" />

        <section id="stats" className="w-full">
          <StatsSection />
        </section>

        <FAQSection />

        <section id="download" className="w-full">
          <CTASection />
        </section>
      </main>
      <Footer />
    </>
  );
}
