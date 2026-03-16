import React, { useState } from 'react';
import { CreditCard, CheckCircle, ArrowRight, Download, ShieldCheck } from 'lucide-react';
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

const invoices = [
  { id: 'INV-001', date: 'Mar 1, 2026', amount: '$1,500', status: 'Paid' },
  { id: 'INV-002', date: 'Feb 1, 2026', amount: '$1,500', status: 'Paid' },
  { id: 'INV-003', date: 'Jan 3, 2026', amount: '$3,000', status: 'Paid' },
];

export default function BillingSection() {
  const [currentPlan] = useState('Growth');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h2>
        <p className="text-gray-400">Sample billing preview showing plans, invoices, renewal details, and secure payment management.</p>
      </div>

      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
            <div>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-3">Current Plan</Badge>
              <h3 className="text-3xl font-bold text-white mb-1">{currentPlan}</h3>
              <p className="text-gray-300">$1,500/month • Renews Apr 1, 2026</p>
              <p className="text-gray-500 text-sm mt-2">Setup fee status: Paid in full</p>
            </div>
            <div className="text-left lg:text-right">
              <p className="text-gray-400 text-sm mb-1">Monthly Usage</p>
              <p className="text-2xl font-bold text-white">342 / 500</p>
              <p className="text-gray-500 text-xs">calls handled this cycle</p>
            </div>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '68%' }} />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25">
              Upgrade Plan
            </Button>
            <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5">
              Downgrade Options
            </Button>
          </div>
        </CardContent>
      </Card>

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
                <Button
                  disabled={currentPlan === plan.name}
                  className={`w-full ${
                    currentPlan === plan.name
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                  }`}
                >
                  {currentPlan === plan.name ? 'Current Plan' : 'Select Plan'}
                  {currentPlan !== plan.name && <ArrowRight className="w-4 h-4 ml-2" />}
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
                  <p className="text-white font-medium">Visa ending in 4242</p>
                  <p className="text-gray-500 text-sm">Expires 12/2027</p>
                </div>
              </div>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                Manage Payment Method
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 rounded-xl border border-white/5 bg-[#0a0a0f] px-4 py-3">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Payments securely managed with Stripe
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-4">Billing History</h3>
        <Card className="bg-[#12121a] border-white/5">
          <CardContent className="p-0">
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
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/5">
                      Download Invoice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}