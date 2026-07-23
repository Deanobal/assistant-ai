import { ArrowRight, Check, Compass, Rocket, Settings2, TestTube2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  AccentText,
  ConversionCTA,
  FAQRows,
  PageHero,
  PageShell,
  Section,
  SectionHeading,
  premiumButton,
  premiumButtonSecondary,
} from '@/components/marketing/PremiumMarketing';

const plans = [
  {
    name: 'Starter',
    monthly: '$497/month',
    setup: '$1,500 setup',
    description: 'For missed-call coverage, lead capture and simple follow-up.',
    features: ['Done-for-you setup', 'Missed-call coverage', 'Lead capture', 'Simple follow-up', 'Support included'],
    cta: 'Choose Starter',
    to: '/GetStartedNow?plan=starter',
  },
  {
    name: 'Growth',
    monthly: '$1,500/month',
    setup: '$3,000 setup',
    description: 'For active call handling, booking support and connected follow-up.',
    features: ['Everything in Starter', 'AI call handling', 'Booking support', 'Customer details organised', 'SMS and email follow-up'],
    cta: 'Choose Growth',
    to: '/GetStartedNow?plan=growth',
    featured: true,
  },
  {
    name: 'Enterprise',
    monthly: 'From $3,000/month',
    setup: 'From $7,500 setup',
    description: 'For multiple locations, complex routing and custom integrations.',
    features: ['Custom implementation', 'Multi-location support', 'Advanced integrations', 'Complex call routing', 'Architecture review'],
    cta: 'Request a Review',
    to: '/Contact',
  },
];

const faqs = [
  ['How long does setup take?', 'Timing depends on your call flow and integrations. We confirm the scope and rollout plan before implementation begins.'],
  ['Do I need to change my phone number?', 'Usually no. We design the call routing around your existing number and operating requirements where possible.'],
  ['Can the AI transfer calls?', 'Yes. Human handoff can be configured for urgent, sensitive or specifically qualified enquiries.'],
  ['Can it support appointments?', 'Yes. Booking support can connect to the calendar or scheduling process you already use.'],
  ['Can I upgrade later?', 'Yes. The workflow can expand as your call volume, team and integration needs change.'],
  ['Are prices in Australian dollars?', 'Yes. Prices shown are in AUD and exclude GST unless stated otherwise.'],
];

const implementation = [
  { icon: Compass, title: 'Discover', body: 'Map the calls, services and outcomes that matter.' },
  { icon: Settings2, title: 'Configure', body: 'Build the receptionist, rules and integrations.' },
  { icon: TestTube2, title: 'Test', body: 'Review realistic scenarios and refine the flow.' },
  { icon: Rocket, title: 'Go live', body: 'Launch with monitoring, support and clear ownership.' },
];

export default function Pricing() {
  return (
    <>
      <SEO
        title="Pricing | AI Receptionist Plans for Service Businesses | AssistantAI"
        description="Review AssistantAI pricing for missed-call coverage, call handling, booking support and connected follow-up."
        canonicalPath="/Pricing"
      />
      <PageShell>
        <PageHero
          title={<>Simple pricing. Serious <AccentText>call coverage.</AccentText></>}
          description="Choose the level of call handling and workflow support that fits your business. All prices are in AUD and exclude GST unless stated otherwise."
          primaryTo="/GetStartedNow"
          primaryLabel="Choose a Plan"
          secondaryTo="/BookStrategyCall"
          secondaryLabel="Talk Through Your Needs"
          footnote="Done-for-you implementation and Australian support"
          visual="pricing"
          visualData={{ plans }}
        />

        <Section id="page-content" className="bg-[#040b14]">
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`relative flex h-full flex-col overflow-hidden rounded-[16px] border bg-[#07121f] p-6 sm:p-8 ${plan.featured ? 'border-[#347cff] shadow-[0_24px_70px_rgba(31,111,255,0.13)]' : 'border-[#2b3a50]'}`}
              >
                {plan.featured ? <div className="absolute inset-x-0 top-0 h-1 bg-[#347cff]" /> : null}
                <div className="min-h-[126px]">
                  <p className="text-sm font-semibold text-[#76a7ff]">{plan.name}</p>
                  <h2 className="mt-3 text-3xl font-[700] tracking-[-0.04em] text-white">{plan.monthly}</h2>
                  <p className="mt-2 text-sm text-[#95a3b5]">{plan.setup} · AUD ex. GST</p>
                </div>
                <p className="mt-5 min-h-[76px] border-t border-[#1d2b3e] pt-5 text-sm leading-7 text-[#aab4c3]">{plan.description}</p>
                <ul className="mt-6 flex-1 space-y-3.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-[#c8d0da]">
                      <Check className="h-4 w-4 shrink-0 text-[#4b8cff]" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to={plan.to} className={`${plan.featured ? premiumButton : premiumButtonSecondary} mt-8 w-full`}>
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-sm leading-6 text-[#95a3b5]">Enterprise and complex implementations are reviewed before work begins.</p>
        </Section>

        <Section>
          <SectionHeading
            title="Fast, deliberate implementation"
            description="The goal is to launch confidently — with a call flow your team understands and your customers can use."
            align="center"
          />
          <div className="relative mt-12 grid gap-px overflow-hidden rounded-[16px] border border-[#26364d] bg-[#26364d] md:grid-cols-4">
            {implementation.map(({ icon: Icon, title, body }, index) => (
              <div key={title} className="relative bg-[#07121f] p-6 text-center sm:p-7">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#2e5caa] bg-[#10284c] text-[#74a7ff]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#76a7ff]">Step {index + 1}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#9eaabb]">{body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section className="bg-[#040b14]">
          <SectionHeading title="Pricing questions, answered" align="center" />
          <div className="mt-10">
            <FAQRows items={faqs} />
          </div>
        </Section>

        <ConversionCTA
          title="Not sure which plan fits?"
          description="Tell us how your calls work today and we’ll help you identify the most practical starting point."
          primaryTo="/BookStrategyCall"
          primaryLabel="Book a Strategy Call"
          secondaryLabel="Start Secure Signup"
        />
      </PageShell>
    </>
  );
}
