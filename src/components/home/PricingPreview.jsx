import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    setup: '$1,500',
    monthly: '$497',
    desc: 'Done-for-you AI call handling for businesses that need a strong first step into automation.',
    features: ['Setup fee included upfront', 'Monthly management included', 'Support included', 'Reporting included', 'Lead capture and call handling'],
    featured: false,
  },
  {
    name: 'Growth',
    setup: '$3,000',
    monthly: '$1,500',
    desc: 'Best for businesses ready for AI voice, bookings, CRM sync, and automated follow-up.',
    features: ['Setup fee included upfront', 'Monthly management included', 'Optimisation included', 'Support included', 'Reporting included', 'CRM, booking, and follow-up automation'],
    featured: true,
  },
  {
    name: 'Enterprise',
    setup: '$7,500+',
    monthly: '$3,000+',
    desc: 'For multi-location or more complex workflows that need broader integrations and deeper automation.',
    features: ['Advanced setup included', 'Monthly management included', 'Optimisation included', 'Support included', 'Reporting included', 'Custom integrations and workflow design'],
    featured: false,
  },
];

export default function PricingPreview() {
  return (
    <section className="relative py-20 md:py-24 bg-[#0c0c14]">
      <div className="bg-radial-glow absolute inset-0" />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-cyan-400 text-sm font-medium mb-3">PRICING</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Done-for-You Pricing for AI Automation</h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Setup, monthly management, support, optimisation, and reporting are built into the way AssistantAI.com.au is delivered.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-2xl border card-hover ${
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

              <h3 className="text-white font-semibold text-lg">{plan.name}</h3>
              <p className="text-gray-400 text-sm mt-2 mb-6 leading-relaxed">{plan.desc}</p>

              <div className="mb-2">
                <span className="text-3xl font-bold text-white">{plan.monthly}</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">{plan.setup} setup fee</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/Contact"
                className={`block w-full text-center py-3 rounded-full text-sm font-medium transition-all ${
                  plan.featured
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/20'
                    : 'border border-white/10 text-white hover:bg-white/5'
                }`}
              >
                Book Strategy Call
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/Pricing"
            className="inline-flex items-center gap-2 text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors"
          >
            Compare All Plans <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}