import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    slug: 'starter',
    setup: '$1,500',
    monthly: '$497',
    desc: 'Best for businesses starting with AI call handling and lead capture.',
    valueLine: 'Setup, monthly management, support, and reporting in one premium service path.',
    features: [
      'Done-for-you setup',
      'Monthly management',
      'Support included',
      'Reporting included',
      'AI call handling and lead capture',
    ],
    featured: false,
    primaryCtaLabel: 'Book A Demo',
    primaryCtaTo: '/BookStrategyCall',
    secondaryCtaLabel: 'Get Started Now',
    secondaryCtaTo: '/GetStartedNow?plan=starter',
    helper: 'Best if you want to confirm fit, scope, and next steps first.',
  },
  {
    name: 'Growth',
    slug: 'growth',
    setup: '$3,000',
    monthly: '$1,500',
    desc: 'Best for growing businesses that want AI call handling, booking automation, CRM sync, and follow-up.',
    valueLine: 'Setup, management, support, and optimisation for businesses ready to scale faster.',
    features: [
      'Done-for-you setup',
      'Monthly management',
      'Optimisation included',
      'Support included',
      'Reporting included',
      'CRM, calendar, and follow-up automation',
    ],
    featured: true,
    primaryCtaLabel: 'Book A Demo',
    primaryCtaTo: '/BookStrategyCall',
    secondaryCtaLabel: 'Get Started Now',
    secondaryCtaTo: '/GetStartedNow?plan=growth',
    helper: 'Submit your details and continue into the setup flow.',
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    setup: '$7,500+',
    monthly: '$3,000+',
    desc: 'Best for more advanced workflows, multiple teams, or more complex integration requirements.',
    valueLine: 'Custom setup, management, support, optimisation, and workflow design for larger operations.',
    features: [
      'Advanced setup',
      'Monthly management',
      'Optimisation included',
      'Support included',
      'Reporting included',
      'Custom integrations and workflow design',
    ],
    featured: false,
    primaryCtaLabel: 'Talk To Us',
    primaryCtaTo: '/Contact',
    secondaryCtaLabel: 'Get Started Now',
    secondaryCtaTo: '/GetStartedNow?plan=enterprise',
    helper: 'Best for custom scoping, integrations, and rollout planning.',
  },
];

export default function PricingPreview() {
  return (
    <section className="relative py-18 md:py-24 bg-[#0c0c14]">
      <div className="bg-radial-glow absolute inset-0" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 md:mb-14">
          <p className="text-cyan-400 mb-3 text-base font-medium tracking-[0.16em]">PRICING SNAPSHOT</p>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Simple Pricing for a Productised Service</h2>
          <p className="mt-4 max-w-2xl mx-auto text-base leading-7 text-gray-400 md:text-lg">
            All plans include setup, support, optimisation, and ongoing management.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex h-full flex-col rounded-2xl border p-8 card-hover ${
                plan.featured
                  ? 'border-cyan-500/30 bg-gradient-to-b from-cyan-500/5 to-[#12121a] glow-border'
                  : 'border-white/5 bg-[#12121a]'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-xs font-medium text-white">
                  Most Popular
                </div>
              )}

              <div className="min-h-[8.5rem]">
                <h3 className="text-white font-semibold text-xl">{plan.name}</h3>
                <p className="text-gray-400 mt-2 text-base leading-relaxed">{plan.desc}</p>
              </div>

              <div className="mb-2 mt-2 min-h-[5.5rem]">
                <div className="flex flex-wrap items-end gap-2">
                  <span className="text-4xl font-bold text-white">{plan.monthly}</span>
                  <span className="pb-1 text-sm text-gray-500">/month</span>
                </div>
                <p className="mt-2 text-base text-gray-500">{plan.setup} setup fee</p>
              </div>

              <p className="min-h-[4.5rem] text-sm leading-relaxed text-gray-300 mt-3 mb-8">{plan.valueLine}</p>

              <ul className="space-y-3 mb-8 min-h-[13rem]">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto space-y-3">
                <Link
                  to={plan.primaryCtaTo}
                  className={`block w-full rounded-full py-3.5 text-center text-sm font-medium transition-all ${
                    plan.featured
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/20'
                      : 'border border-white/10 text-white hover:bg-white/5'
                  }`}
                >
                  {plan.primaryCtaLabel}
                </Link>
                <Link
                  to={plan.secondaryCtaTo}
                  className="block w-full rounded-full border border-cyan-500/20 bg-cyan-500/5 py-3.5 text-center text-sm font-medium text-white transition-all hover:bg-cyan-500/10"
                >
                  {plan.secondaryCtaLabel}
                </Link>
                <p className="px-2 text-center text-xs leading-relaxed text-gray-500">
                  {plan.helper}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}