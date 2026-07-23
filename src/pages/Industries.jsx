import { Building2, Car, HeartPulse, Home, Scale, Stethoscope, Store, Wrench } from 'lucide-react';
import SEO from '../components/SEO';
import {
  AccentText,
  ConversionCTA,
  FeatureSplit,
  OutcomeList,
  PageHero,
  PageShell,
  Section,
  SectionHeading,
} from '@/components/marketing/PremiumMarketing';

const industries = [
  { icon: Wrench, name: 'Trades', challenge: 'Calls arrive while the team is on-site, driving or working on the tools.', outcome: 'Capture job type, location, timing and urgency without interrupting delivery.' },
  { icon: Home, name: 'Property', challenge: 'Buyer, seller and tenant enquiries arrive during inspections and appointments.', outcome: 'Collect the right details and route each enquiry into the appropriate next step.' },
  { icon: HeartPulse, name: 'Medical clinics', challenge: 'Front-desk teams juggle patients, schedules and incoming calls.', outcome: 'Support common questions and structured appointment requests while staff stay focused.' },
  { icon: Stethoscope, name: 'Dental clinics', challenge: 'Bookings, reschedules and missed calls add pressure to reception.', outcome: 'Capture appointment intent, preferred times and follow-up details consistently.' },
  { icon: Scale, name: 'Professional services', challenge: 'The team may be in meetings, court or deep work when prospects call.', outcome: 'Handle first contact professionally and prepare qualified enquiries for review.' },
  { icon: Car, name: 'Automotive', challenge: 'Workshop and service teams miss calls during their busiest periods.', outcome: 'Capture service-booking intent and get the enquiry ready for the next action.' },
  { icon: Store, name: 'Hospitality', challenge: 'Peak service makes it difficult to respond to reservations and event enquiries.', outcome: 'Support booking intent, function details and customer follow-up when staff are busy.' },
  { icon: Building2, name: 'Other service businesses', challenge: 'The people answering enquiries are often also responsible for doing the work.', outcome: 'Create a reliable front door for calls, bookings and customer details.' },
];

export default function Industries() {
  return (
    <>
      <SEO
        title="Industries | AI Receptionist for Australian Service Businesses | AssistantAI"
        description="See how AssistantAI supports Australian trades, property, medical, dental, automotive and other service businesses."
        canonicalPath="/Industries"
      />
      <PageShell>
        <PageHero
          title={<>Built for industries that keep <AccentText>Australia moving.</AccentText></>}
          description="AssistantAI adapts to the way your business handles calls, enquiries and bookings — so customers receive a useful response even when your team is busy."
          primaryTo="/BookStrategyCall"
          primaryLabel="Map Your Call Workflow"
          secondaryTo="/Services"
          secondaryLabel="Explore Services"
          visual="industries"
          visualData={{ items: industries }}
        />

        <Section id="page-content" className="bg-[#040b14]">
          <SectionHeading
            title="Different industries. One costly problem."
            description="The details change, but the pattern is consistent: when a call goes unanswered or follow-up starts too late, a real opportunity can disappear."
          />
          <div className="mt-10 grid gap-px overflow-hidden rounded-[16px] border border-[#26364d] bg-[#26364d] md:grid-cols-2">
            {industries.map(({ icon: Icon, name, challenge, outcome }) => (
              <article key={name} className="bg-[#07121f] p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10284c] text-[#74a7ff]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="text-xl font-semibold text-white">{name}</h2>
                </div>
                <p className="mt-5 text-sm leading-7 text-[#9eaabb]">{challenge}</p>
                <p className="mt-4 border-l-2 border-[#347cff] pl-4 text-sm leading-7 text-[#d0d7e0]">{outcome}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section>
          <FeatureSplit
            title={<>A workflow designed around <AccentText>your front line.</AccentText></>}
            description="We map the questions, handoffs and follow-up that matter in your industry, then configure AssistantAI around those requirements."
            points={[
              'Industry-specific call prompts and terminology',
              'Clear boundaries for sensitive or urgent enquiries',
              'Structured capture fields for your service workflow',
              'Human escalation where judgement is required',
            ]}
          >
            <OutcomeList
              items={[
                'Answer every eligible call with a consistent business introduction.',
                'Understand what the caller needs before sending the enquiry to your team.',
                'Prepare booking or follow-up information while the caller is engaged.',
                'Keep humans in control of exceptions, approvals and sensitive conversations.',
              ]}
            />
          </FeatureSplit>
        </Section>

        <ConversionCTA
          title="See how AssistantAI would work in your industry."
          description="We’ll map your call flow, identify the highest-value automation opportunities and show you a practical rollout path."
          primaryTo="/BookStrategyCall"
          primaryLabel="Book a Strategy Call"
        />
      </PageShell>
    </>
  );
}
