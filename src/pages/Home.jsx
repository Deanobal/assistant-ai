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
    description: 'AssistantAI provides AI assistant and AI receptionist solutions for Australian service businesses.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AssistantAI AI Assistant and AI Receptionist',
    provider: {
      '@type': 'Organization',
      name: 'AssistantAI',
      url: 'https://assistantai.com.au/',
    },
    serviceType: 'AI assistant and AI receptionist for call handling, lead capture, booking automation, and follow-up',
    areaServed: {
      '@type': 'Country',
      name: 'Australia',
    },
    url: 'https://assistantai.com.au/',
    description: 'AssistantAI helps Australian service businesses use an AI assistant and AI receptionist to answer calls, capture leads, book appointments, and automate follow-up.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AssistantAI',
    url: 'https://assistantai.com.au/',
    description: 'AI assistant and AI receptionist solutions for Australian service businesses.',
  },
];

export default function Home() {
  return (
    <>
      <SEO
        title="AI Assistant & AI Receptionist for Australian Businesses | AssistantAI"
        description="AssistantAI provides an AI assistant and AI receptionist for Australian service businesses to answer calls, capture leads, book appointments, and automate follow-up."
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