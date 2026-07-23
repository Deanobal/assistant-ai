import { CheckCircle2, CircleDot } from 'lucide-react';
import SEO from '@/components/SEO';
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

const capabilities = [
  'Answer a real enquiry through the browser voice demo',
  'Understand the business and identify the main call-handling problem',
  'Explain the right starting path without forcing a plan',
  'Capture contact details for a requested follow-up',
  'Escalate complex workflows for human review',
];

const liveFlow = [
  ['Answer the enquiry', 'The receptionist starts like a real front desk and works out what the caller needs.'],
  ['Understand the context', 'It asks about calls, bookings, follow-up, locations and urgency.'],
  ['Recommend a useful path', 'It explains the relevant capability and keeps complex decisions with a person.'],
  ['Trigger the next step', 'The caller can request follow-up, discuss the workflow or start secure signup.'],
];

export default function AIDemo() {
  return (
    <>
      <SEO
        title="Live AI Receptionist Demo | AssistantAI"
        description="Talk to the live AssistantAI receptionist demo and hear how it answers enquiries, understands context and guides the next step."
        canonicalPath="/AIDemo"
      />
      <PageShell>
        <PageHero
          title={<>Talk to the AI receptionist that turns enquiries into <AccentText>action.</AccentText></>}
          description="Start a live browser voice call with AssistantAI. Ask how it would handle missed calls, qualify an enquiry or support the next booking step."
          secondaryTo="/GetStartedNow"
          secondaryLabel="Get Started"
          footnote="Browser microphone permission is required for the live demo"
        />

        <Section id="page-content" className="bg-[#040b14]">
          <FeatureSplit
            title="A real conversation, not a recording"
            description="The live demo runs through the current receptionist flow so you can test how it listens, responds and moves toward a useful outcome."
            points={capabilities}
          >
            <OutcomeList items={liveFlow.map(([title, body]) => `${title} — ${body}`)} />
          </FeatureSplit>
        </Section>

        <Section>
          <SectionHeading title="What to try in the demo" description="Use a realistic example from your business and see how the receptionist handles it." />
          <div className="mt-10 grid gap-px overflow-hidden rounded-[16px] border border-[#26364d] bg-[#26364d] md:grid-cols-3">
            {[
              'Ask whether it can answer calls after hours and capture an urgent job.',
              'Describe your current booking process and ask how the handoff could work.',
              'Give it a complex enquiry and check whether it recommends human review.',
            ].map((prompt) => (
              <div key={prompt} className="bg-[#07121f] p-7">
                <CircleDot className="h-5 w-5 text-[#4b8cff]" aria-hidden="true" />
                <p className="mt-5 text-sm leading-7 text-[#c2cbd6]">{prompt}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-start gap-3 text-sm leading-7 text-[#95a3b5]">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#62d895]" aria-hidden="true" />
            The demo is designed to explain capabilities and capture a requested next step. It does not make regulated decisions or replace human judgement.
          </p>
        </Section>

        <ConversionCTA
          title="Ready to design the version for your business?"
          description="We’ll map the real questions, handoffs and integrations your receptionist needs."
          primaryTo="/BookStrategyCall"
          primaryLabel="Book a Strategy Call"
        />
      </PageShell>
    </>
  );
}
