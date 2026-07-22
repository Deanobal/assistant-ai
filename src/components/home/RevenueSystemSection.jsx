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
    <section className="site-section border-y border-blue-200/[0.07]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(43,94,255,0.09),transparent_30rem)]" />

      <div className="site-container relative">
        <div className="grid items-start gap-12 xl:grid-cols-[0.9fr_1.1fr] xl:gap-16">
          <div className="max-w-[42rem]">
            <p className="site-kicker">Beyond call answering</p>
            <h2>Quo answers calls. AssistantAI turns enquiries into a revenue workflow.</h2>
            <p className="site-lede">
              Most phone systems stop at the conversation. AssistantAI qualifies the buyer, recommends the right path, captures the lead, and moves ready prospects toward signup or human review.
            </p>

            <div className="site-muted-panel mt-8 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="site-icon">
                  <Bot className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="site-card-title">Commercial rule</h3>
                  <p className="site-card-copy mt-1">
                    Ready Starter and Growth buyers should be qualified and moved to the next step while intent is high.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/AIDemo" className="site-button-primary w-full sm:w-auto">
                Try the AI workflow
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/Pricing" className="site-button-secondary w-full sm:w-auto">
                Compare plans
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              {workflow.map((item, index) => (
                <article key={item.title} className="site-card p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <span className="site-icon">
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="site-kicker mb-1 text-[0.75rem]">Step {index + 1}</p>
                      <h3 className="site-card-title">{item.title}</h3>
                      <p className="site-card-copy mt-2">{item.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="site-card p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-4">
                <span className="site-icon">
                  <CreditCard className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="site-kicker mb-1 text-[0.75rem]">Buyer routing</p>
                  <h3 className="site-card-title">Different buyers need different next steps</h3>
                </div>
              </div>

              <div className="space-y-3">
                {buyerPaths.map((path) => (
                  <div key={path.label} className="rounded-2xl border border-blue-200/[0.11] bg-[#080d17] p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <MessageSquareText className="mt-1 h-4 w-4 shrink-0 text-[#a9c0ff]" aria-hidden="true" />
                      <div>
                        <h4 className="text-base font-semibold text-white">{path.label}</h4>
                        <p className="site-card-copy mt-1">{path.detail}</p>
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
