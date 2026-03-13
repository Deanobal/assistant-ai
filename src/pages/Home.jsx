import React from 'react';
import HeroSection from '../components/home/HeroSection';
import WhatAgentsDo from '../components/home/WhatAgentsDo';
import BenefitsSection from '../components/home/BenefitsSection';
import ServicesPreview from '../components/home/ServicesPreview';
import IndustriesPreview from '../components/home/IndustriesPreview';
import HowItWorks from '../components/home/HowItWorks';
import PricingPreview from '../components/home/PricingPreview';
import TrustSection from '../components/home/TrustSection';
import CTASection from '../components/home/CTASection';

const HERO_IMAGE = '/__generating__/img_8c863036a6cf.png';
const ABOUT_IMAGE = '/__generating__/img_359dab355ed6.png';

export default function Home() {
  return (
    <div>
      <HeroSection heroImage={HERO_IMAGE} />
      <WhatAgentsDo />
      <BenefitsSection />
      <ServicesPreview />
      <IndustriesPreview />
      <HowItWorks />
      <PricingPreview />
      <TrustSection aboutImage={ABOUT_IMAGE} />
      <CTASection />
    </div>
  );
}