import { TopNavBar } from "@/components/TopNavBar";
import { HeroSection } from "@/components/HeroSection";
import { FeatureHighlight } from "@/components/FeatureHighlight";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-on-surface">
      <TopNavBar />
      
      <main>
        <HeroSection />
        <FeatureHighlight />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
