import * as React from 'react';
import SEO from '../components/SEO';
import HeroSection from '../components/home/HeroSection';
import TrustStrip from '../components/home/TrustStrip';
import ProblemSection from '../components/home/ProblemSection';
import ServicesPreview from '../components/home/ServicesPreview';
import EverythingWorksTogether from '../components/home/EverythingWorksTogether';
import HowItWorks from '../components/home/HowItWorks';
import UseCasesPreview from '../components/home/UseCasesPreview';
import PlatformPreviewSection from '../components/home/PlatformPreviewSection';
import PricingPreview from '../components/home/PricingPreview';
import CTASection from '../components/home/CTASection';

const HERO_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b3622e4aaa6acc06c2547f/9541496d0_generated_bc3bb2a9.png';

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AssistantAI',
    url: 'https://assistantai.com.au/',
    logo: 'https://assistantai.com.au/icons/admin-inbox-icon.svg',
    description: 'AssistantAI helps Australian service businesses answer calls, capture leads, automate bookings, and streamline follow-up workflows.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'AssistantAI',
    brand: {
      '@type': 'Brand',
      name: 'AssistantAI',
    },
    category: 'AI call handling and business automation',
    description: 'A done-for-you AI automation service for call answering, lead capture, booking automation, CRM sync, and follow-up workflows.',
    url: 'https://assistantai.com.au/',
  },
];

export default function Home() {
  return (
    <>
      <SEO
        title="AssistantAI | AI Call Handling & Lead Capture for Australian Businesses"
        description="AssistantAI helps Australian service businesses answer calls instantly, capture more leads, automate bookings, and streamline follow-up workflows."
        canonicalPath="/"
        structuredData={structuredData}
      />
      <div>
      <HeroSection heroImage={HERO_IMAGE} />
      <TrustStrip />
      <ProblemSection />
      <ServicesPreview />
      <EverythingWorksTogether />
      <HowItWorks />
      <UseCasesPreview />
      <PlatformPreviewSection />
      <PricingPreview />
      <CTASection />
      </div>
    </>
  );
}