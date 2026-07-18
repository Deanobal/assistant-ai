import { useState } from 'react';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const helpOptions = [
  { value: 'missed_calls', label: 'Missed calls' },
  { value: 'ai_receptionist', label: 'AI receptionist' },
  { value: 'bookings', label: 'Bookings' },
  { value: 'crm_followup', label: 'CRM / follow-up automation' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'enterprise_custom', label: 'Enterprise / custom setup' },
  { value: 'other', label: 'Other' },
];

async function submitToSupabaseApi(payload) {
  const response = await fetch('/api/contact-submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || data?.details || 'We could not submit your message right now. Please try again or email sales@assistantai.com.au.');
  }
  return data;
}

export default function ContactForm() {
  const [form, setForm] = useState({
    full_name: '',
    business_name: '',
    email: '',
    mobile_number: '',
    enquiry_type: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      full_name: form.full_name,
      business_name: form.business_name,
      email: form.email,
      mobile_number: form.mobile_number,
      enquiry_type: form.enquiry_type || 'contact_form',
      service_needed: form.enquiry_type || 'general_enquiry',
      message: form.message,
      lead_source: 'website',
      source_page: '/Contact',
      buyer_intent: form.enquiry_type === 'pricing' ? 'pricing_interest' : 'researching',
    };

    try {
      await submitToSupabaseApi(payload);
      setSuccess(true);
    } catch (submitError) {
      setError(submitError?.message || 'Something went wrong. Please try again or email sales@assistantai.com.au.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-400/5 p-8 text-center">
        <CheckCircle className="mx-auto mb-4 h-10 w-10 text-cyan-300" />
        <h2 className="text-2xl font-bold text-white">Thanks — we’ve received your message.</h2>
        <p className="mt-3 text-gray-300">We’ll contact you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/8 bg-[#12121a] p-6 text-left md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-gray-300">Full Name *</Label>
          <Input required value={form.full_name} onChange={(event) => update('full_name', event.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="John Smith" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Business Name</Label>
          <Input value={form.business_name} onChange={(event) => update('business_name', event.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="Your business" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Email *</Label>
          <Input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="you@business.com.au" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Mobile Number</Label>
          <Input type="tel" value={form.mobile_number} onChange={(event) => update('mobile_number', event.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="+61 4XX XXX XXX" />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <Label className="text-gray-300">What do you need help with?</Label>
        <Select value={form.enquiry_type} onValueChange={(value) => update('enquiry_type', value)}>
          <SelectTrigger className="border-white/10 bg-white/5 text-white"><SelectValue placeholder="Choose one" /></SelectTrigger>
          <SelectContent>{helpOptions.map((option) => <SelectItem key={option.label} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="mt-5 space-y-2">
        <Label className="text-gray-300">Message *</Label>
        <Textarea required value={form.message} onChange={(event) => update('message', event.target.value)} className="min-h-32 border-white/10 bg-white/5 text-white" placeholder="Tell us what you want AssistantAI to help with." />
      </div>

      {error && <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      <button type="submit" disabled={submitting} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 font-semibold text-white disabled:opacity-60">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send Message <ArrowRight className="h-4 w-4" /></>}
      </button>
    </form>
  );
}
