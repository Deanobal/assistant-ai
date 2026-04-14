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
    description: 'AssistantAI is an AI automation system for Australian service businesses focused on call handling, lead capture, job booking, follow-up automation, and CRM integration.',
    areaServed: {
      '@type': 'Country',
      name: 'Australia',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AssistantAI AI Automation System',
    provider: {
      '@type': 'Organization',
      name: 'AssistantAI',
      url: 'https://assistantai.com.au/',
    },
    serviceType: 'AI assistant, AI receptionist, lead capture, CRM integration, and service business automation',
    areaServed: {
      '@type': 'Country',
      name: 'Australia',
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Australian service businesses',
    },
    url: 'https://assistantai.com.au/',
    description: 'AssistantAI helps Australian cleaning, trades, property, and other service businesses reduce admin by 65%, save up to $30,000 per year, and cut response times by 80% with an AI assistant and AI receptionist.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AssistantAI',
    url: 'https://assistantai.com.au/',
    description: 'AI assistant, AI receptionist, and AI automation system for Australian service businesses.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What does AssistantAI do for service businesses?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AssistantAI provides an AI assistant and AI receptionist that answer calls, capture leads, book jobs, automate follow-up, and sync information into CRM systems for Australian service businesses.',
        },
      },
      {
        '@type': 'Question',
        name: 'Who is AssistantAI built for?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AssistantAI is built for Australian service-based businesses including cleaning, trades, property, and other service providers that want faster response times and less admin.',
        },
      },
    ],
  },
];

export default function Home() {
  return (
    <>
      <SEO
        title="AI Automation System for Australian Service Businesses | AI Assistant & AI Receptionist | AssistantAI"
        description="AssistantAI is an AI automation system for Australian service businesses that reduces admin by 65%, saves up to $30,000 per year, cuts response times by 80%, and improves lead capture, job booking, follow-up automation, and CRM integration."
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