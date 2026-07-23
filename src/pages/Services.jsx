import { CalendarCheck2, ClipboardCheck, ContactRound, Phone, Send, UserCheck } from 'lucide-react';
import SEO from '../components/SEO';
import HighIntentLinks from '@/components/seo/HighIntentLinks';
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

const capabilities = [
  { icon: Phone, title: 'Answer', description: 'Give every caller a clear, immediate response — including after hours.' },
  { icon: UserCheck, title: 'Qualify', description: 'Ask the right questions and capture the context your team needs.' },
  { icon: CalendarCheck2, title: 'Book', description: 'Support appointment requests and hand the next step into your workflow.' },
  { icon: Send, title: 'Follow up', description: 'Prepare confirmations, reminders and follow-up while the enquiry is warm.' },
];

const services = [
  ['AI call answering', 'Answer enquiries consistently, capture caller details and escalate when a person needs to step in.'],
  ['Enquiry qualification', 'Collect service, location, timing, urgency and other details that help your team prioritise the next action.'],
  ['Booking support', 'Connect availability and booking workflows so qualified callers can move forward without unnecessary back-and-forth.'],
  ['Customer follow-up', 'Keep confirmation, reminder and follow-up actions connected to the original conversation.'],
  ['Implementation support', 'Map the call flow, configure the receptionist and refine it around how your business actually operates.'],
];

const faqs = [
  ['Can AssistantAI answer after hours?', 'Yes. Your call flow can provide 24/7 coverage, with clear rules for urgent enquiries and human escalation.'],
  ['Can it qualify callers?', 'Yes. We configure the questions and capture fields around your services, locations and ideal enquiry flow.'],
  ['Can it help with bookings?', 'Yes. Booking support can be connected to your preferred calendar or scheduling workflow.'],
  ['Can a caller reach a person?', 'Yes. Human handoff and escalation rules can be included wherever your process needs them.'],
];

export default function Services() {
  return (
    <>
      <SEO
        title="Services | AI Receptionist, Enquiry Qualification & Follow-Up | AssistantAI"
        description="AssistantAI answers calls, qualifies enquiries, supports bookings and helps Australian service businesses follow up faster."
        canonicalPath="/Services"
      />
      <PageShell>
        <PageHero
          title={<>AI reception that turns every call into <AccentText>action.</AccentText></>}
          description="AssistantAI answers calls, qualifies enquiries, supports bookings and keeps follow-up moving — built around the way Australian service businesses work."
        />

        <Section id="page-content" className="bg-[#040b14]">
          <CapabilityRail items={capabilities} />
        </Section>

        <Section>
          <FeatureSplit
            title={<>More conversations. More bookings. <AccentText>Less admin.</AccentText></>}
            description="Your AI receptionist is configured as part of the operating workflow, not added as another disconnected inbox."
            points={[
              'Natural call handling aligned to your brand',
              'Structured contact and job-detail capture',
              'Clear escalation and human handoff rules',
              'Booking, confirmation and follow-up support',
            ]}
          >
            <OutcomeList items={services.map(([title, detail]) => `${title} — ${detail}`)} />
          </FeatureSplit>
        </Section>

        <Section className="bg-[#040b14]">
          <SectionHeading
            title="One connected service layer"
            description="Each capability can stand alone, but the real value comes from connecting the caller’s first question to the next useful action."
          />
          <div className="mt-10 overflow-hidden rounded-[16px] border border-[#26364d] bg-[#07121f]">
            {services.map(([title, detail], index) => (
              <div key={title} className={`grid gap-3 px-5 py-6 sm:px-7 md:grid-cols-[0.35fr_0.65fr] md:gap-10 ${index ? 'border-t border-[#1d2b3e]' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#10284c] text-[#74a7ff]">
                    {index === 0 ? <Phone className="h-4 w-4" /> : index === 1 ? <ContactRound className="h-4 w-4" /> : index === 2 ? <CalendarCheck2 className="h-4 w-4" /> : index === 3 ? <Send className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                </div>
                <p className="text-[15px] leading-7 text-[#aab4c3]">{detail}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <SectionHeading title="Everything you need to know" align="center" />
          <div className="mt-10">
            <FAQRows items={faqs} />
          </div>
        </Section>

        <HighIntentLinks />
        <ConversionCTA />
      </PageShell>
    </>
  );
}
