import { Bell, CalendarDays, CheckCircle2, ClipboardList, CreditCard, MessageSquare, Users } from 'lucide-react';
import SEO from '../components/SEO';
import {
  AccentText,
  CapabilityRail,
  ConversionCTA,
  FeatureSplit,
  OutcomeList,
  PageHero,
  PageShell,
  Section,
  SectionHeading,
} from '@/components/marketing/PremiumMarketing';

const integrations = [
  { icon: CalendarDays, title: 'Calendars', description: 'Connect availability, booking requests, confirmations and reminders.' },
  { icon: Users, title: 'Customer systems', description: 'Keep contact details, notes and next steps organised for your team.' },
  { icon: MessageSquare, title: 'SMS and email', description: 'Prepare useful confirmations and follow-up after the conversation.' },
  { icon: CreditCard, title: 'Secure signup', description: 'Move ready customers into a secure, server-owned payment flow.' },
];

const workflow = [
  'The call is answered and the caller’s need is understood.',
  'Contact details and relevant service information are captured.',
  'Booking, follow-up or human escalation is selected.',
  'The connected system receives the right information for the next action.',
  'Your team keeps visibility without manually re-entering the conversation.',
];

export default function Integrations() {
  return (
    <>
      <SEO
        title="Integrations | Calendar, Follow-Up & Secure Signup | AssistantAI"
        description="Connect AssistantAI with calendars, customer systems, SMS, email and secure signup workflows."
        canonicalPath="/Integrations"
      />
      <PageShell>
        <PageHero
          title={<>Your calls and tools, <AccentText>working together.</AccentText></>}
          description="AssistantAI connects the first conversation to the systems your team already relies on, so customer details and next steps do not get lost between platforms."
          primaryTo="/BookStrategyCall"
          primaryLabel="Plan Your Integrations"
          secondaryTo="/Platform"
          secondaryLabel="View Platform"
          visual="integrations"
          visualData={{ items: integrations }}
        />

        <Section id="page-content" className="bg-[#040b14]">
          <CapabilityRail items={integrations} />
        </Section>

        <Section>
          <FeatureSplit
            title={<>From first ring to <AccentText>next action.</AccentText></>}
            description="A useful integration is more than moving data. It should preserve the intent of the conversation and make the next step obvious."
            points={[
              'Only capture the information the workflow actually needs',
              'Keep payment and privileged actions on the server',
              'Use clear failure and human-review paths',
              'Maintain visibility across calls, bookings and follow-up',
            ]}
          >
            <OutcomeList items={workflow} />
          </FeatureSplit>
        </Section>

        <Section className="bg-[#040b14]">
          <SectionHeading
            title="A practical integration layer"
            description="Your final setup depends on the tools you use and the actions you want AssistantAI to support."
          />
          <div className="mt-10 grid gap-px overflow-hidden rounded-[16px] border border-[#26364d] bg-[#26364d] md:grid-cols-3">
            {[
              { icon: ClipboardList, title: 'Capture', body: 'Structure names, numbers, service details, notes and consent around your operating process.' },
              { icon: Bell, title: 'Trigger', body: 'Create the right booking, message, notification or review task after the call.' },
              { icon: CheckCircle2, title: 'Confirm', body: 'Give both the caller and your team a clear view of what happens next.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-[#07121f] p-7">
                <Icon className="h-6 w-6 text-[#4b8cff]" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#aab4c3]">{body}</p>
              </div>
            ))}
          </div>
        </Section>

        <ConversionCTA
          title="Connect AssistantAI to the way your business already works."
          description="Tell us which systems matter, and we’ll map the cleanest path from call to outcome."
          primaryTo="/BookStrategyCall"
          primaryLabel="Map Your Workflow"
        />
      </PageShell>
    </>
  );
}
