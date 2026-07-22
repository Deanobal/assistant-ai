import { CheckCircle2, CreditCard, DatabaseZap, HeadphonesIcon, Plug, ShieldCheck, TrendingUp, Workflow } from 'lucide-react';

const proofPoints = [
  {
    icon: HeadphonesIcon,
    heading: 'Live AI Receptionist Flow',
    proof: 'Browser voice demo can answer enquiries, qualify plan fit, capture contact details, and route ready buyers to the next step.',
    evidence: 'Verified flow: enquiry → qualification → Starter/Growth recommendation → lead capture.',
  },
  {
    icon: CreditCard,
    heading: 'Checkout Path Built',
    proof: 'Starter and Growth buyers can be guided toward secure Stripe checkout instead of waiting for a manual callback.',
    evidence: 'Verified flow: qualified lead → payment pending → Stripe checkout session.',
  },
  {
    icon: DatabaseZap,
    heading: 'Lead-to-Onboarding Engine',
    proof: 'Paid or won leads can create the operational records needed to start delivery, not just sit in a form inbox.',
    evidence: 'System path: Lead → Client → IntakeForm → BillingStatus → IntegrationStatus → OnboardingTask.',
  },
  {
    icon: Workflow,
    heading: 'Workflow, Not Message-Taking',
    proof: 'The system is designed around call handling, CRM-style lead capture, follow-up, onboarding, and admin visibility.',
    evidence: 'Built around implementation outcomes, not a standalone chatbot widget.',
  },
];

const credibilitySignals = [
  { icon: Plug, heading: 'Integration-Ready', description: 'Built to connect with calendars, CRMs, payment flows, notifications, and onboarding records as the client setup matures.' },
  { icon: TrendingUp, heading: 'Commercial Outcome Focus', description: 'The core metric is faster response and cleaner lead conversion, not novelty conversations or vanity AI demos.' },
  { icon: ShieldCheck, heading: 'Honest Deployment Model', description: 'Standard plans can move quickly. Enterprise, multi-location, or complex workflows are escalated for proper review.' },
];

export default function CredibilitySection() {
  return (
    <section className="site-section">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(43,94,255,0.08),transparent_32rem)]" />
      <div className="site-container relative">
        <div className="site-section-head site-section-head-center">
          <p className="site-kicker">Implementation proof</p>
          <h2>Built to prove execution, not just talk AI.</h2>
          <p className="site-lede">AssistantAI shows the operational path: live qualification, secure checkout, lead records, onboarding triggers, and measurable workflow outcomes.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {proofPoints.map((point) => (
            <article key={point.heading} className="site-card flex min-h-[23rem] flex-col p-5 sm:p-6">
              <span className="site-icon"><point.icon className="h-5 w-5" aria-hidden="true" /></span>
              <h3 className="site-card-title mt-6">{point.heading}</h3>
              <p className="site-card-copy mt-3">{point.proof}</p>
              <div className="mt-auto rounded-xl border border-blue-200/[0.12] bg-blue-500/[0.055] p-4">
                <div className="flex gap-2.5">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#a9c0ff]" aria-hidden="true" />
                  <p className="site-meta text-slate-300">{point.evidence}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {credibilitySignals.map((point) => (
            <article key={point.heading} className="site-card flex gap-4 p-5 sm:p-6">
              <span className="site-icon"><point.icon className="h-5 w-5" aria-hidden="true" /></span>
              <div>
                <h3 className="site-card-title">{point.heading}</h3>
                <p className="site-card-copy mt-2">{point.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
