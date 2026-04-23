import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const INDUSTRIES = [
  ['trades', 'Trades'],
  ['real_estate', 'Real Estate'],
  ['medical_clinic', 'Medical Clinic'],
  ['dental_clinic', 'Dental Clinic'],
  ['law_firm', 'Law Firm'],
  ['automotive', 'Automotive'],
  ['hospitality', 'Hospitality'],
  ['professional_services', 'Professional Services'],
  ['other', 'Other'],
];

const SOURCES = [
  ['manual_sale', 'Manual Sale'],
  ['referral', 'Referral'],
  ['phone_sale', 'Phone Sale'],
  ['meeting', 'Meeting'],
  ['outbound', 'Outbound'],
];

const PLANS = ['Starter', 'Growth', 'Enterprise'];

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-gray-300">{label}</Label>
      {children}
    </div>
  );
}

export default function NewOnboardingDialog({ open, onOpenChange, form, onChange, onSubmit, isSaving }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#12121a] border-white/10 text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Start New Client Onboarding</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a won lead and launch the normal onboarding flow in one step.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Contact Name">
            <Input value={form.full_name} onChange={(e) => onChange('full_name', e.target.value)} className="bg-white/[0.03] border-white/10 text-white" />
          </Field>
          <Field label="Business Name">
            <Input value={form.business_name} onChange={(e) => onChange('business_name', e.target.value)} className="bg-white/[0.03] border-white/10 text-white" />
          </Field>
          <Field label="Phone">
            <Input value={form.mobile_number} onChange={(e) => onChange('mobile_number', e.target.value)} className="bg-white/[0.03] border-white/10 text-white" />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => onChange('email', e.target.value)} className="bg-white/[0.03] border-white/10 text-white" />
          </Field>
          <Field label="Industry">
            <Select value={form.industry} onValueChange={(value) => onChange('industry', value)}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Plan">
            <Select value={form.plan} onValueChange={(value) => onChange('plan', value)}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue placeholder="Select plan" /></SelectTrigger>
              <SelectContent>
                {PLANS.map((plan) => <SelectItem key={plan} value={plan}>{plan}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Website (optional)">
            <Input value={form.website} onChange={(e) => onChange('website', e.target.value)} className="bg-white/[0.03] border-white/10 text-white" />
          </Field>
          <Field label="Source">
            <Select value={form.source} onValueChange={(value) => onChange('source', value)}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue placeholder="Select source" /></SelectTrigger>
              <SelectContent>
                {SOURCES.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 bg-transparent text-white hover:bg-white/5">Cancel</Button>
          <Button onClick={onSubmit} disabled={isSaving} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50">
            {isSaving ? 'Creating…' : 'Start Onboarding'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}