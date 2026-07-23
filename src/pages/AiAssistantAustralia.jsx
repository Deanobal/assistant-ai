import { CalendarCheck2, ContactRound, PhoneCall, Send } from 'lucide-react';
import SEO from '../components/SEO';
import {
  AccentText,
  CapabilityRail,
  ConversionCTA,
  FAQRows,
  FeatureSplit,
  OutcomeList,
  PageHero,
  PageShell,
  Section,
  SectionHeading,
} from '@/components/marketing/PremiumMarketing';

const SITE_URL = 'https://www.assistantai.com.au';
const pageTitle = 'AI Assistant Australia | Calls, Leads, Bookings & Follow-Up | AssistantAI';
const pageDescription = 'AssistantAI provides an AI assistant for Australian service businesses that answers calls, captures leads, supports bookings, and helps teams follow up faster.';

const outcomes = [
  'Answer inbound enquiries when your team is busy or after hours',
  'Capture contact details, service need, urgency and location',
  'Qualify callers so follow-up starts with better context',
  'Support booking, messaging and CRM-ready lead records',
];

const useCases = [
  'Service teams losing calls while staff are on-site or driving',
  'Businesses investing in lead generation that need every enquiry captured',
  'Teams connecting calls, forms, follow-up and bookings',
  'Owners who need better response coverage without another full-time admin role',
];

const capabilities = [
  { icon: PhoneCall, title: 'Answer calls', description: 'Give routine inbound enquiries a fast, consistent first response.' },
  { icon: ContactRound, title: 'Capture leads', description: 'Create structured records instead of loose notes and missed-call messages.' },
  { icon: CalendarCheck2, title: 'Support bookings', description: 'Understand booking intent and connect the right scheduling action.' },
  { icon: Send, title: 'Prepare follow-up', description: 'Keep confirmations, next steps and human review connected to the call.' },
];

const faq = [
  ['What is an AI assistant for business?', 'It helps answer enquiries, capture customer details, qualify intent, support bookings and prepare follow-up so staff can respond faster.'],
  ['Is AssistantAI an AI assistant or an AI receptionist?', 'It is an AI receptionist for calls and a broader assistant for lead capture, booking support, follow-up and workflow automation.'],
  ['Who is it built for?', 'AssistantAI is built for Australian service businesses including trades, clinics, property teams and other enquiry-based operators.'],
  ['Can it support secure signup?', 'Eligible standard-plan buyers can move toward secure signup. Complex or enterprise workflows are reviewed before implementation.'],
];

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/ai-assistant-australia#service`,
    name: 'AI Assistant Australia',
    provider: { '@id': `${SITE_URL}/#organization` },
    serviceType: 'AI assistant, AI receptionist, call answering, lead capture, booking support, follow-up automation',
    areaServed: 'AU',
    audience: { '@type': 'BusinessAudience', audienceType: 'Australian service businesses' },
    url: `${SITE_URL}/ai-assistant-australia`,
    description: pageDescription,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  },
];

export default function AiAssistantAustralia() {
  return (
    <>
      <SEO title={pageTitle} description={pageDescription} canonicalPath="/ai-assistant-australia" structuredData={structuredData} />
      <PageShell>
        <PageHero
          title={<>One AI assistant for calls, leads, bookings and <AccentText>follow-up.</AccentText></>}
          description="AssistantAI gives Australian service businesses a practical AI voice agent for business that connects the first conversation to a useful next action."
          primaryTo="/GetStartedNow"
          primaryLabel="Get Started"
          secondaryTo="/BookStrategyCall"
          secondaryLabel="Book a Strategy Call"
        />
        <Section id="page-content" className="bg-[#040b14]">
          <CapabilityRail items={capabilities} />
        </Section>
        <Section>
          <FeatureSplit
            title={<>Built for real <AccentText>service-business work.</AccentText></>}
            description="A useful virtual AI assistant should understand the enquiry, capture the right context and know when a person needs to take over."
            points={outcomes}
          >
            <OutcomeList items={useCases} />
          </FeatureSplit>
        </Section>
        <Section className="bg-[#040b14]">
          <SectionHeading title="AI assistant questions, answered" />
          <div className="mt-10">
            <FAQRows items={faq} />
          </div>
        </Section>
        <ConversionCTA
          title="Turn your AI assistant into a connected revenue workflow."
          description="Start with calls and lead capture, then connect booking and follow-up around the way your team works."
          primaryTo="/BookStrategyCall"
          primaryLabel="Book a Strategy Call"
          secondaryLabel="View Pricing"
          secondaryTo="/Pricing"
        />
      </PageShell>
    </>
  );
}
