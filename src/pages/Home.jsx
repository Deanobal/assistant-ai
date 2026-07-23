import SEO from '../components/SEO';
import PremiumHomeExperience from '../components/home/PremiumHomeExperience';

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
          text: 'AssistantAI provides an AI receptionist that answers calls, captures enquiries, supports bookings and helps Australian service businesses follow up faster.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can it handle calls outside business hours?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. It can provide consistent first-response coverage after hours, capture the caller’s details and prepare the right next action for your team.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does it replace our team?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. AssistantAI handles repetitive first response and structured capture. Urgent, sensitive or complex enquiries can be escalated to a person.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can it connect to our existing systems?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AssistantAI can be configured around calendars, CRM workflows, payments, SMS and email tools depending on your plan and implementation requirements.',
        },
      },
    ],
  },
];

export default function Home() {
  return (
    <>
      <SEO
        title="AI Receptionist Australia for Service Businesses | AssistantAI"
        description="AssistantAI is an AI receptionist for Australian service businesses, answering calls 24/7, qualifying enquiries, supporting bookings and automating follow-up."
        canonicalPath="/"
        structuredData={structuredData}
        image={HERO_IMAGE}
        imageAlt={HERO_IMAGE_ALT}
      />
      <PremiumHomeExperience />
    </>
  );
}
