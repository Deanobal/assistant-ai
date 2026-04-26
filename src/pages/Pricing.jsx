import * as React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, HelpCircle } from 'lucide-react';

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
  'AI call handling and lead capture'],

  featured: false,
  directStart: false,
  primaryCtaLabel: 'Book A Demo',
  primaryCtaTo: '/BookStrategyCall',
  secondaryCtaLabel: 'Talk To Us',
  secondaryCtaTo: '/Contact',
  secondaryHelper: 'Best if you want to confirm fit, scope, and next steps first.'
  },
{
  name: 'Growth',
  slug: 'growth',
  setup: '$3,000',
  monthly: '$1,500',
  desc: 'Best for growing businesses that want voice AI, booking automation, CRM sync, and follow-up.',
  valueLine: 'Setup, management, support, and optimisation for businesses ready to scale faster.',
  features: [
  'Done-for-you setup',
  'Monthly management',
  'Optimisation included',
  'Support included',
  'Reporting included',
  'CRM, calendar, and follow-up automation'],

  featured: true,
  directStart: true,
  primaryCtaLabel: 'Book A Demo',
  primaryCtaTo: '/BookStrategyCall',
  secondaryCtaLabel: 'Start Your Setup',
  secondaryCtaTo: '/GetStartedNow?plan=growth',
  secondaryHelper: 'Best for teams ready to submit details and continue into the setup flow.'
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
  'Custom integrations and workflow design'],

  featured: false,
  directStart: false,
  primaryCtaLabel: 'Talk To Us',
  primaryCtaTo: '/Contact',
  secondaryCtaLabel: 'Book A Demo',
  secondaryCtaTo: '/BookStrategyCall',
  secondaryHelper: 'Best for custom scoping, integrations, and rollout planning.'
  }];


const faqs = [
{
  q: 'How long does setup take?',
  a: 'Most setups can be scoped and launched quickly, depending on how complex your call flow and integrations are.'
},
{
  q: 'Do I need to change my phone number?',
  a: 'Usually no. AssistantAI.com.au is designed to work with your existing call workflow wherever possible.'
},
{
  q: 'Can the AI transfer calls to staff?',
  a: 'Yes. Call routing can be configured so urgent or specific enquiries go to the right person when needed.'
},
{
  q: 'Can it book appointments?',
  a: 'Yes. We can connect appointment workflows to your calendar and booking process.'
},
{
  q: 'What tools does it integrate with?',
  a: 'Common setups include CRM systems, Google or Outlook Calendar, and SMS follow-up tools.'
},
{
  q: 'Can I upgrade later?',
  a: 'Yes. Plans can scale as your workflow becomes more advanced.'
},
{
  q: 'Do you offer support and optimisation?',
  a: 'Yes. Support, reporting, and ongoing optimisation are built into the service model.'
}];


export default function Pricing() {
  return (
    <>
      <SEO
        title="Pricing | AI Automation System for Service Businesses | AssistantAI"
        description="Review AssistantAI pricing for an AI assistant and AI receptionist with lead capture, job booking, follow-up automation, CRM integration, and service business automation."
        canonicalPath="/Pricing"
      />
      <div>
      <section className="relative py-24 md:py-32 bg-grid">
        <div className="bg-radial-glow absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20">

            <p className="text-cyan-400 mb-3 text-lg font-medium">PRICING</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Done-for-You Pricing for{' '}
              <span className="text-gradient">Premium AI Automation</span>
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-3xl mx-auto">
              All plans include setup, support, optimisation, and ongoing management for Australian service businesses that want stronger lead capture, faster response times, CRM integration, and less admin.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-24">
            {plans.map((plan, i) =>
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-2xl border card-hover ${
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
                    }
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
                    {plan.secondaryHelper}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>

            <h2 className="text-2xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {faqs.map((faq, i) =>
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-[#12121a]">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white mb-2 text-base font-medium">{faq.q}</h4>
                      <p className="text-gray-500 text-base leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center">

            <p className="text-gray-400 mb-4">Not sure which plan is right for your workflow?</p>
            <Link
              to="/Contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-sm">

              Speak to Our Team
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
      </div>
    </>);

}