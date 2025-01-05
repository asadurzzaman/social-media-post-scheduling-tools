import { PricingSection } from "@/components/subscription/PricingSection";
import { LandingNav } from "@/components/LandingNav";
import { Footer } from "@/components/Footer";

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 container mx-auto px-4 py-16">
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;