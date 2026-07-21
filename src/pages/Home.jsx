import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import HeroSection from '../components/home/HeroSection';
import IntegrationStrip from '../components/home/IntegrationStrip';
import ProblemSection from '../components/home/ProblemSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import PrivacyDataSection from '../components/home/PrivacyDataSection';
import CredibilitySection from '../components/home/CredibilitySection';
import ServicesPreview from '../components/home/ServicesPreview';
import AdvancedAIFeatures from '../components/home/AdvancedAIFeatures';
import EverythingWorksTogether from '../components/home/EverythingWorksTogether';
import UseCasesPreview from '../components/home/UseCasesPreview';
import PlatformPreviewSection from '../components/home/PlatformPreviewSection';
import PricingPreview from '../components/home/PricingPreview';
import CTASection from '../components/home/CTASection';
import ROICalculator from '../components/home/ROICalculator';
import RevenueSystemSection from '../components/home/RevenueSystemSection';
import HighIntentLinks from '../components/seo/HighIntentLinks';

const SITE_URL = 'https://www.assistantai.com.au';
const HERO_IMAGE = 'https://rygyswsngskbdpgeqloy.supabase.co/storage/v1/object/public/site-assets/Hero.png';
const HERO_IMAGE_ALT = 'AssistantAI AI assistant and AI receptionist for Australian service businesses';
const LOGO_URL = 'https://rygyswsngskbdpgeqloy.supabase.co/storage/v1/object/public/site-assets/logoai.png';

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'AssistantAI',
    url: `${SITE_URL}/`,
    logo: LOGO_URL,
    email: 'sales@assistantai.com.au',
    areaServed: 'AU',
    description: 'AssistantAI helps Australian service businesses use an AI assistant to answer missed calls, capture new enquiries, support bookings, and follow up faster.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'AssistantAI',
    url: `${SITE_URL}/`,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-AU',
    description: 'AI assistant, AI receptionist and enquiry follow-up support for Australian service businesses.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/#ai-assistant-service`,
    name: 'AssistantAI AI Assistant and AI Receptionist',
    provider: { '@id': `${SITE_URL}/#organization` },
    serviceType: 'AI assistant, AI receptionist, enquiry capture, booking support, CRM follow-up automation, and service business call answering',
    areaServed: 'AU',
    audience: {
      '@type': 'BusinessAudience',
      audienceType: 'Australian service businesses',
    },
    url: `${SITE_URL}/`,
    description: 'AssistantAI helps Australian cleaning, trades, property, clinic, legal, real estate, and service businesses answer calls, capture enquiries, reduce admin, and follow up faster with an AI assistant and AI receptionist system.',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'AssistantAI plans',
      itemListElement: [
        {
          '@type': 'Offer',
          name: 'Starter',
          price: '497',
          priceCurrency: 'AUD',
          url: `${SITE_URL}/GetStartedNow?plan=starter`,
          description: 'AI assistant and receptionist setup for missed-call coverage, lead capture, and simple follow-up. Setup fee applies.',
        },
        {
          '@type': 'Offer',
          name: 'Growth',
          price: '1500',
          priceCurrency: 'AUD',
          url: `${SITE_URL}/GetStartedNow?plan=growth`,
          description: 'AI call handling, booking support, customer updates, and SMS/email follow-up. Setup fee applies.',
        },
        {
          '@type': 'Offer',
          name: 'Enterprise',
          url: `${SITE_URL}/Contact`,
          description: 'Custom AI assistant, receptionist and workflow automation review for multi-location, complex routing, and advanced integrations.',
        },
      ],
    },
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
          text: 'AssistantAI provides an AI assistant and AI receptionist that answers calls, captures enquiries, supports bookings, and helps Australian service businesses follow up faster.',
        },
      },
      {
        '@type': 'Question',
        name: 'Who is AssistantAI built for?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AssistantAI is built for Australian service-based businesses including cleaning, trades, clinics, property, real estate, legal, and other service providers that want faster response times and less admin.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can AssistantAI help recover missed calls?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. AssistantAI can answer enquiries, capture caller details, identify urgency, and support follow-up workflows so fewer high-intent leads are lost.',
        },
      },
    ],
  },
];

export default function Home() {
  return (
    <>
      <SEO
        title="AI Assistant & AI Receptionist for Australian Businesses | AssistantAI"
        description="AssistantAI gives Australian service businesses an AI assistant that answers calls, captures leads, supports bookings, follows up faster, and turns more enquiries into paying clients."
        canonicalPath="/"
        structuredData={structuredData}
        image={HERO_IMAGE}
        imageAlt={HERO_IMAGE_ALT}
      />
      <div className="pb-24 md:pb-0">
        <HeroSection />
        <IntegrationStrip />
        <ProblemSection />
        <ROICalculator />
        <RevenueSystemSection />
        <HighIntentLinks compact />
        <HowItWorksSection />
        <PrivacyDataSection />
        <CredibilitySection />
        <ServicesPreview />
        <AdvancedAIFeatures />
        <EverythingWorksTogether />
        <UseCasesPreview />
        <PlatformPreviewSection />
        <PricingPreview />
        <CTASection />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0a0a0f]/92 px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl md:hidden">
        <Link
          to="/GetStartedNow"
          className="mx-auto flex min-h-[3.25rem] max-w-md items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/20"
        >
          Sign Up Now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </>
  );
}
