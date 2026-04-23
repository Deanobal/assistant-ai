import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PLAN_PRICING } from './onboardingConfig';
import AdminBillingActions from './AdminBillingActions';

export default function BillingTab({ billing, onSendCheckout, onOverrideActive, isSendingCheckout, isUpdatingBilling }) {
  const pricing = PLAN_PRICING[billing?.plan] || { setup_fee: 0, monthly_fee: 0 };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ['Current Plan', billing?.plan || 'Not set'],
          ['Setup Fee', `$${(billing?.setup_fee ?? pricing.setup_fee).toLocaleString()}${billing?.plan === 'Enterprise' ? '+' : ''}`],
          ['Monthly Fee', `$${(billing?.monthly_fee ?? pricing.monthly_fee).toLocaleString()}${billing?.plan === 'Enterprise' ? '+' : ''}/month`],
          ['Billing Status', billing?.billing_status || 'draft'],
        ].map(([label, value]) => (
          <Card key={label} className="bg-[#12121a] border-white/5">
            <CardContent className="p-5">
              <p className="text-sm text-gray-400">{label}</p>
              <p className="text-xl font-semibold text-white mt-2">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 grid md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-gray-300">Payment method: {billing?.payment_method || 'Not set'}</div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-gray-300">Invoice reference: {billing?.invoice_reference || 'Not set'}</div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-gray-300">Renewal date: {billing?.renewal_date || 'Not set'}</div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-gray-300">Stripe customer: {billing?.stripe_customer_id || 'Not set'}</div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-gray-300">Stripe subscription: {billing?.stripe_subscription_id || 'Not set'}</div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-gray-300">Admin override: {billing?.admin_override ? 'Yes' : 'No'}</div>
        </CardContent>
      </Card>

      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-gray-400">Stripe is the billing source of truth for this onboarding flow.</p>
          <AdminBillingActions
            billing={billing}
            onSendCheckout={onSendCheckout}
            onOverrideActive={onOverrideActive}
            isSending={isSendingCheckout}
            isUpdating={isUpdatingBilling}
          />
        </CardContent>
      </Card>
    </div>
  );
}