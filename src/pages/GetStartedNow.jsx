import React from 'react';
import { motion } from 'framer-motion';
import LeadForm from '@/components/LeadForm';
import DirectStartPanel from '@/components/pricing/DirectStartPanel';

const plans = {
  starter: {
    key: 'starter',
    name: 'Starter',
    setup: '$1,500',
    monthly: '$497',
    description: 'Best for businesses starting with AI call handling and lead capture.',
  },
  growth: {
    key: 'growth',
    name: 'Growth',
    setup: '$3,000',
    monthly: '$1,500',
    description: 'Best for growing businesses that want voice AI, booking automation, CRM sync, and follow-up.',
  },
};

export default function GetStartedNow() {
  const urlParams = new URLSearchParams(window.location.search);
  const planKey = (urlParams.get('plan') || 'growth').toLowerCase();
  const plan = plans[planKey] || plans.growth;

  return (
    <div>
      <section className="relative py-24 md:py-28 bg-grid">
        <div className="bg-radial-glow absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <p className="text-cyan-400 mb-3 text-base font-medium">START YOUR ASSISTANTAI SETUP</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              Start with the {plan.name} Plan
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              This premium direct-start path is for teams ready to move forward now with setup, monthly management, support, and ongoing optimisation.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3 p-8 md:p-10 rounded-[28px] border border-white/5 bg-[#12121a]"
            >
              <LeadForm
                submitLabel={`Start ${plan.name} Setup`}
                successTitle="Direct Start Request Received"
                successText={`Your ${plan.name} setup request has been saved. Stripe checkout is not live yet, so our team will confirm the next onboarding step manually.`}
                matchedLeadStatus="Onboarding"
                createStatus="Onboarding"
                nextActionText={`${plan.name} direct-start request received. Review for checkout and onboarding handoff.`}
                bookingSource={`direct_start_${plan.key}`}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <DirectStartPanel plan={plan} />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}