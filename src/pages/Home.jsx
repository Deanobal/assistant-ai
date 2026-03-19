import React from 'react';
import HeroSection from '../components/home/HeroSection';
import TrustStrip from '../components/home/TrustStrip';
import ServicesPreview from '../components/home/ServicesPreview';
import EverythingWorksTogether from '../components/home/EverythingWorksTogether';
import HowItWorks from '../components/home/HowItWorks';
import UseCasesPreview from '../components/home/UseCasesPreview';
import PricingPreview from '../components/home/PricingPreview';
import CTASection from '../components/home/CTASection';

const HERO_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b3622e4aaa6acc06c2547f/9541496d0_generated_bc3bb2a9.png';

export default function Home() {
  return (
    <div>
      <HeroSection heroImage={HERO_IMAGE} />
      <TrustStrip />
      <ServicesPreview />
      <EverythingWorksTogether />
      <HowItWorks />
      <UseCasesPreview />
      <PricingPreview />
      <CTASection />
    </div>
  );
}