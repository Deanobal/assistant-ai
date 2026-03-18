import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const fields = [
  ['business_name', 'Business Name'],
  ['contact_name', 'Contact Person'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['website', 'Website'],
  ['address', 'Address'],
  ['industry', 'Industry'],
  ['timezone', 'Timezone'],
  ['plan_name', 'Current Plan'],
  ['billing_status', 'Billing Status'],
  ['renewal_date', 'Renewal Date'],
];

export default function WorkspaceOverviewTab({ draft, onChange, onSave }) {
  return (
    <div className="space-y-6">
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {fields.map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label className="text-gray-400">{label}</Label>
              <Input value={draft[key] || ''} onChange={(e) => onChange(key, e.target.value)} className="bg-white/[0.03] border-white/10 text-white" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            ['Total Calls This Month', draft.total_calls_month],
            ['Leads Captured', draft.leads_captured],
            ['Appointments Booked', draft.appointments_booked],
            ['Last Activity', draft.last_activity],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-white text-lg font-semibold mt-1">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSave} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">Save Business Details</Button>
      </div>
    </div>
  );
}