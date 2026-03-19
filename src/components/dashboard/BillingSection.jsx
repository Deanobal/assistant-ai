import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, CheckCircle, ArrowRight, Download, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    name: 'Starter',
    setup: '$1,500',
    monthly: '$497',
    features: ['Setup fee', 'Monthly management', 'Support included', 'Reporting included'],
  },
  {
    name: 'Growth',
    setup: '$3,000',
    monthly: '$1,500',
    features: ['Setup fee', 'Monthly management', 'Optimisation included', 'Support included', 'Reporting included'],
    recommended: true,
  },
  {
    name: 'Enterprise',
    setup: '$7,500+',
    monthly: '$3,000+',
    features: ['Advanced setup', 'Monthly management', 'Optimisation included', 'Support included', 'Reporting included'],
  },
];

const sampleInvoices = [
  { id: 'INV-001', date: 'Mar 1, 2026', amount: '$1,500', status: 'Paid' },
  { id: 'INV-002', date: 'Feb 1, 2026', amount: '$1,500', status: 'Paid' },
  { id: 'INV-003', date: 'Jan 3, 2026', amount: '$3,000', status: 'Paid' },
];

const statusBadgeClass = {
  pending: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  active: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  paid: 'bg-green-500/10 text-green-400 border-green-500/20',
  trial: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  past_due: 'bg-red-500/10 text-red-400 border-red-500/20',
  paused: 'bg-white/5 text-gray-300 border-white/10',
  cancelled: 'bg-white/5 text-gray-300 border-white/10',
};

export default function BillingSection({ mode = 'live', clientId = null }) {
  const isSample = mode === 'sample';

  const { data: billingRecords = [], isLoading } = useQuery({
    queryKey: ['billing-records', clientId || 'all', mode],
    queryFn: () => clientId
      ? base44.entities.BillingRecord.filter({ client_id: clientId }, '-updated_date', 100)
      : base44.entities.BillingRecord.list('-updated_date', 100),
    initialData: [],
    enabled: !isSample,
  });

  const latestRecord = billingRecords[0] || null;

  if (!isSample && isLoading) {
    return (
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-8 text-center text-gray-400">Loading billing…</CardContent>
      </Card>
    );
  }

  const hasLiveData = !!latestRecord;
  const invoices = isSample
    ? sampleInvoices
    : billingRecords.filter((record) => record.invoice_reference).map((record) => ({
        id: record.invoice_reference,
        date: record.last_payment_date ? new Date(record.last_payment_date).toLocaleDateString() : 'No payment yet',
        amount: record.monthly_fee_amount ? `$${record.monthly_fee_amount.toLocaleString()}` : 'Not set',
        status: record.billing_status,
      }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h2>
        <p className="text-gray-400">{isSample ? 'Sample billing preview showing how plans, invoices, renewal details, and secure payment management can appear.' : 'Live billing structure is ready for real client records and future Stripe integration.'}</p>
      </div>

      {hasLiveData ? (
        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
              <div>
                <Badge className={`${statusBadgeClass[latestRecord.billing_status] || statusBadgeClass.pending} mb-3`}>{latestRecord.billing_status}</Badge>
                <h3 className="text-3xl font-bold text-white mb-1">{latestRecord.plan_name}</h3>
                <p className="text-gray-300">${(latestRecord.monthly_fee_amount || 0).toLocaleString()}/month • Renews {latestRecord.renewal_date || 'Not scheduled'}</p>
                <p className="text-gray-500 text-sm mt-2">Setup fee: {typeof latestRecord.setup_fee_amount === 'number' ? `$${latestRecord.setup_fee_amount.toLocaleString()}` : 'Not set'}</p>
              </div>
              <div className="text-left lg:text-right">
                <p className="text-gray-400 text-sm mb-1">Next Payment</p>
                <p className="text-2xl font-bold text-white">{latestRecord.next_payment_date ? new Date(latestRecord.next_payment_date).toLocaleDateString() : 'Not scheduled'}</p>
                <p className="text-gray-500 text-xs">Payment method: {latestRecord.payment_method_status || 'Not added'}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25">
                Manage Billing
              </Button>
              <Button variant="outline" className="flex-1 border-white/10 bg-transparent text-white hover:bg-white/5">
                View Plan Options
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !isSample ? (
        <Card className="bg-[#12121a] border-white/5">
          <CardContent className="p-10 text-center space-y-3">
            <h3 className="text-xl font-semibold text-white">No Live Billing Data Yet</h3>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">Billing records will appear here once this client has a real billing profile, invoice references, and payment state stored.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
              <div>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-3">Sample Billing Preview</Badge>
                <h3 className="text-3xl font-bold text-white mb-1">Growth</h3>
                <p className="text-gray-300">$1,500/month • Renews Apr 1, 2026</p>
                <p className="text-gray-500 text-sm mt-2">Setup fee status: Example only</p>
              </div>
              <div className="text-left lg:text-right">
                <p className="text-gray-400 text-sm mb-1">Payment Method</p>
                <p className="text-2xl font-bold text-white">Stored</p>
                <p className="text-gray-500 text-xs">Sample card status</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25">
                Manage Billing
              </Button>
              <Button variant="outline" className="flex-1 border-white/10 bg-transparent text-white hover:bg-white/5">
                View Plan Options
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="text-xl font-bold text-white mb-4">Available Plans</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={`bg-[#12121a] border-white/5 ${plan.recommended ? 'border-cyan-500/30' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
                  {plan.recommended && (
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Recommended</Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-bold text-white">{plan.monthly}<span className="text-gray-400 text-base font-normal">/month</span></p>
                  <p className="text-gray-500 text-sm">{plan.setup} setup fee</p>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25">
                  {hasLiveData && latestRecord?.plan_name === plan.name ? 'Current Plan' : 'View Plan'}
                  {(!hasLiveData || latestRecord?.plan_name !== plan.name) && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-4">Payment Method</h3>
        <Card className="bg-[#12121a] border-white/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{hasLiveData ? `Payment method ${latestRecord.payment_method_status || 'not added'}` : 'No payment method stored yet'}</p>
                  <p className="text-gray-500 text-sm">{hasLiveData && latestRecord.stripe_customer_id ? `Stripe customer ${latestRecord.stripe_customer_id}` : 'Stripe-ready architecture in place'}</p>
                </div>
              </div>
              <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/5">
                Manage Payment Method
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 rounded-xl border border-white/5 bg-[#0a0a0f] px-4 py-3">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              {hasLiveData ? 'Billing data stored and ready for Stripe-linked workflows.' : 'Payment method and Stripe identifiers will appear here when billing is connected.'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-4">Billing History</h3>
        <Card className="bg-[#12121a] border-white/5">
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No invoice references stored yet.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <Download className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{invoice.id}</p>
                        <p className="text-gray-500 text-sm">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-left sm:text-right">
                        <p className="text-white font-semibold">{invoice.amount}</p>
                        <Badge className={`${statusBadgeClass[invoice.status] || 'bg-white/5 text-gray-300 border-white/10'} text-xs`}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/5">
                        View Reference
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}