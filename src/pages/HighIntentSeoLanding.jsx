import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Bot, CalendarCheck, Clock3, MessageSquareText, PhoneCall, ShieldCheck, Sparkles, Target } from 'lucide-react';
import SEO from '../components/SEO';
import PremiumHomeExperience from '@/components/home/PremiumHomeExperience';
import {
  ConversionCTA,
  FAQRows,
  FeatureSplit,
  OutcomeList,
  PageHero,
  PageShell,
  Section,
  SectionHeading,
} from '@/components/marketing/PremiumMarketing';

const landingPages = {
  'ai-receptionist-australia': {
    title: 'AI Receptionist Australia | 24/7 Call Answering & Lead Capture | AssistantAI',
    description: 'AssistantAI provides AI receptionist systems for Australian service businesses that answer calls, capture leads, qualify enquiries, and support fast follow-up.',
    canonicalPath: '/ai-receptionist-australia',
    eyebrow: 'AI RECEPTIONIST AUSTRALIA',
    h1: 'AI Receptionist for Australian Service Businesses',
    intro: 'Answer more calls, capture more enquiries, and stop high-intent leads disappearing after hours. AssistantAI gives Australian service businesses a practical AI receptionist that can answer, qualify, record, and route enquiries before your team loses the opportunity.',
    primaryKeyword: 'AI receptionist Australia',
    secondary: ['AI virtual receptionist Australia', 'AI phone receptionist', 'AI receptionist for small business', '24/7 AI call answering'],
    pain: 'Most service businesses do not lose leads because the offer is weak. They lose them because nobody answers quickly enough, details are missed, or follow-up happens too late.',
    outcomes: ['24/7 AI call answering for new enquiries', 'Lead capture with name, phone, email, service need, urgency, and location', 'Clear escalation when a human needs to step in', 'Follow-up-ready records your team can action quickly'],
    useCases: ['Trades and field service businesses', 'Clinics and appointment-based operators', 'Real estate and property teams', 'Legal, finance, and consulting firms'],
    faq: [
      ['What does an AI receptionist do?', 'It answers inbound enquiries, asks structured questions, captures contact details, identifies intent, and routes the lead or next action to your team.'],
      ['Is this built for Australian businesses?', 'Yes. AssistantAI is positioned for Australian service businesses that need practical call answering, enquiry capture, booking support, and follow-up workflows.'],
      ['Can it replace a human receptionist?', 'It can handle repetitive first-response and enquiry capture. Complex, sensitive, or high-value cases should still escalate to a person.']
    ],
    icon: PhoneCall,
  },
  'ai-phone-assistant-small-business': {
    title: 'AI Phone Assistant for Small Business | Capture Calls & Leads | AssistantAI',
    description: 'AI phone assistant for small businesses that answers calls, captures enquiries, reduces missed calls, and helps convert more leads into booked jobs or consultations.',
    canonicalPath: '/ai-phone-assistant-small-business',
    eyebrow: 'AI PHONE ASSISTANT',
    h1: 'AI Phone Assistant for Small Business',
    intro: 'A small business cannot afford missed calls, slow replies, or messy lead notes. AssistantAI gives your business an AI phone assistant that answers consistently, captures the right information, and gives your team clean next steps.',
    primaryKeyword: 'AI phone assistant for small business',
    secondary: ['small business AI receptionist', 'AI call assistant', 'AI phone answering service', 'automated phone assistant'],
    pain: 'Small teams are usually too busy delivering the work to answer every enquiry properly. That creates lost jobs, weak follow-up, and poor visibility on where leads are coming from.',
    outcomes: ['Answers routine phone enquiries while your team is busy', 'Captures structured lead details instead of loose notes', 'Helps separate serious buyers from low-quality enquiries', 'Supports quick SMS/email follow-up after the call'],
    useCases: ['Owner-operated service businesses', 'Growing teams without full-time admin', 'Businesses with after-hours enquiry demand', 'Companies spending on ads but losing calls'],
    faq: [
      ['Who is this best for?', 'Businesses that receive phone enquiries but do not have consistent reception or admin coverage.'],
      ['Can it qualify leads?', 'Yes. The assistant can ask structured questions to understand service need, urgency, area, and buyer intent.'],
      ['Does it support follow-up?', 'Yes. AssistantAI is designed around reception plus enquiry capture and follow-up visibility.']
    ],
    icon: Bot,
  },
  'missed-call-automation-australia': {
    title: 'Missed Call Automation Australia | Recover Lost Leads | AssistantAI',
    description: 'Missed call automation for Australian service businesses. Capture missed calls, trigger fast follow-up, and stop paid leads leaking from your sales process.',
    canonicalPath: '/missed-call-automation-australia',
    eyebrow: 'MISSED CALL AUTOMATION',
    h1: 'Missed Call Automation for Australian Businesses',
    intro: 'Every missed call can be a lost job. AssistantAI helps Australian service businesses recover missed enquiries with faster capture, clear routing, and follow-up workflows that protect paid traffic and referral opportunities.',
    primaryKeyword: 'missed call automation Australia',
    secondary: ['missed call text back', 'missed call lead recovery', 'automated missed call follow up', 'missed call management for service business'],
    pain: 'If a prospect calls and gets no useful response, they usually keep searching. The business that replies first often wins the job.',
    outcomes: ['Reduce missed-call lead leakage', 'Capture contact details and service intent faster', 'Create an auditable trail of enquiry activity', 'Escalate urgent or high-value opportunities'],
    useCases: ['Google Ads campaigns', 'After-hours calls', 'Busy trade teams', 'Multi-location service businesses'],
    faq: [
      ['Why is missed call automation valuable?', 'It reduces the gap between enquiry and response, which is where many service businesses lose high-intent buyers.'],
      ['Does this replace call answering?', 'It complements call answering. The best setup answers where possible and recovers missed opportunities when no human is available.'],
      ['Can it help with paid ads?', 'Yes. It protects ad spend by reducing the number of paid leads lost through unanswered calls or delayed follow-up.']
    ],
    icon: Clock3,
  },
  'ai-lead-follow-up-automation': {
    title: 'AI Lead Follow-Up Automation | Convert More Enquiries | AssistantAI',
    description: 'AI lead follow-up automation for service businesses. Capture enquiries, qualify intent, and support faster SMS/email follow-up so fewer leads go cold.',
    canonicalPath: '/ai-lead-follow-up-automation',
    eyebrow: 'AI LEAD FOLLOW-UP',
    h1: 'AI Lead Follow-Up Automation That Stops Leads Going Cold',
    intro: 'Lead capture is only valuable if your team follows up quickly and consistently. AssistantAI helps turn calls and forms into structured lead records, clear next steps, and faster follow-up actions.',
    primaryKeyword: 'AI lead follow-up automation',
    secondary: ['automated lead follow up', 'AI lead qualification', 'lead response automation', 'sales follow-up automation'],
    pain: 'Many businesses have enough enquiries but poor conversion discipline. Leads sit in inboxes, staff forget details, and interested buyers move on.',
    outcomes: ['Capture enquiries into structured lead records', 'Identify buyer intent and urgency', 'Support fast SMS/email follow-up', 'Give owners clearer visibility over pipeline activity'],
    useCases: ['Service businesses with quote requests', 'Businesses running paid ads', 'Teams with multiple inboxes and phone numbers', 'Companies with slow sales follow-up'],
    faq: [
      ['What is AI lead follow-up automation?', 'It is the process of using AI and workflow automation to capture enquiries, classify intent, and support timely follow-up actions.'],
      ['Does it work with calls and forms?', 'AssistantAI is designed to support enquiry capture across calls and public forms, then make follow-up easier for the team.'],
      ['Why does speed matter?', 'High-intent prospects often contact several providers. Faster, clearer follow-up improves your chance of winning the job.']
    ],
    icon: MessageSquareText,
  },
  'ai-appointment-booking-assistant': {
    title: 'AI Appointment Booking Assistant | Calls, Enquiries & Booking Intent | AssistantAI',
    description: 'AI appointment booking assistant for service businesses. Capture booking intent, qualify enquiries, and hand off to your live calendar or booking process.',
    canonicalPath: '/ai-appointment-booking-assistant',
    eyebrow: 'AI BOOKING ASSISTANT',
    h1: 'AI Appointment Booking Assistant for Service Businesses',
    intro: 'Bookings fall apart when staff are busy, calls are missed, or clients do not know the next step. AssistantAI captures booking intent, qualifies the enquiry, and can hand off to your live booking process.',
    primaryKeyword: 'AI appointment booking assistant',
    secondary: ['AI booking assistant', 'appointment booking automation', 'AI scheduling assistant', 'automated appointment booking'],
    pain: 'A booking enquiry without clear next steps is a leak in the sales system. Customers want speed, clarity, and confirmation.',
    outcomes: ['Capture preferred service, timing, and contact details', 'Qualify appointment intent before staff follow-up', 'Support handoff to calendar or booking URL', 'Reduce admin pressure around repetitive booking questions'],
    useCases: ['Clinics and allied health', 'Beauty and wellness operators', 'Consulting and professional services', 'Home service appointments'],
    faq: [
      ['Can it book directly into a calendar?', 'It can support booking handoff and can be connected to external booking tools depending on the client setup.'],
      ['What information can it capture?', 'Service type, preferred time, urgency, location, contact details, and relevant notes for the team.'],
      ['Is it only for appointments?', 'No. The same structure also supports quote requests, strategy calls, demos, and service enquiries.']
    ],
    icon: CalendarCheck,
  },
  'ai-receptionist-for-trades': {
    title: 'AI Receptionist for Trades | Capture Jobs & Missed Calls | AssistantAI',
    description: 'AI receptionist for trades businesses. Answer calls, capture job details, recover missed enquiries, and help tradies convert more calls into booked work.',
    canonicalPath: '/ai-receptionist-for-trades',
    eyebrow: 'AI RECEPTIONIST FOR TRADES',
    h1: 'AI Receptionist for Trades and Field Service Teams',
    intro: 'Tradies lose work when calls arrive on the tools, after hours, or while driving between jobs. AssistantAI captures job details, urgency, location, and contact information so your team can quote or respond faster.',
    primaryKeyword: 'AI receptionist for trades',
    secondary: ['AI receptionist for plumbers', 'AI receptionist for electricians', 'AI call answering for tradies', 'trade business call answering'],
    pain: 'The highest-intent trade leads usually come through the phone. If the call is missed or poorly handled, the customer calls the next business.',
    outcomes: ['Capture job type, suburb, urgency, and contact details', 'Support after-hours enquiry handling', 'Separate emergency work from routine quotes', 'Protect Google Ads and local SEO leads'],
    useCases: ['Plumbing, electrical, HVAC, cleaning, maintenance, roofing, landscaping, and mobile service teams'],
    faq: [
      ['Why do tradies need an AI receptionist?', 'Because calls often arrive while the team is on site, driving, or unavailable, and those leads can be high value.'],
      ['Can it capture job details?', 'Yes. It can ask structured trade-specific questions around job type, urgency, location, access, and contact details.'],
      ['Can it work after hours?', 'Yes. After-hours coverage is one of the strongest use cases for trade and field service businesses.']
    ],
    icon: ShieldCheck,
  },
  'ai-receptionist-for-clinics': {
    title: 'AI Receptionist for Clinics | Appointment Enquiries & Follow-Up | AssistantAI',
    description: 'AI receptionist for clinics and appointment-based businesses. Capture patient or client enquiries, booking intent, contact details, and follow-up needs.',
    canonicalPath: '/ai-receptionist-for-clinics',
    eyebrow: 'AI RECEPTIONIST FOR CLINICS',
    h1: 'AI Receptionist for Clinics and Appointment-Based Teams',
    intro: 'Clinics lose time when staff are tied up answering routine calls, booking questions, and callback requests. AssistantAI helps capture enquiries, booking intent, urgency, and contact details so your team can respond with better context.',
    primaryKeyword: 'AI receptionist for clinics',
    secondary: ['AI receptionist for medical clinic', 'clinic call answering AI', 'AI appointment assistant for clinics', 'AI receptionist for allied health'],
    pain: 'Clinic teams need speed and accuracy, but callers often need careful routing, clear booking next steps, and human escalation for sensitive cases.',
    outcomes: ['Capture appointment intent and preferred times', 'Collect contact details and service category', 'Escalate sensitive or urgent enquiries', 'Reduce repetitive reception workload'],
    useCases: ['Allied health clinics', 'Dental and cosmetic clinics', 'Wellness and therapy practices', 'Appointment-based service providers'],
    faq: [
      ['Can AI handle sensitive clinic calls?', 'It should capture basic details and escalate sensitive, urgent, or clinical matters to a person rather than giving advice.'],
      ['Can it help with booking enquiries?', 'Yes. It can capture preferred times and booking intent, then hand off to your calendar or staff confirmation process.'],
      ['Does it replace reception staff?', 'No. It supports first response and routine capture while staff handle complex, sensitive, or in-person work.']
    ],
    icon: CalendarCheck,
  },
  'ai-receptionist-for-real-estate': {
    title: 'AI Receptionist for Real Estate | Enquiry Capture & Lead Routing | AssistantAI',
    description: 'AI receptionist for real estate teams. Capture buyer, seller, rental, appraisal, and property management enquiries with faster routing and follow-up.',
    canonicalPath: '/ai-receptionist-for-real-estate',
    eyebrow: 'AI RECEPTIONIST FOR REAL ESTATE',
    h1: 'AI Receptionist for Real Estate Teams',
    intro: 'Real estate enquiries move quickly. AssistantAI helps capture buyer, seller, rental, appraisal, and property management enquiries before the lead goes cold or contacts another agency.',
    primaryKeyword: 'AI receptionist for real estate',
    secondary: ['real estate AI receptionist', 'AI call answering for real estate agents', 'property management AI receptionist', 'real estate lead capture AI'],
    pain: 'Property enquiries often need fast classification and routing. A missed appraisal, inspection, or landlord enquiry can become a lost listing or management opportunity.',
    outcomes: ['Classify buyer, seller, rental, and property management enquiries', 'Capture property address and contact details', 'Route urgent or high-value enquiries faster', 'Support follow-up after inspections or appraisals'],
    useCases: ['Sales teams', 'Property management departments', 'Rental enquiry teams', 'Independent agents and agencies'],
    faq: [
      ['Can it separate sales and rental enquiries?', 'Yes. The flow can classify enquiry type and route it to the correct team or next action.'],
      ['Can it capture appraisal leads?', 'Yes. It can collect seller details, property address, timing, and preferred callback information.'],
      ['Can it work after hours?', 'Yes. After-hours enquiry capture is a strong fit for real estate because prospects often browse outside business hours.']
    ],
    icon: PhoneCall,
  },
  'ai-receptionist-for-cleaning-companies': {
    title: 'AI Receptionist for Cleaning Companies | Quote Enquiries & Lead Capture | AssistantAI',
    description: 'AI receptionist for cleaning companies. Capture commercial and residential cleaning enquiries, quote details, service frequency, site size, and follow-up needs.',
    canonicalPath: '/ai-receptionist-for-cleaning-companies',
    eyebrow: 'AI RECEPTIONIST FOR CLEANING',
    h1: 'AI Receptionist for Cleaning Companies',
    intro: 'Cleaning businesses lose quote opportunities when managers are on site, staff are moving between jobs, or enquiries arrive after hours. AssistantAI captures cleaning enquiry details and prepares cleaner follow-up for your sales or operations team.',
    primaryKeyword: 'AI receptionist for cleaning companies',
    secondary: ['cleaning business AI receptionist', 'AI call answering for cleaners', 'commercial cleaning lead capture', 'cleaning quote automation'],
    pain: 'A cleaning quote request is only useful when the right details are captured: site type, size, frequency, location, timing, and decision-maker information.',
    outcomes: ['Capture commercial and residential quote enquiries', 'Collect site size, location, frequency, and urgency', 'Support follow-up for recurring contract opportunities', 'Reduce admin load for owner-operators and managers'],
    useCases: ['Commercial cleaning companies', 'Residential cleaning teams', 'Strata and property cleaning providers', 'Specialist and once-off cleaning operators'],
    faq: [
      ['Can it qualify commercial cleaning leads?', 'Yes. It can ask about site type, approximate size, cleaning frequency, location, start date, and decision-maker details.'],
      ['Can it handle residential enquiries?', 'Yes. It can capture service type, suburb, preferred time, and scope before the team follows up.'],
      ['Can it support quote follow-up?', 'Yes. It can create a structured enquiry record and support SMS/email follow-up depending on the setup.']
    ],
    icon: Sparkles,
  },
  'ai-receptionist-for-law-firms': {
    title: 'AI Receptionist for Law Firms | Intake Capture & Matter Routing | AssistantAI',
    description: 'AI receptionist for law firms and professional services. Capture enquiry type, contact details, urgency, and route sensitive or complex matters for human review.',
    canonicalPath: '/ai-receptionist-for-law-firms',
    eyebrow: 'AI RECEPTIONIST FOR LAW FIRMS',
    h1: 'AI Receptionist for Law Firms and Professional Services',
    intro: 'Law firms need fast response without careless advice. AssistantAI can capture initial enquiry details, identify matter type, collect contact information, and escalate legal or sensitive questions to a person for review.',
    primaryKeyword: 'AI receptionist for law firms',
    secondary: ['law firm AI receptionist', 'legal intake AI assistant', 'AI call answering for lawyers', 'professional services AI receptionist'],
    pain: 'Professional-services enquiries need careful first response. The AI should capture details and route the enquiry, not provide legal, financial, or regulated advice.',
    outcomes: ['Capture matter type and contact details', 'Identify urgency and preferred contact method', 'Escalate sensitive or complex matters', 'Create cleaner intake records for human review'],
    useCases: ['Law firms', 'Accounting and advisory firms', 'Consultants', 'Professional service practices'],
    faq: [
      ['Can it give legal advice?', 'No. It should not provide legal advice. It can capture intake details and escalate the matter for lawyer review.'],
      ['Can it classify enquiry type?', 'Yes. It can identify areas such as family, commercial, property, employment, disputes, or general enquiry based on your intake rules.'],
      ['Is this suitable for sensitive enquiries?', 'It can support careful intake capture, but sensitive matters should escalate to a human with clear operating rules.']
    ],
    icon: ShieldCheck,
  },
  'ai-receptionist-for-property-maintenance': {
    title: 'AI Receptionist for Property Maintenance | Job Triage & Urgent Routing | AssistantAI',
    description: 'AI receptionist for property maintenance and field-service teams. Triage repair requests, capture job details, identify urgency, and route follow-up faster.',
    canonicalPath: '/ai-receptionist-for-property-maintenance',
    eyebrow: 'AI RECEPTIONIST FOR MAINTENANCE',
    h1: 'AI Receptionist for Property Maintenance Teams',
    intro: 'Property maintenance teams deal with urgent repairs, tenant requests, routine jobs, and client updates. AssistantAI helps triage requests, capture the facts, and route work to the right next action faster.',
    primaryKeyword: 'AI receptionist for property maintenance',
    secondary: ['property maintenance call answering', 'field service AI receptionist', 'maintenance request automation', 'AI job triage'],
    pain: 'Maintenance requests become expensive when key details are missing. Location, access, urgency, risk, and contact details need to be captured properly from the start.',
    outcomes: ['Capture repair type, property address, access notes, and urgency', 'Separate urgent issues from routine jobs', 'Support cleaner handoff to operations teams', 'Create better records for follow-up and reporting'],
    useCases: ['Property maintenance businesses', 'Facility services teams', 'Strata maintenance providers', 'Field-service operators'],
    faq: [
      ['Can it triage urgent jobs?', 'Yes. It can ask structured questions to identify urgency, risk, location, and next-action needs.'],
      ['Can it help tenants or property managers?', 'Yes. It can capture who is calling, the property, the issue, access notes, and the preferred follow-up path.'],
      ['Can it dispatch staff directly?', 'Only if the required integrations and business rules are connected. Otherwise it should capture and escalate for confirmation.']
    ],
    icon: Target,
  },
};

