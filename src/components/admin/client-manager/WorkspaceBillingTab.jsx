import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function WorkspaceBillingTab({ client, billingRecords = [] }) {
  const overageCharge = client.overage_usage > 0 ? `$${(client.overage_usage * 1.75).toFixed(2)}` : '$0.00';
  const latestBilling = billingRecords[0] || null;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ['Current Plan', latestBilling?.plan_name || client.plan_name],
          ['Setup Fee Status', client.setup_fee_status],
          ['Monthly Fee', latestBilling?.monthly_fee_amount ? `$${latestBilling.monthly_fee_amount.toLocaleString()}` : `$${(client.monthly_fee || 0).toLocaleString()}`],
          ['Renewal Date', latestBilling?.renewal_date || client.renewal_date || 'Not set'],
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
        <CardContent className="p-6 grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Billing Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400"><span>Payment Method</span><span className="text-white">{client.payment_method_label || latestBilling?.payment_method_status || 'Not added'}</span></div>
              <div className="flex justify-between text-gray-400"><span>Billing Status</span><span className="text-white">{latestBilling?.billing_status || client.billing_status}</span></div>
              <div className="flex justify-between text-gray-400"><span>Billing Record</span><span className="text-white">{latestBilling?.invoice_reference || 'No billing reference yet'}</span></div>
              <div className="flex justify-between text-gray-400"><span>Premium Support Add-On</span><span className="text-white">{client.premium_support_add_on ? 'Enabled' : 'Not active'}</span></div>
              <div className="flex justify-between text-gray-400"><span>Add-On Charges</span><span className="text-white">${(client.extra_call_packs * 250).toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-400"><span>Call Overages</span><span className="text-white">{overageCharge}</span></div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Usage & Add-Ons</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400"><span>Included Monthly Calls</span><span className="text-white">{client.included_calls}</span></div>
              <div className="flex justify-between text-gray-400"><span>Used Calls This Month</span><span className="text-white">{client.used_calls}</span></div>
              <div className="flex justify-between text-gray-400"><span>Extra Call Packs</span><span className="text-white">{client.extra_call_packs}</span></div>
              <div className="flex justify-between text-gray-400"><span>Overage Usage</span><span className="text-white">{client.overage_usage}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 space-y-3">
          <h3 className="text-white font-semibold">Linked Billing Records</h3>
          {billingRecords.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-6 text-sm text-gray-400">
              No linked billing records yet.
            </div>
          ) : billingRecords.map((record) => (
            <div key={record.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm">
              <div>
                <p className="text-white font-medium">{record.invoice_reference || record.plan_name}</p>
                <p className="text-gray-500">{record.renewal_date || 'No renewal date set'}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">${(record.monthly_fee_amount || 0).toLocaleString()}</p>
                <p className="text-gray-500">{record.billing_status}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}