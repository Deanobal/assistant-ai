import { ArrowRight, CheckCircle2, Wrench, Scale, Home, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  AccentText,
  ConversionCTA,
  PageHero,
  PageShell,
  Section,
  SectionHeading,
  premiumButtonSecondary,
} from '@/components/marketing/PremiumMarketing';

const scenarios = [
  {
    icon: Wrench,
    industry: 'Trades and field services',
    challenge: 'Calls arrive while the team is on-site, driving or working on the tools.',
    workflow: 'Answer the caller, capture the job, location and urgency, then prepare the booking or follow-up action.',
    outcomes: ['Faster first response', 'Consistent job-detail capture', 'Clearer booking handoff', 'Less interruption for technicians'],
  },
  {
    icon: Scale,
    industry: 'Professional services',
    challenge: 'Potential clients expect a prompt first response while the team may be in meetings or focused work.',
    workflow: 'Handle first contact professionally, capture relevant intake details and route the enquiry for human review.',
    outcomes: ['Consistent first contact', 'Structured enquiry qualification', 'Better handoff context', 'Clear follow-up ownership'],
  },
  {
    icon: Home,
    industry: 'Property services',
    challenge: 'Buyer, seller and tenant enquiries can arrive during inspections, appointments and after hours.',
    workflow: 'Understand the enquiry type, capture the property context and prepare the correct next step.',
    outcomes: ['After-hours coverage', 'Faster enquiry routing', 'Cleaner contact records', 'More consistent follow-up'],
  },
  {
    icon: Stethoscope,
    industry: 'Clinics and appointments',
    challenge: 'Front-desk teams balance patients, schedules and incoming calls at the same time.',
    workflow: 'Support common questions and appointment requests while keeping sensitive decisions with staff.',
    outcomes: ['Clear booking intent', 'Reduced repetitive admin', 'Structured enquiry capture', 'Human control where required'],
  },
];

export default function CaseStudies() {
  return (
    <>
      <SEO
        title="Case Studies | AI Receptionist Use Cases | AssistantAI"
        description="Explore transparent AssistantAI workflow scenarios for Australian trades, professional services, property and clinics."
        canonicalPath="/CaseStudies"
      />
      <PageShell>
        <PageHero
          title={<>Real workflows. Clear <AccentText>business outcomes.</AccentText></>}
          description="Explore representative scenarios showing how AssistantAI can connect call answering, enquiry capture, booking support and follow-up. These are examples, not invented customer claims."
          primaryTo="/BookStrategyCall"
          primaryLabel="Map Your Use Case"
          secondaryTo="/Industries"
          secondaryLabel="Explore Industries"
        />

        <Section id="page-content" className="bg-[#040b14]">
          <SectionHeading
            title="What the workflow can look like"
            description="Each implementation starts with the operating problem, then connects the conversation to a useful and accountable next action."
          />
          <div className="mt-10 space-y-5">
            {scenarios.map(({ icon: Icon, industry, challenge, workflow, outcomes }, index) => (
              <article key={industry} className="overflow-hidden rounded-[16px] border border-[#26364d] bg-[#07121f]">
                <div className="grid lg:grid-cols-[0.62fr_0.38fr]">
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#10284c] text-[#74a7ff]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#76a7ff]">Scenario {String(index + 1).padStart(2, '0')}</p>
                        <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">{industry}</h2>
                      </div>
                    </div>
                    <div className="mt-7 grid gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-semibold text-white">The challenge</h3>
                        <p className="mt-3 text-sm leading-7 text-[#aab4c3]">{challenge}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">The connected workflow</h3>
                        <p className="mt-3 text-sm leading-7 text-[#aab4c3]">{workflow}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-[#1d2b3e] bg-[#081727] p-6 sm:p-8 lg:border-l lg:border-t-0">
                    <h3 className="text-sm font-semibold text-white">Potential operational outcomes</h3>
                    <ul className="mt-5 space-y-3">
                      {outcomes.map((outcome) => (
                        <li key={outcome} className="flex items-center gap-3 text-sm text-[#c8d0da]">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4b8cff]" aria-hidden="true" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                    <Link to="/BookStrategyCall" className={`${premiumButtonSecondary} mt-7 w-full`}>
                      Discuss this workflow
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <ConversionCTA
          title="Your workflow should be built from your real calls."
          description="We’ll map the customer journey, identify the right handoffs and show you what a credible first version looks like."
          primaryTo="/BookStrategyCall"
          primaryLabel="Book a Strategy Call"
        />
      </PageShell>
    </>
  );
}
