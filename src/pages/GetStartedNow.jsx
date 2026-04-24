import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import LeadForm from '@/components/LeadForm';
import DirectStartPanel from '@/components/pricing/DirectStartPanel';
import CheckoutReturnCard from '@/components/pricing/CheckoutReturnCard';

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
  const checkoutState = urlParams.get('checkout') || '';
  const sessionId = urlParams.get('session_id') || '';
  const plan = plans[planKey] || plans.growth;
  const isCheckoutReturn = checkoutState === 'success' || checkoutState === 'cancelled';
  const renderedView = isCheckoutReturn ? `checkout_${checkoutState}` : 'lead_form';

  useEffect(() => {
    console.log('GetStartedNow routing', {
      checkout: checkoutState,
      session_id: sessionId,
      renderedView,
    });
  }, [checkoutState, sessionId, renderedView]);

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

          {isCheckoutReturn ? (
            <div className="max-w-4xl mx-auto">
              <CheckoutReturnCard planName={plan.name} checkoutState={checkoutState} sessionId={sessionId} />
            </div>
          ) : (
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
                successText={`Your ${plan.name} setup details have been saved.`}
                matchedLeadStatus="Onboarding"
                createStatus="Onboarding"
                nextActionText={`${plan.name} direct-start request received. Review for checkout and onboarding handoff.`}
                bookingSource={`direct_start_${plan.key}`}
                onSubmitted={async ({ form }) => {
                  const clientResponse = await base44.functions.invoke('upsertPublicStarterClient', {
                    fullName: form.full_name,
                    businessName: form.business_name,
                    email: form.email,
                    mobileNumber: form.mobile_number,
                    industry: form.industry,
                    website: form.website || '',
                    monthlyEnquiryVolume: form.monthly_enquiry_volume,
                    message: form.message,
                    plan: plan.name,
                  });

                  const clientId = clientResponse?.data?.client?.id;
                  const fullName = form.full_name?.trim();
                  const email = form.email?.trim();

                  if (!clientId || !fullName || !email) {
                    throw new Error('Missing required checkout details.');
                  }

                  const checkoutPayload = {
                    clientId,
                    fullName,
                    email,
                    origin: 'public_get_started',
                  };

                  console.log('createStripeCheckout payload', checkoutPayload);

                  const response = await base44.functions.invoke('createStripeCheckout', {
                    ...checkoutPayload,
                    plan: 'starter',
                  });

                  if (!response?.data?.checkout_url) {
                    throw new Error(response?.data?.error || 'Unable to start Stripe checkout.');
                  }

                  return {
                    redirectTo: response.data.checkout_url,
                  };
                }}
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
          )}
        </div>
      </section>
    </div>
  );
}