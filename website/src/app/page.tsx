import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { AppGridMarquee } from "@/components/AppGridMarquee";
import { TaglineReveal } from "@/components/TaglineReveal";
import { InteractivePlayground } from "@/components/InteractivePlayground";
import { ContextEngineSection } from "@/components/ContextEngineSection";
import { FeatureBento } from "@/components/FeatureBento";
import { HowItWorks } from "@/components/HowItWorks";
import { ComparisonTable } from "@/components/ComparisonTable";
import { ProductivityCalculator } from "@/components/ProductivityCalculator";
import { ModelSelectorGuide } from "@/components/ModelSelectorGuide";
import { Testimonials } from "@/components/Testimonials";
import { DownloadSection } from "@/components/DownloadSection";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen bg-[#000000] text-white selection:bg-white/20 selection:text-white overflow-x-hidden">
      {/* Fluid Island Pill Navbar (B7) */}
      <Navbar />

      {/* Hero Section (B5: Capped at 680px, #FFFFFF -> #9B9B9B gradient text, single CTA) */}
      <Hero />

      {/* Universal Desktop App Compatibility Marquee */}
      <AppGridMarquee />

      {/* Mandatory Tagline Reveal Section (B11: Word by word on scroll) */}
      <TaglineReveal />

      {/* Interactive Voice Laboratory / Live Playground */}
      <InteractivePlayground />

      {/* Context Engine (App-Aware Formatting) */}
      <ContextEngineSection />

      {/* Feature Bento Grid (Flat cards, nested radii, outcome driven) */}
      <FeatureBento />

      {/* 3 Step Workflow */}
      <HowItWorks />

      {/* Comparison Matrix */}
      <ComparisonTable />

      {/* Time and Value ROI Calculator */}
      <ProductivityCalculator />

      {/* Whisper Models Hardware Selector */}
      <ModelSelectorGuide />

      {/* Social Proof & Testimonials */}
      <Testimonials />

      {/* OS Auto-Detect Download Section & Package Managers */}
      <DownloadSection />

      {/* Frequently Asked Questions */}
      <FAQSection />

      {/* Footer & Legal Links */}
      <Footer />
    </main>
  );
}
