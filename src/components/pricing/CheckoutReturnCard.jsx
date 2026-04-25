import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Clock3, AlertCircle, ArrowRight } from 'lucide-react';

export default function CheckoutReturnCard({ planName, checkoutState, sessionId }) {
  const [state, setState] = useState({ loading: checkoutState === 'success', error: '', data: null });

  useEffect(() => {
    if (checkoutState !== 'success' || !sessionId) return;

    const loadStatus = async () => {
      try {
        const response = await base44.functions.invoke('getStripeCheckoutStatus', { sessionId });
        setState({ loading: false, error: '', data: response.data });
      } catch (error) {
        setState({ loading: false, error: error?.response?.data?.error || error.message || 'Unable to confirm your Stripe payment yet.', data: null });
      }
    };

    loadStatus();
  }, [checkoutState, sessionId]);

  if (checkoutState === 'cancelled') {
    return (
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-300 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Checkout Cancelled</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Your payment was not completed, and nothing has been marked as paid. You can review the plan details below and restart when you are ready.</p>
        </CardContent>
      </Card>
    );
  }

  if (checkoutState !== 'success') {
    return null;
  }

  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-8 text-center space-y-4">
        {state.loading ? (
          <>
            <Loader2 className="w-10 h-10 text-cyan-300 mx-auto animate-spin" />
            <h2 className="text-2xl font-bold text-white">Checking Payment Status</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">AssistantAI is checking your checkout status safely through the app while waiting for Stripe webhook confirmation.</p>
          </>
        ) : state.error ? (
          <>
            <Clock3 className="w-10 h-10 text-amber-300 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Return Received — Confirmation Pending</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">You returned from Stripe successfully, but onboarding stays locked until the Stripe webhook confirms payment.</p>
            <p className="text-sm text-amber-200">{state.error}</p>
          </>
        ) : state.data?.billing_status === 'active' ? (
          <>
            <CheckCircle2 className="w-10 h-10 text-cyan-300 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Payment Confirmed — Onboarding Started</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Your {state.data?.plan_name || planName} payment has been confirmed by Stripe, your billing record is active, and onboarding has started successfully.</p>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-gray-300 text-left max-w-2xl mx-auto">
              <p className="text-white font-medium mb-2">Next steps</p>
              <ul className="space-y-1">
                <li>• Your setup fee has been recorded as paid.</li>
                <li>• Your client, billing, and onboarding records have been updated automatically.</li>
                <li>• Complete your onboarding intake form so AssistantAI can begin system setup.</li>
                <li>• Our team will usually begin the onboarding handoff within one business day.</li>
              </ul>
            </div>
            {state.data?.intake_url && (
              <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                <a href={state.data.intake_url}>
                  Go to Onboarding Intake Form
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            )}
          </>
        ) : (
          <>
            <Clock3 className="w-10 h-10 text-amber-300 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Checkout Complete — Waiting for Webhook Confirmation</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Your return from Stripe was received, but billing stays pending until the Stripe webhook marks it active.</p>
            {state.data?.billing_status && state.data?.billing_status !== 'awaiting_payment' && (
              <p className="text-sm text-amber-200">Current billing status: {state.data.billing_status}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}