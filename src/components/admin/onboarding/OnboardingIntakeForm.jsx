import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload } from 'lucide-react';

const industries = [
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

const toneOptions = ['Professional', 'Friendly', 'Warm', 'Direct', 'Premium'];

function Field({ label, children, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-gray-400">{label}</Label>
      {children}
    </div>
  );
}

export default function OnboardingIntakeForm({ value, onChange, onSave, isSaving }) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadLogo = async (file) => {
    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange('logo_upload', file_url);
    setIsUploading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 grid md:grid-cols-2 gap-5">
          <Field label="Business Name">
            <Input value={value.client_name || ''} onChange={(e) => onChange('client_name', e.target.value)} className="bg-white/[0.03] border-white/10 text-white" />
          </Field>
          <Field label="Contact Name">
            <Input value={value.contact_name || ''} onChange={(e) => onChange('contact_name', e.target.value)} className="bg-white/[0.03] border-white/10 text-white" />
          </Field>
          <Field label="Contact Email">
            <Input value={value.email || ''} onChange={(e) => onChange('email', e.target.value)} className="bg-white/[0.03] border-white/10 text-white" />
          </Field>
          <Field label="Contact Mobile">
            <Input value={value.mobile || ''} onChange={(e) => onChange('mobile', e.target.value)} className="bg-white/[0.03] border-white/10 text-white" />
          </Field>
          <Field label="Industry">
            <Select value={value.industry || ''} onValueChange={(next) => onChange('industry', next)}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>
                {industries.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Email Domain">
            <Input value={value.email_domain || ''} onChange={(e) => onChange('email_domain', e.target.value)} placeholder="business.com.au" className="bg-white/[0.03] border-white/10 text-white" />
          </Field>
          <Field label="Logo Upload" className="md:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} className="bg-transparent border-white/10 text-white file:text-white" />
              <div className="flex items-center gap-3 text-sm text-gray-400">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <Upload className="w-4 h-4 text-cyan-400" />}
                <span>{value.logo_upload ? 'Logo uploaded successfully' : 'Upload the client logo for portal and onboarding use'}</span>
              </div>
              {value.logo_upload && <img src={value.logo_upload} alt="Client logo" className="h-16 w-auto rounded-lg border border-white/10 bg-black/20 p-2" />}
            </div>
          </Field>
        </CardContent>
      </Card>

      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 grid md:grid-cols-2 gap-5">
          <Field label="Services Offered" className="md:col-span-2">
            <Textarea value={value.services_offered || ''} onChange={(e) => onChange('services_offered', e.target.value)} className="bg-white/[0.03] border-white/10 text-white min-h-[100px]" />
          </Field>
          <Field label="Service Areas">
            <Textarea value={value.service_areas || ''} onChange={(e) => onChange('service_areas', e.target.value)} className="bg-white/[0.03] border-white/10 text-white min-h-[100px]" />
          </Field>
          <Field label="Operating Hours">
            <Textarea value={value.operating_hours || ''} onChange={(e) => onChange('operating_hours', e.target.value)} className="bg-white/[0.03] border-white/10 text-white min-h-[100px]" />
          </Field>
          <Field label="Booking Rules">
            <Textarea value={value.booking_rules || ''} onChange={(e) => onChange('booking_rules', e.target.value)} className="bg-white/[0.03] border-white/10 text-white min-h-[100px]" />
          </Field>
          <Field label="Common FAQs">
            <Textarea value={value.common_faqs || ''} onChange={(e) => onChange('common_faqs', e.target.value)} className="bg-white/[0.03] border-white/10 text-white min-h-[100px]" />
          </Field>
          <Field label="Emergency Calls Yes/No">
            <Select value={String(value.emergency_calls ?? '')} onValueChange={(next) => onChange('emergency_calls', next === 'true')}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue placeholder="Select one" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Preferred Tone of Voice">
            <Select value={value.preferred_tone_of_voice || ''} onValueChange={(next) => onChange('preferred_tone_of_voice', next)}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue placeholder="Select tone" /></SelectTrigger>
              <SelectContent>
                {toneOptions.map((tone) => <SelectItem key={tone} value={tone}>{tone}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Escalation Contact Numbers" className="md:col-span-2">
            <Textarea value={value.escalation_contact_numbers || ''} onChange={(e) => onChange('escalation_contact_numbers', e.target.value)} className="bg-white/[0.03] border-white/10 text-white min-h-[100px]" />
          </Field>
        </CardContent>
      </Card>

      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 grid md:grid-cols-2 gap-5">
          <Field label="CRM Used">
            <Input value={value.crm_used || ''} onChange={(e) => onChange('crm_used', e.target.value)} className="bg-white/[0.03] border-white/10 text-white" />
          </Field>
          <Field label="Calendar Used">
            <Input value={value.calendar_used || ''} onChange={(e) => onChange('calendar_used', e.target.value)} className="bg-white/[0.03] border-white/10 text-white" />
          </Field>
          <Field label="SMS System Used">
            <Input value={value.sms_system_used || ''} onChange={(e) => onChange('sms_system_used', e.target.value)} className="bg-white/[0.03] border-white/10 text-white" />
          </Field>
          <Field label="Additional Notes" className="md:col-span-2">
            <Textarea value={value.additional_notes || ''} onChange={(e) => onChange('additional_notes', e.target.value)} className="bg-white/[0.03] border-white/10 text-white min-h-[120px]" />
          </Field>
          <Field label="Internal Onboarding Notes" className="md:col-span-2">
            <Textarea value={value.onboarding_notes || ''} onChange={(e) => onChange('onboarding_notes', e.target.value)} className="bg-white/[0.03] border-white/10 text-white min-h-[120px]" />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isSaving || isUploading} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50">
          {isSaving ? 'Saving…' : 'Save Intake Form'}
        </Button>
      </div>
    </div>
  );
}