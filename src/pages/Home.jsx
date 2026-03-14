import React from 'react';
import HeroSection from '../components/home/HeroSection';
import WhatAgentsDo from '../components/home/WhatAgentsDo';
import BenefitsSection from '../components/home/BenefitsSection';
import ServicesPreview from '../components/home/ServicesPreview';
import IndustriesPreview from '../components/home/IndustriesPreview';
import HowItWorks from '../components/home/HowItWorks';
import PricingPreview from '../components/home/PricingPreview';
import TrustSection from '../components/home/TrustSection';
import ROICalculator from '../components/home/ROICalculator';
import CTASection from '../components/home/CTASection';

const HERO_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b3622e4aaa6acc06c2547f/9541496d0_generated_bc3bb2a9.png';
const ABOUT_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b3622e4aaa6acc06c2547f/e62f92cba_generated_bfd2150b.png';

export default function Home() {
  return (
    <div>
      <HeroSection heroImage={HERO_IMAGE} />
      <WhatAgentsDo />
      <BenefitsSection />
      <ServicesPreview />
      <ROICalculator />
      <IndustriesPreview />
      <HowItWorks />
      <PricingPreview />
      <TrustSection aboutImage={ABOUT_IMAGE} />
      <CTASection />
    </div>
  );
}