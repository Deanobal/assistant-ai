import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter', slug: 'starter', setup: '$1,500 setup AUD ex. GST', monthly: '$497/month AUD ex. GST',
    desc: 'For missed-call coverage, lead capture, and simple follow-up.',
    valueLine: 'A clear starting point for businesses that need every enquiry answered faster.',
    features: ['Missed-call coverage', 'Lead capture', 'Simple follow-up', 'Done-for-you setup', 'Ongoing support'],
    featured: false, primaryCtaLabel: 'Choose Starter', primaryCtaTo: '/GetStartedNow?plan=starter',
    helper: 'Choose Starter and begin secure signup when ready.',
  },
  {
    name: 'Growth', slug: 'growth', setup: '$3,000 setup AUD ex. GST', monthly: '$1,500/month AUD ex. GST',
    desc: 'For call handling, booking support, customer updates, and SMS/email follow-up.',
    valueLine: 'For growing businesses that need faster response and stronger follow-up.',
    features: ['AI call handling', 'Booking support', 'Customer details stay organised', 'SMS and email follow-up', 'Ongoing optimisation'],
    featured: true, primaryCtaLabel: 'Choose Growth', primaryCtaTo: '/GetStartedNow?plan=growth',
    helper: 'Choose Growth and begin secure signup when ready.',
  },
  {
    name: 'Enterprise', slug: 'enterprise', setup: 'From $7,500 setup AUD ex. GST', monthly: 'From $3,000/month AUD ex. GST',
    desc: 'For multi-location, custom workflows, advanced integrations, or complex routing.',
    valueLine: 'Custom review for larger teams and more complex customer journeys.',
    features: ['Multi-location support', 'Custom workflows', 'Advanced integrations', 'Complex routing', 'Custom review'],
    featured: false, primaryCtaLabel: 'Request Custom Review', primaryCtaTo: '/Contact',
    helper: 'Enterprise and complex builds are reviewed before setup.',
  },
];

export default function PricingPreview() {
  return (
    <section className="site-section border-y border-blue-200/[0.07]">
      <div className="site-container">
        <div className="site-section-head site-section-head-center">
          <p className="site-kicker">Pricing snapshot</p>
          <h2>Clear pricing. Done-for-you setup.</h2>
          <p className="site-lede">Choose the plan that fits your enquiry volume, follow-up needs, and setup complexity. Prices are in AUD and exclude GST unless stated otherwise.</p>
        </div>

        <div className="grid items-stretch gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className={`site-card relative flex h-full flex-col p-6 sm:p-7 ${plan.featured ? 'border-blue-300/[0.32] shadow-[0_22px_70px_rgba(49,93,255,0.14)]' : ''}`}>
              {plan.featured && <div className="mb-5 w-fit rounded-lg border border-blue-300/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-blue-100">Most popular</div>}
              <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
              <p className="site-card-copy mt-3 min-h-[5.25rem]">{plan.desc}</p>

              <div className="mt-6 min-h-[6.5rem] border-y border-blue-200/[0.09] py-5">
                <p className="text-2xl font-semibold tracking-[-0.035em] text-white">{plan.monthly}</p>
                <p className="site-meta mt-2">{plan.setup}</p>
              </div>

              <p className="site-card-copy mt-5 min-h-[5rem]">{plan.valueLine}</p>
              <ul className="my-7 min-h-[13rem] space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-[0.95rem] leading-6 text-slate-300">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[#a9c0ff]" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto space-y-3">
                <Link to={plan.primaryCtaTo} className={`${plan.featured ? 'site-button-primary' : 'site-button-secondary'} w-full`}>
                  {plan.primaryCtaLabel}
                </Link>
                <p className="site-meta px-2 text-center">{plan.helper}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