function LandingSection({ page }) {
  const isFlagshipReceptionistPage = page.canonicalPath === '/ai-receptionist-australia';
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: page.h1,
      provider: { '@type': 'Organization', name: 'AssistantAI', url: 'https://www.assistantai.com.au/' },
      areaServed: { '@type': 'Country', name: 'Australia' },
      serviceType: page.primaryKeyword,
      description: page.description,
    },
    ...(!isFlagshipReceptionistPage ? [{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    }] : [])
  ];

  if (isFlagshipReceptionistPage) {
    return (
      <>
        <SEO title={page.title} description={page.description} canonicalPath={page.canonicalPath} structuredData={structuredData} />
        <PremiumHomeExperience />
      </>
    );
  }

  return (
    <>
      <SEO title={page.title} description={page.description} canonicalPath={page.canonicalPath} structuredData={structuredData} />
      <PageShell>
        <PageHero
          title={page.h1}
          description={page.intro}
          primaryTo="/GetStartedNow"
          primaryLabel="Get Started"
          secondaryTo="/BookStrategyCall"
          secondaryLabel="Book a Strategy Call"
        />
        <Section id="page-content" className="bg-[#040b14]">
          <SectionHeading title="Built around the enquiry, not a generic script" description={page.pain} />
          <div className="mt-10">
            <OutcomeList items={page.outcomes} />
          </div>
        </Section>
        <Section>
          <FeatureSplit
            title="Designed around real enquiry flow"
            description="AssistantAI connects the first response with structured capture, clear routing and practical follow-up, so your team can act with better context."
            points={page.outcomes}
          >
            <OutcomeList items={page.useCases} />
          </FeatureSplit>
        </Section>
        <Section className="bg-[#040b14]">
          <SectionHeading title="Frequently asked questions" />
          <div className="mt-10">
            <FAQRows items={page.faq} />
          </div>
        </Section>
        <ConversionCTA
          title="Ready to capture more high-intent enquiries?"
          description="Start with reliable call answering and lead capture, then connect booking, follow-up and reporting around your workflow."
          primaryTo="/BookStrategyCall"
          primaryLabel="Book a Strategy Call"
          secondaryLabel="View Pricing"
          secondaryTo="/Pricing"
        />
      </PageShell>
    </>
  );
}

export default function HighIntentSeoLanding() {
  const { slug } = useParams();
  const page = landingPages[slug];
  if (!page) return <Navigate to="/Services" replace />;
  return <LandingSection page={page} />;
}

export { landingPages };
