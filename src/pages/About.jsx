import { Headphones, MapPin, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react';
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

const principles = [
  { icon: Headphones, title: 'Human-first conversations', body: 'The receptionist should sound clear, polite and useful, with a simple path to a person when judgement is needed.' },
  { icon: ShieldCheck, title: 'Reliable by design', body: 'Permissions, integrations and sensitive actions are handled deliberately so the workflow remains safe and predictable.' },
  { icon: SlidersHorizontal, title: 'Configured around the business', body: 'Questions, handoffs and follow-up are shaped around your services rather than forced into a generic script.' },
  { icon: Sparkles, title: 'Results over novelty', body: 'We focus on useful actions after the call: capture, qualification, booking, follow-up and team visibility.' },
];

const implementation = [
  'Discover — understand your services, callers and existing process.',
  'Configure — design the receptionist, questions, rules and integrations.',
  'Test — review real scenarios and refine the conversation flow.',
  'Go live — launch with clear monitoring and human escalation.',
  'Optimise — improve the system as your team learns what works.',
];

export default function About() {
  return (
    <>
      <SEO
        title="About | Australian AI Receptionist for Service Businesses | AssistantAI"
        description="Learn how AssistantAI builds practical AI reception and follow-up workflows for Australian service businesses."
        canonicalPath="/About"
      />
      <PageShell>
        <PageHero
          title={<>Australian-built AI reception for businesses that cannot afford to <AccentText>miss a call.</AccentText></>}
          description="AssistantAI exists to give Australian service businesses a reliable front door for calls, enquiries, bookings and follow-up — without adding more pressure to the people doing the work."
          visual="principles"
        />

        <Section id="page-content" className="bg-[#040b14]">
          <FeatureSplit
            title={<>Built in Australia. For <AccentText>Australian businesses.</AccentText></>}
            description="We saw the same operational problem across service businesses: calls arrive when teams are already busy, and valuable enquiries cool down before anyone can respond."
            points={[
              'Practical implementation grounded in real service workflows',
              'Australian English, local context and business hours',
              'Clear support before, during and after launch',
              'A measured path from call answering to connected automation',
            ]}
          >
            <OutcomeList
              items={[
                'Start with the operating problem, not the technology.',
                'Keep sensitive decisions and exceptions with people.',
                'Launch with clear ownership, testing and support.',
                'Measure whether the workflow improves the customer response.',
              ]}
            />
          </FeatureSplit>
        </Section>

        <Section>
          <SectionHeading
            title="How we think about AI reception"
            description="A good system should feel calm to the caller, useful to the team and transparent to the business owner."
          />
          <div className="mt-10 overflow-hidden rounded-[16px] border border-[#26364d] bg-[#07121f]">
            {principles.map(({ icon: Icon, title, body }, index) => (
              <div key={title} className={`grid gap-4 px-5 py-6 sm:px-7 md:grid-cols-[0.38fr_0.62fr] md:items-center md:gap-10 ${index ? 'border-t border-[#1d2b3e]' : ''}`}>
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10284c] text-[#74a7ff]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="text-lg font-semibold text-white">{title}</h2>
                </div>
                <p className="text-sm leading-7 text-[#aab4c3]">{body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section className="bg-[#040b14]">
          <FeatureSplit
            reverse
            title="Fast implementation. Supported all the way."
            description="We keep the rollout understandable: define the workflow, test it carefully, launch with visibility and improve from real conversations."
          >
            <OutcomeList items={implementation} />
          </FeatureSplit>
        </Section>

        <Section>
          <div className="flex flex-col items-start justify-between gap-6 rounded-[16px] border border-[#2a3b55] bg-[#071421] p-7 sm:p-9 md:flex-row md:items-center">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-[#76a7ff]">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Australia-wide
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">Built for the businesses customers rely on every day.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#aab4c3]">From trades and clinics to property and professional services, the system is tailored to the calls and next steps that matter in your business.</p>
          </div>
        </Section>

        <ConversionCTA />
      </PageShell>
    </>
  );
}
