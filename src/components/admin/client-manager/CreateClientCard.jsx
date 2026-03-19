import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const industries = [
  ['trades', 'Trades'],
  ['real_estate', 'Real Estate'],
  ['medical_clinic', 'Medical Clinic'],
  ['dental_clinic', 'Dental Clinic'],
  ['law_firm', 'Law Firm'],
  ['automotive', 'Automotive'],
  ['hospitality', 'Hospitality'],
  ['other', 'Other'],
];

const statuses = ['Active', 'Onboarding', 'Trial', 'Paused', 'Cancelled'];

export default function CreateClientCard({ onCreate, isSaving }) {
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    industry: 'other',
    plan_name: 'Starter',
    status: 'Trial',
  });

  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-6 space-y-5">
        <div>
          <h3 className="text-white font-semibold text-lg">Create Client</h3>
          <p className="text-sm text-gray-400 mt-1">Create a new client account manually when you need to add one directly into the system.</p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-400">Business Name</Label>
            <Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} className="bg-white/[0.03] border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-400">Contact Name</Label>
            <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className="bg-white/[0.03] border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-400">Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-white/[0.03] border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-400">Industry</Label>
            <Select value={form.industry} onValueChange={(value) => setForm({ ...form, industry: value })}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {industries.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-400">Plan</Label>
            <Select value={form.plan_name} onValueChange={(value) => setForm({ ...form, plan_name: value })}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Starter', 'Growth', 'Enterprise'].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-400">Status</Label>
            <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {statuses.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            disabled={!form.business_name || !form.contact_name || !form.email || isSaving}
            onClick={() => {
              onCreate(form);
              setForm({ business_name: '', contact_name: '', email: '', industry: 'other', plan_name: 'Starter', status: 'Trial' });
            }}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50"
          >
            {isSaving ? 'Creating…' : 'Create Client'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}