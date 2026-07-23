import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroSection from './HeroSection';
import PremiumFAQSection from './PremiumFAQSection';
import PremiumIndustrySection from './PremiumIndustrySection';
import PremiumPricingSection from './PremiumPricingSection';
import PremiumWorkflowSection from './PremiumWorkflowSection';

export default function PremiumHomeExperience() {
  return (
    <div className="bg-[#030812]">
      <HeroSection />
      <PremiumWorkflowSection />
      <PremiumIndustrySection />
      <PremiumPricingSection />
      <PremiumFAQSection />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#263348] bg-[#04101c]/94 px-4 py-3 backdrop-blur-xl md:hidden">
        <Link
          to="/GetStartedNow"
          className="mx-auto flex min-h-[3.25rem] max-w-md items-center justify-center gap-2 rounded-[12px] border border-[#347cff] bg-[#0b4dbb] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(31,111,255,0.3)]"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
