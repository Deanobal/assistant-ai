import * as React from 'react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    slug: 'starter',
    setup: '$1,500',
    monthly: '$497',
    desc: 'For businesses getting started with better call handling and lead capture.',
    featured: false,
    directStart: true,
  },
  {
    name: 'Growth',
    slug: 'growth',
    setup: '$3,000',
    monthly: '$1,500',
    desc: 'For businesses ready to combine calls, bookings, CRM sync, and follow-up automation.',
    featured: true,
    directStart: true,
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    setup: '$7,500+',
    monthly: '$3,000+',
    desc: 'For larger or more complex service workflows that need deeper automation and integration.',
    featured: false,
    directStart: false,
  },
];

export default function PricingPreview() {
  return (
    <section className="relative py-16 md:py-20 bg-[#0c0c14]">
      <div className="bg-radial-glow absolute inset-0" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-cyan-400 mb-3 text-lg font-medium">PRICING SNAPSHOT</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple Pricing for a Productised Service</h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            All plans include setup, support, optimisation, and ongoing management.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex h-full flex-col rounded-2xl border p-6 md:p-8 ${
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

              <h3 className="text-lg font-semibold text-white md:text-xl">{plan.name}</h3>
              <p className="mt-2 mb-6 text-sm leading-relaxed text-gray-400 md:text-base">{plan.desc}</p>

              <div className="space-y-2">
                <p className="text-3xl font-bold text-white md:text-4xl">{plan.setup}</p>
                <p className="text-sm text-gray-500">setup</p>
              </div>
              <div className="mt-6 space-y-2">
                <p className="text-3xl font-bold text-white md:text-4xl">{plan.monthly}</p>
                <p className="text-sm text-gray-500">per month</p>
              </div>

              <div className="mt-8 space-y-3">
                <Link
                  to="/BookStrategyCall"
                  className={`block w-full rounded-full py-3 text-center text-sm font-medium transition-all ${
                    plan.featured
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/20'
                      : 'border border-white/10 text-white hover:bg-white/5'
                  }`}
                >
                  Book Free Strategy Call
                </Link>
                {plan.directStart && (
                  <Link
                    to={`/GetStartedNow?plan=${plan.slug}`}
                    className="block w-full rounded-full border border-cyan-500/20 bg-cyan-500/5 py-3 text-center text-sm font-medium text-white transition-all hover:bg-cyan-500/10"
                  >
                    Get Started Now
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}