import { ArrowRight, Bot, ClipboardCheck, CreditCard, GitBranch, Headphones, MessageSquareText } from 'lucide-react';
import { Link } from 'react-router-dom';

const workflow = [
  {
    icon: Headphones,
    title: 'Answer the enquiry',
    body: 'The AI receptionist answers when your team is busy, after hours, or already on another job.',
  },
  {
    icon: ClipboardCheck,
    title: 'Qualify the opportunity',
    body: 'It captures the customer need, urgency, contact details, business type, and plan fit before handover.',
  },
  {
    icon: GitBranch,
    title: 'Trigger the workflow',
    body: 'Qualified leads can move into CRM, follow-up, secure checkout, onboarding, or human review.',
  },
];

const buyerPaths = [
  {
    label: 'Starter buyers',
    detail: 'Simple missed-call coverage, lead capture, and basic follow-up can move toward secure signup.',
  },
  {
    label: 'Growth buyers',
    detail: 'Call handling, booking support, CRM updates, and SMS/email follow-up can be qualified before checkout.',
  },
  {
    label: 'Enterprise buyers',
    detail: 'Multi-location, custom routing, compliance, or advanced integrations are escalated for review.',
  },
];

export default function RevenueSystemSection() {
  return (
    <section className="relative overflow-hidden bg-[#06080d] py-18 md:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_32%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_72%,rgba(59,130,246,0.10),transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Beyond call answering</p>
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl">
              Quo answers calls. AssistantAI turns enquiries into a revenue workflow.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Most phone systems stop at the conversation. AssistantAI is built to handle the next commercial step: qualify the buyer, recommend the right path, capture the lead, and move ready prospects toward signup or human review.
            </p>

            <div className="mt-7 rounded-3xl border border-cyan-400/15 bg-cyan-400/[0.06] p-5">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10">
                  <Bot className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Commercial rule</h3>
                  <p className="mt-1 text-base leading-7 text-slate-300">
                    Ready Starter and Growth buyers should not be parked in a callback queue. They should be qualified and moved to the next step while intent is high.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/AIDemo"
                className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-cyan-500/20"
              >
                Try the AI workflow
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/Pricing"
                className="inline-flex min-h-[3.25rem] items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Compare plans
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
              {workflow.map((item, index) => (
                <div key={item.title} className="rounded-3xl border border-white/8 bg-white/[0.035] p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                      <item.icon className="h-5 w-5 text-cyan-300" />
                    </div>
                    <div>
                      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Step {index + 1}</div>
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <p className="mt-1 text-base leading-7 text-slate-400">{item.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-white/8 bg-[#0d111c] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10">
                  <CreditCard className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">Buyer routing</p>
                  <h3 className="font-semibold text-white">Different buyers need different next steps</h3>
                </div>
              </div>
              <div className="space-y-3">
                {buyerPaths.map((path) => (
                  <div key={path.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start gap-3">
                      <MessageSquareText className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />
                      <div>
                        <p className="font-medium text-white">{path.label}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{path.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
