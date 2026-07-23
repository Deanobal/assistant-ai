import { useState } from 'react';
import SEO from '@/components/SEO';
import CheckoutReturnCard from '@/components/pricing/CheckoutReturnCard';
import PlanSelectionStep from '@/components/get-started/PlanSelectionStep';
import SignupDetailsForm from '@/components/get-started/SignupDetailsForm';
import SignupReviewStep from '@/components/get-started/SignupReviewStep';
import { getPlanFromUrl, getPlanByName } from '@/components/get-started/planConfig';
import {
  AccentText,
  PageShell,
  Section,
} from '@/components/marketing/PremiumMarketing';

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
    throw new Error(data?.error || 'Unable to create your signup record.');
  }
  return data?.lead;
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
    throw new Error(data?.error || data?.message || 'Unable to start secure Stripe checkout.');
  }
  return data.checkout_url;
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
      const lead = await createSupabaseSignupLead(leadPayload);
      if (!lead?.id) throw new Error('Unable to create your signup record.');

      const checkoutUrl = await createVercelCheckout({ lead, confirmedPlan, form });
      window.location.href = checkoutUrl;
    } catch (checkoutError) {
      setError(checkoutError?.response?.data?.error || checkoutError?.message || 'Unable to start secure payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Get Started | AssistantAI Secure Signup"
        description="Choose a Starter or Growth AssistantAI plan, confirm your business details, and proceed to secure signup for AI receptionist setup."
        canonicalPath="/GetStartedNow"
      />
      <PageShell>
        <Section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,rgba(31,111,255,0.13),transparent_32%)]" />
          <div className="relative">
            <div className="mb-12 max-w-4xl">
              <h1 className="text-balance text-[2.75rem] font-[720] leading-[1.02] tracking-[-0.052em] text-white sm:text-[3.7rem] lg:text-[4.15rem]">
                {isCheckoutReturn ? 'Checkout update.' : selectedPlan ? <>Start with the <AccentText>{selectedPlan.name}</AccentText> plan.</> : <>Choose your <AccentText>starting plan.</AccentText></>}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#aeb8c6] sm:text-lg">
                Select Starter or Growth, confirm your details, then proceed to secure payment only when you’re ready. Prices are in AUD and exclude GST unless stated otherwise.
              </p>
            </div>

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
        </Section>
      </PageShell>
    </>
  );
}
