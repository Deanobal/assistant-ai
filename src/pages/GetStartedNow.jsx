import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import CheckoutReturnCard from '@/components/pricing/CheckoutReturnCard';
import PlanSelectionStep from '@/components/get-started/PlanSelectionStep';
import SignupDetailsForm from '@/components/get-started/SignupDetailsForm';
import SignupReviewStep from '@/components/get-started/SignupReviewStep';
import { getPlanFromUrl, getPlanByName } from '@/components/get-started/planConfig';

const initialForm = {
  full_name: '',
  business_name: '',
  email: '',
  mobile_number: '',
  industry: '',
  website: '',
  service_needed: '',
  current_call_handling: '',
  monthly_enquiry_volume: '',
};

async function createSupabaseSignupLead(payload) {
  const response = await fetch('/api/leads-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || 'Supabase signup lead API failed');
  }
  return data?.lead;
}

async function createBase44SignupLead(payload) {
  const leadResponse = await base44.functions.invoke('createAIQualifiedLead', payload);
  const lead = leadResponse?.data?.lead;
  if (!lead?.id) throw new Error('Unable to create your signup record.');
  return lead;
}

async function createVercelCheckout({ lead, confirmedPlan, form }) {
  const response = await fetch('/api/stripe-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lead_id: lead.id,
      selected_plan: confirmedPlan.name,
      full_name: form.full_name,
      business_name: form.business_name,
      email: form.email,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.checkout_url) {
    throw new Error(data?.error || data?.message || 'Vercel checkout route failed');
  }
  return data.checkout_url;
}

async function createBase44Checkout({ lead, confirmedPlan, form }) {
  const checkoutResponse = await base44.functions.invoke('createCheckoutForQualifiedLead', {
    lead_id: lead.id,
    selected_plan: confirmedPlan.name,
    buyer_confirmed_intent: true,
    full_name: form.full_name,
    business_name: form.business_name,
    email: form.email,
    payment_mode: 'subscription',
  });

  if (!checkoutResponse?.data?.checkout_url) {
    throw new Error(checkoutResponse?.data?.error || 'Unable to start Stripe checkout.');
  }

  return checkoutResponse.data.checkout_url;
}

export default function GetStartedNow() {
  const urlParams = new URLSearchParams(window.location.search);
  const checkoutState = urlParams.get('checkout') || '';
  const sessionId = urlParams.get('session_id') || '';
  const isCheckoutReturn = checkoutState === 'success' || checkoutState === 'cancelled';
  const [selectedPlan, setSelectedPlan] = useState(() => getPlanFromUrl());
  const [step, setStep] = useState(() => (getPlanFromUrl() ? 'details' : 'plans'));
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log('GetStartedNow routing', {
      checkout: checkoutState,
      session_id: sessionId,
      selected_plan: selectedPlan?.name || null,
      renderedView: isCheckoutReturn ? `checkout_${checkoutState}` : step,
    });
  }, [checkoutState, sessionId, isCheckoutReturn, selectedPlan, step]);

  const choosePlan = (plan) => {
    setSelectedPlan(plan);
    setError('');
    setStep('details');
  };

  const changePlan = () => {
    setError('');
    setStep('plans');
  };

  const continueToReview = (event) => {
    event.preventDefault();
    if (!selectedPlan) {
      setError('Please choose a plan before continuing.');
      setStep('plans');
      return;
    }
    setError('');
    setStep('review');
  };

  const proceedToPayment = async () => {
    const confirmedPlan = getPlanByName(selectedPlan?.name);
    if (!confirmedPlan) {
      setError('Please choose a plan before continuing.');
      setStep('plans');
      return;
    }

    setSubmitting(true);
    setError('');

    const leadPayload = {
      full_name: form.full_name,
      business_name: form.business_name,
      email: form.email,
      mobile_number: form.mobile_number,
      industry: form.industry,
      website: form.website || '',
      service_needed: form.service_needed,
      current_call_handling: form.current_call_handling,
      monthly_enquiry_volume: form.monthly_enquiry_volume || '',
      selected_plan: confirmedPlan.name,
      likely_plan_fit: confirmedPlan.name,
      buyer_intent: 'ready_to_proceed',
      lead_source: 'Get Started signup flow',
      source_page: '/GetStartedNow',
      conversation_summary: `${form.service_needed} Current problem: ${form.current_call_handling}`,
    };

    try {
      let lead;
      try {
        lead = await createSupabaseSignupLead(leadPayload);
      } catch (primaryError) {
        console.warn('Supabase signup lead route failed, using Base44 fallback:', primaryError?.message || primaryError);
        lead = await createBase44SignupLead(leadPayload);
      }

      if (!lead?.id) throw new Error('Unable to create your signup record.');

      let checkoutUrl;
      try {
        checkoutUrl = await createVercelCheckout({ lead, confirmedPlan, form });
      } catch (primaryCheckoutError) {
        console.warn('Vercel checkout route failed, using Base44 checkout fallback:', primaryCheckoutError?.message || primaryCheckoutError);
        checkoutUrl = await createBase44Checkout({ lead, confirmedPlan, form });
      }

      window.location.href = checkoutUrl;
    } catch (checkoutError) {
      setError(checkoutError?.response?.data?.error || checkoutError?.message || 'Unable to start secure payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="relative py-24 md:py-28 bg-grid">
        <div className="bg-radial-glow absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <p className="text-cyan-400 mb-3 text-base font-medium">START YOUR ASSISTANTAI SETUP</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance text-white">
              {isCheckoutReturn ? 'Checkout Update' : selectedPlan ? `Start with the ${selectedPlan.name} Plan` : 'Choose Your Plan First'}
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              Select Starter or Growth, confirm your details, then proceed to secure payment only when you’re ready. Prices are in AUD and exclude GST unless stated otherwise.
            </p>
          </motion.div>

          {isCheckoutReturn ? (
            <div className="max-w-4xl mx-auto">
              <CheckoutReturnCard planName={selectedPlan?.name || 'selected'} checkoutState={checkoutState} sessionId={sessionId} />
            </div>
          ) : (
            <div className="mx-auto max-w-5xl">
              {step === 'plans' && (
                <>
                  {error && <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
                  <PlanSelectionStep selectedPlan={selectedPlan} onChoosePlan={choosePlan} />
                </>
              )}

              {step === 'details' && selectedPlan && (
                <SignupDetailsForm
                  form={form}
                  selectedPlan={selectedPlan}
                  onChange={setForm}
                  onBackToPlans={changePlan}
                  onContinue={continueToReview}
                />
              )}

              {step === 'review' && selectedPlan && (
                <SignupReviewStep
                  selectedPlan={selectedPlan}
                  form={form}
                  error={error}
                  submitting={submitting}
                  onBackToForm={() => setStep('details')}
                  onChangePlan={changePlan}
                  onProceed={proceedToPayment}
                />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
