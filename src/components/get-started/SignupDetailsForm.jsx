import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';

const industries = [
  { value: 'trades', label: 'Trades' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'medical_clinic', label: 'Medical Clinic' },
  { value: 'dental_clinic', label: 'Dental Clinic' },
  { value: 'law_firm', label: 'Law Firm' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'other', label: 'Other' },
];

const volumes = [
  { value: '0_20', label: '0–20 per month' },
  { value: '21_100', label: '21–100 per month' },
  { value: '101_300', label: '101–300 per month' },
  { value: '301_plus', label: '301+ per month' },
];

export default function SignupDetailsForm({ form, selectedPlan, onChange, onBackToPlans, onContinue }) {
  const update = (field, value) => onChange({ ...form, [field]: value });

  return (
    <form onSubmit={onContinue} className="rounded-[16px] border border-[#2a394f] bg-[#07121f] p-7 shadow-[0_28px_80px_rgba(0,0,0,0.22)] md:p-9">
      <div className="mb-7 flex flex-col gap-4 rounded-[11px] border border-[#29405f] bg-[#081727] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-300">Step 1 — Plan selected</p>
          <p className="mt-1 text-xl font-semibold text-white">{selectedPlan.name}: {selectedPlan.setupLabel} + {selectedPlan.monthlyLabel}</p>
        </div>
        <button type="button" onClick={onBackToPlans} className="text-sm font-semibold text-cyan-200 underline underline-offset-4 hover:text-white">
          Change Plan
        </button>
      </div>

      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-300">Step 2 — Your details</p>
        <h2 className="mt-2 text-2xl font-bold text-white">Tell us who we’re setting this up for</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-gray-400">Full name *</Label>
          <Input required value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className="border-[#2d3d54] bg-[#081522] text-white" placeholder="John Smith" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-400">Business name *</Label>
          <Input required value={form.business_name} onChange={(e) => update('business_name', e.target.value)} className="border-[#2d3d54] bg-[#081522] text-white" placeholder="Smith's Plumbing" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-400">Email *</Label>
          <Input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="border-[#2d3d54] bg-[#081522] text-white" placeholder="john@business.com.au" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-400">Mobile number *</Label>
          <Input required type="tel" value={form.mobile_number} onChange={(e) => update('mobile_number', e.target.value)} className="border-[#2d3d54] bg-[#081522] text-white" placeholder="+61 4XX XXX XXX" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-400">Industry *</Label>
          <Select value={form.industry} onValueChange={(value) => update('industry', value)}>
            <SelectTrigger className="border-[#2d3d54] bg-[#081522] text-white"><SelectValue placeholder="Select industry" /></SelectTrigger>
            <SelectContent>{industries.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-400">Website optional</Label>
          <Input value={form.website} onChange={(e) => update('website', e.target.value)} className="border-[#2d3d54] bg-[#081522] text-white" placeholder="https://yourbusiness.com.au" />
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-gray-400">What do you want help with? *</Label>
          <Textarea required value={form.service_needed} onChange={(e) => update('service_needed', e.target.value)} className="min-h-28 border-[#2d3d54] bg-[#081522] text-white" placeholder="Missed calls, lead capture, bookings, CRM updates..." />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-400">Current call/enquiry problem *</Label>
          <Textarea required value={form.current_call_handling} onChange={(e) => update('current_call_handling', e.target.value)} className="min-h-28 border-[#2d3d54] bg-[#081522] text-white" placeholder="Tell us what happens now when calls or enquiries come in." />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <Label className="text-gray-400">Monthly enquiry volume optional</Label>
        <Select value={form.monthly_enquiry_volume} onValueChange={(value) => update('monthly_enquiry_volume', value)}>
          <SelectTrigger className="border-[#2d3d54] bg-[#081522] text-white"><SelectValue placeholder="Select volume" /></SelectTrigger>
          <SelectContent>{volumes.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <button type="submit" className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-[#347cff] bg-[#0b4dbb] px-8 py-3.5 font-semibold text-white transition hover:bg-[#0a45aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7faaff]">
        Review Details
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
