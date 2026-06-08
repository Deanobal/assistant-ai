import { CheckCircle2, CreditCard, DatabaseZap, HeadphonesIcon, Plug, ShieldCheck, TrendingUp, Workflow } from 'lucide-react';

const proofPoints = [
  {
    icon: HeadphonesIcon,
    heading: 'Live AI Receptionist Flow',
    proof: 'Browser voice demo can answer enquiries, qualify plan fit, capture contact details, and route ready buyers to the next step.',
    evidence: 'Verified flow: enquiry → qualification → Starter/Growth recommendation → lead capture.'
  },
  {
    icon: CreditCard,
    heading: 'Checkout Path Built',
    proof: 'Starter and Growth buyers can be guided toward secure Stripe checkout instead of waiting for a manual callback.',
    evidence: 'Verified flow: qualified lead → payment pending → Stripe checkout session.'
  },
  {
    icon: DatabaseZap,
    heading: 'Lead-to-Onboarding Engine',
    proof: 'Paid or won leads can create the operational records needed to start delivery, not just sit in a form inbox.',
    evidence: 'System path: Lead → Client → IntakeForm → BillingStatus → IntegrationStatus → OnboardingTask.'
  },
  {
    icon: Workflow,
    heading: 'Workflow, Not Message-Taking',
    proof: 'The system is designed around call handling, CRM-style lead capture, follow-up, onboarding, and admin visibility.',
    evidence: 'Built around implementation outcomes, not a standalone chatbot widget.'
  }
];

const credibilitySignals = [
  {
    icon: Plug,
    heading: 'Integration-Ready',
    description: 'Built to connect with calendars, CRMs, payment flows, notifications, and onboarding records as the client setup matures.'
  },
  {
    icon: TrendingUp,
    heading: 'Commercial Outcome Focus',
    description: 'The core metric is faster response and cleaner lead conversion, not novelty conversations or vanity AI demos.'
  },
  {
    icon: ShieldCheck,
    heading: 'Honest Deployment Model',
    description: 'Standard plans can move quickly. Enterprise, multi-location, or complex workflows are escalated for proper review.'
  }
];

export default function CredibilitySection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-[#070a12]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_40%)]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <p className="text-cyan-400 mb-3 text-sm font-bold uppercase tracking-[0.22em]">Implementation proof</p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built to Prove Execution, Not Just Talk AI
          </h2>
          <p className="mt-4 text-base text-slate-400 leading-7">
            Enterprise vendors look credible because they show operational proof. AssistantAI now makes the same argument in a service-business format: live qualification, secure checkout, lead records, onboarding triggers, and measurable workflow outcomes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {proofPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.heading}
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 hover:border-cyan-400/25 transition-colors duration-300"
              >
                <div className="h-11 w-11 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center mb-5">
                  <Icon className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{point.heading}</h3>
                <p className="text-slate-400 leading-6 text-sm mb-4">{point.proof}</p>
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-3">
                  <div className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <p className="text-xs leading-5 text-emerald-100">{point.evidence}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {credibilitySignals.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.heading}
                className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 flex gap-4"
              >
                <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{point.heading}</h3>
                  <p className="text-slate-400 leading-6 text-sm">{point.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
