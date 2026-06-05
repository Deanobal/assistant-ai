import SEO from '../components/SEO';
import HeroSection from '../components/home/HeroSection';
import TrustStrip from '../components/home/TrustStrip';
import ProblemSection from '../components/home/ProblemSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import CredibilitySection from '../components/home/CredibilitySection';
import ServicesPreview from '../components/home/ServicesPreview';
import AdvancedAIFeatures from '../components/home/AdvancedAIFeatures';
import EverythingWorksTogether from '../components/home/EverythingWorksTogether';
import HowItWorks from '../components/home/HowItWorks';
import UseCasesPreview from '../components/home/UseCasesPreview';
import PlatformPreviewSection from '../components/home/PlatformPreviewSection';
import PricingPreview from '../components/home/PricingPreview';
import CTASection from '../components/home/CTASection';
import ROICalculator from '../components/home/ROICalculator';
import RevenueSystemSection from '../components/home/RevenueSystemSection';

const HERO_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b3622e4aaa6acc06c2547f/9541496d0_generated_bc3bb2a9.png';
const HERO_IMAGE_ALT = 'AssistantAI AI receptionist for Australian service businesses';

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AssistantAI',
    url: 'https://assistantai.com.au/',
    logo: 'https://assistantai.com.au/icons/admin-inbox-icon.svg',
    description: 'AssistantAI helps Australian service businesses answer missed calls, capture new enquiries, support bookings, and follow up faster.',
    areaServed: {
      '@type': 'Country',
      name: 'Australia',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AssistantAI AI Receptionist',
    provider: {
      '@type': 'Organization',
      name: 'AssistantAI',
      url: 'https://assistantai.com.au/',
    },
    serviceType: 'AI receptionist, enquiry capture, booking support, and follow-up for service businesses',
    areaServed: {
      '@type': 'Country',
      name: 'Australia',
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Australian service businesses',
    },
    url: 'https://assistantai.com.au/',
    description: 'AssistantAI helps Australian cleaning, trades, property, and other service businesses answer calls, capture enquiries, reduce admin, and follow up faster with an AI receptionist.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AssistantAI',
    url: 'https://assistantai.com.au/',
    description: 'AI receptionist and enquiry follow-up support for Australian service businesses.',
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
          text: 'AssistantAI provides an AI receptionist that answers calls, captures enquiries, supports bookings, and helps Australian service businesses follow up faster.',
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
        title="AI Receptionist for Australian Service Businesses | AssistantAI"
        description="AssistantAI helps Australian service businesses answer missed calls, capture new enquiries, support bookings, follow up faster, and turn more leads into paying clients."
        canonicalPath="/"
        structuredData={structuredData}
        image={HERO_IMAGE}
        imageAlt={HERO_IMAGE_ALT}
      />
      <div>
        <HeroSection />
        <TrustStrip />
        <ProblemSection />
        <ROICalculator />
        <RevenueSystemSection />
        <HowItWorksSection />
        <CredibilitySection />
        <ServicesPreview />
        <AdvancedAIFeatures />
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
