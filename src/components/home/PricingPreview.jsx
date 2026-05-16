import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const plans = [
{
  name: 'Starter',
  slug: 'starter',
  setup: '$1,500',
  monthly: '$497',
  desc: 'For missed-call coverage, lead capture, and simple follow-up.',
  valueLine: 'A clear starting point for businesses that need every enquiry answered faster.',
  features: [
  'Missed-call coverage',
  'Lead capture',
  'Simple follow-up',
  'Done-for-you setup',
  'Ongoing support'],

  featured: false,
  primaryCtaLabel: 'Choose Starter',
  primaryCtaTo: '/GetStartedNow?plan=starter',
  helper: 'Choose Starter and begin secure signup when ready.'
},
{
  name: 'Growth',
  slug: 'growth',
  setup: '$3,000',
  monthly: '$1,500',
  desc: 'For call handling, booking support, customer updates, and SMS/email follow-up.',
  valueLine: 'For growing businesses that need faster response and stronger follow-up.',
  features: [
  'AI call handling',
  'Booking support',
  'Customer details stay organised',
  'SMS and email follow-up',
  'Ongoing optimisation'],

  featured: true,
  primaryCtaLabel: 'Choose Growth',
  primaryCtaTo: '/GetStartedNow?plan=growth',
  helper: 'Choose Growth and begin secure signup when ready.'
},
{
  name: 'Enterprise',
  slug: 'enterprise',
  setup: 'From $7,500',
  monthly: 'From $3,000',
  desc: 'For multi-location, custom workflows, advanced integrations, or complex routing.',
  valueLine: 'Custom review for larger teams and more complex customer journeys.',
  features: [
  'Multi-location support',
  'Custom workflows',
  'Advanced integrations',
  'Complex routing',
  'Custom review'],

  featured: false,
  primaryCtaLabel: 'Request Custom Review',
  primaryCtaTo: '/Contact',
  helper: 'Enterprise and complex builds are reviewed before setup.'
}];


export default function PricingPreview() {
  return (
    <section className="relative py-18 md:py-24 bg-[#0c0c14]">
      <div className="bg-radial-glow absolute inset-0" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 md:mb-14">
          <p className="text-cyan-400 mb-3 text-base font-medium tracking-[0.16em]">PRICING SNAPSHOT</p>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Clear Pricing. Done-For-You Setup.</h2>
          <p className="mt-4 max-w-2xl mx-auto text-base leading-7 text-gray-400 md:text-lg">
            Choose the plan that fits your enquiry volume, follow-up needs, and setup complexity.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {plans.map((plan) =>
          <div
            key={plan.name}
            className={`relative flex h-full flex-col rounded-2xl border p-8 card-hover ${
            plan.featured ?
            'border-cyan-500/30 bg-gradient-to-b from-cyan-500/5 to-[#12121a] glow-border' :
            'border-white/5 bg-[#12121a]'}`
            }>
            
              {plan.featured &&
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-xs font-medium text-white">
                  Most Popular
                </div>
            }

              <div className="min-h-[8.5rem]">
                <h3 className="text-white font-semibold text-xl">{plan.name}</h3>
                <p className="text-gray-400 mt-2 leading-relaxed text-lg">{plan.desc}</p>
              </div>

              <div className="mb-2 mt-2 min-h-[5.5rem]">
                <div className="flex flex-wrap items-end gap-2">
                  <span className="text-4xl font-bold text-white">{plan.monthly}</span>
                  <span className="pb-1 text-sm text-gray-500">/month</span>
                </div>
                <p className="mt-2 text-base text-gray-500">{plan.setup} setup fee</p>
              </div>

              <p className="min-h-[4.5rem] leading-relaxed text-gray-300 mt-3 mb-8 text-base">{plan.valueLine}</p>

              <ul className="space-y-3 mb-8 min-h-[13rem]">
                {plan.features.map((f) =>
              <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    {f}
                  </li>
              )}
              </ul>

              <div className="mt-auto space-y-3">
                <Link
                to={plan.primaryCtaTo}
                className={`block w-full rounded-full py-3.5 text-center text-sm font-medium transition-all ${
                plan.featured ?
                'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/20' :
                'border border-white/10 text-white hover:bg-white/5'}`
                }>
                
                  {plan.primaryCtaLabel}
                </Link>
                <p className="px-2 text-center leading-relaxed text-gray-500 text-sm">
                  {plan.helper}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}