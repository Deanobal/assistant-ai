import { PhoneCall, ClipboardList, CreditCard, Rocket } from 'lucide-react';

const steps = [
  {
    icon: PhoneCall,
    number: '01',
    heading: 'Your customer calls',
    description: 'AssistantAI answers instantly, even after hours, so the enquiry is not lost.',
  },
  {
    icon: ClipboardList,
    number: '02',
    heading: 'The AI qualifies the enquiry',
    description: 'It asks the right questions, captures the details, and works out whether the buyer fits Starter, Growth, or Enterprise.',
  },
  {
    icon: CreditCard,
    number: '03',
    heading: 'Ready buyers can start now',
    description: 'Starter and Growth buyers can choose a plan and move to secure checkout without waiting for a callback.',
  },
  {
    icon: Rocket,
    number: '04',
    heading: 'Setup begins after payment',
    description: 'Once payment is complete, your setup begins.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="site-section scroll-mt-24 border-y border-blue-200/[0.07]">
      <div className="site-container">
        <div className="site-section-head site-section-head-center">
          <p className="site-kicker">How it works</p>
          <h2>From missed call to new client.</h2>
          <p className="site-lede">A faster path from first enquiry to booked work, secure signup, and setup.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <article key={step.number} className="site-card flex min-h-[17rem] flex-col p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="site-icon">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="select-none text-3xl font-semibold tracking-[-0.04em] text-blue-100/[0.12]">{step.number}</span>
              </div>
              <div className="mt-7">
                <h3 className="site-card-title">{step.heading}</h3>
                <p className="site-card-copy mt-3">{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
