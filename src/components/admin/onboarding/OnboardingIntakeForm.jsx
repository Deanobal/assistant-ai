import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import IntakeSectionCard from './IntakeSectionCard';

const industries = [['trades', 'Trades'], ['real_estate', 'Real Estate'], ['medical_clinic', 'Medical Clinic'], ['dental_clinic', 'Dental Clinic'], ['law_firm', 'Law Firm'], ['automotive', 'Automotive'], ['hospitality', 'Hospitality'], ['professional_services', 'Professional Services'], ['other', 'Other']];
const enquiryVolumes = [['0_20', '0–20'], ['21_100', '21–100'], ['101_300', '101–300'], ['301_plus', '301+']];

function Field({ label, children, className = '' }) {
  return <div className={`space-y-2 ${className}`}><Label className="text-gray-400">{label}</Label>{children}</div>;
}

export default function OnboardingIntakeForm({ value, client, onChange, onClientChange, onSave, isSaving, isReadOnly }) {
  const inputClass = 'bg-white/[0.03] border-white/10 text-white';

  return (
    <div className="space-y-6 pb-24">
      <IntakeSectionCard title="Section A — Basic Business Details" description="Core business context for rollout and AI setup.">
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Full Name"><Input value={client.full_name || ''} onChange={(e) => onClientChange('full_name', e.target.value)} className={inputClass} disabled={isReadOnly} /></Field>
          <Field label="Business Name"><Input value={value.business_name || ''} onChange={(e) => { onChange('business_name', e.target.value); onClientChange('business_name', e.target.value); }} className={inputClass} disabled={isReadOnly} /></Field>
          <Field label="Email"><Input value={value.email || ''} onChange={(e) => { onChange('email', e.target.value); onClientChange('email', e.target.value); }} className={inputClass} disabled={isReadOnly} /></Field>
          <Field label="Mobile Number"><Input value={client.mobile_number || ''} onChange={(e) => onClientChange('mobile_number', e.target.value)} className={inputClass} disabled={isReadOnly} /></Field>
          <Field label="Industry"><Select value={value.industry || ''} onValueChange={(next) => { onChange('industry', next); onClientChange('industry', next); }} disabled={isReadOnly}><SelectTrigger className={inputClass}><SelectValue placeholder="Select industry" /></SelectTrigger><SelectContent>{industries.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Website"><Input value={value.website || ''} onChange={(e) => { onChange('website', e.target.value); onClientChange('website', e.target.value); }} className={inputClass} disabled={isReadOnly} /></Field>
          <Field label="Main Service They Sell"><Input value={client.main_service || ''} onChange={(e) => onClientChange('main_service', e.target.value)} className={inputClass} disabled={isReadOnly} /></Field>
          <Field label="Monthly Enquiry / Call Volume"><Select value={client.monthly_enquiry_volume || ''} onValueChange={(next) => onClientChange('monthly_enquiry_volume', next)} disabled={isReadOnly}><SelectTrigger className={inputClass}><SelectValue placeholder="Select volume" /></SelectTrigger><SelectContent>{enquiryVolumes.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Service Areas / Suburbs" className="md:col-span-2"><Textarea value={value.service_areas || ''} onChange={(e) => onChange('service_areas', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
          <Field label="Biggest Problem Right Now" className="md:col-span-2"><Textarea value={client.biggest_problem || ''} onChange={(e) => onClientChange('biggest_problem', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
          <Field label="How They Currently Handle Missed Calls" className="md:col-span-2"><Textarea value={client.current_missed_call_handling || ''} onChange={(e) => onClientChange('current_missed_call_handling', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
          <Field label="What They Want the AI to Do First" className="md:col-span-2"><Textarea value={client.ai_first_goal || ''} onChange={(e) => onClientChange('ai_first_goal', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
        </div>
      </IntakeSectionCard>

      <IntakeSectionCard title="Section B — Current Systems / Access" description="Current software stack and access requirements.">
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="CRM Used Now"><Input value={value.crm_used_now || ''} onChange={(e) => onChange('crm_used_now', e.target.value)} className={inputClass} disabled={isReadOnly} /></Field>
          <Field label="Calendar Used Now"><Input value={value.calendar_used_now || ''} onChange={(e) => onChange('calendar_used_now', e.target.value)} className={inputClass} disabled={isReadOnly} /></Field>
          <Field label="Messaging / SMS Tool"><Input value={value.messaging_sms_tool || ''} onChange={(e) => onChange('messaging_sms_tool', e.target.value)} className={inputClass} disabled={isReadOnly} /></Field>
          <Field label="Payment / Billing Method"><Input value={value.payment_billing_method || ''} onChange={(e) => onChange('payment_billing_method', e.target.value)} className={inputClass} disabled={isReadOnly} /></Field>
          <Field label="Main Business Phone Number"><Input value={value.main_business_phone || ''} onChange={(e) => onChange('main_business_phone', e.target.value)} className={inputClass} disabled={isReadOnly} /></Field>
          <Field label="Business Hours"><Textarea value={value.business_hours || ''} onChange={(e) => onChange('business_hours', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
        </div>
      </IntakeSectionCard>

      <IntakeSectionCard title="Section C — Call Handling Rules" description="Operational AI behaviour, booking logic, and escalation rules.">
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="After-Hours Rules"><Textarea value={value.after_hours_rules || ''} onChange={(e) => onChange('after_hours_rules', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
          <Field label="What Counts as a Hot Lead?"><Textarea value={value.hot_lead_definition || ''} onChange={(e) => onChange('hot_lead_definition', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
          <Field label="What Counts as an Urgent Job?"><Textarea value={value.urgent_job_definition || ''} onChange={(e) => onChange('urgent_job_definition', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
          <Field label="When Should the AI Escalate to a Human?"><Textarea value={value.escalation_rules || ''} onChange={(e) => onChange('escalation_rules', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
          <Field label="What Should the AI Never Say?"><Textarea value={value.ai_never_say_rules || ''} onChange={(e) => onChange('ai_never_say_rules', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
          <Field label="Can the AI Book Directly or Only Request a Booking?"><Textarea value={value.booking_rules || ''} onChange={(e) => onChange('booking_rules', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
          <Field label="What Info Must Always Be Captured Before Handoff?"><Textarea value={value.required_capture_before_handoff || ''} onChange={(e) => onChange('required_capture_before_handoff', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
          <Field label="Staff Members Who Should Receive Escalations"><Textarea value={value.escalation_contacts || ''} onChange={(e) => onChange('escalation_contacts', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
        </div>
      </IntakeSectionCard>

      <IntakeSectionCard title="Section D — Assets / Knowledge" description="Knowledge sources and business assets required for build quality.">
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Existing Scripts"><Textarea value={value.scripts_assets || ''} onChange={(e) => onChange('scripts_assets', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
          <Field label="FAQ List"><Textarea value={value.faq_list || ''} onChange={(e) => onChange('faq_list', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
          <Field label="Pricing Guidance"><Textarea value={value.pricing_guidance || ''} onChange={(e) => onChange('pricing_guidance', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
          <Field label="Objection Handling"><Textarea value={value.objection_handling || ''} onChange={(e) => onChange('objection_handling', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
        </div>
      </IntakeSectionCard>

      <IntakeSectionCard title="Section E — Compliance / Risk" description="Sensitive data boundaries and approval settings.">
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Any legal / medical / sensitive data limits" className="md:col-span-2"><Textarea value={value.sensitive_data_limits || ''} onChange={(e) => onChange('sensitive_data_limits', e.target.value)} className={`${inputClass} min-h-[100px]`} disabled={isReadOnly} /></Field>
          <Field label="Are recordings allowed?"><Select value={String(value.recordings_allowed ?? '')} onValueChange={(next) => onChange('recordings_allowed', next === 'true')} disabled={isReadOnly}><SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem></SelectContent></Select></Field>
          <Field label="Is SMS follow-up approved?"><Select value={String(value.sms_followup_approved ?? '')} onValueChange={(next) => onChange('sms_followup_approved', next === 'true')} disabled={isReadOnly}><SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem></SelectContent></Select></Field>
          <Field label="Is outbound calling approved?"><Select value={String(value.outbound_calling_approved ?? '')} onValueChange={(next) => onChange('outbound_calling_approved', next === 'true')} disabled={isReadOnly}><SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem></SelectContent></Select></Field>
          <Field label="Who approves final scripts and workflows?"><Input value={value.final_approver || ''} onChange={(e) => onChange('final_approver', e.target.value)} className={inputClass} disabled={isReadOnly} /></Field>
        </div>
      </IntakeSectionCard>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button onClick={onSave} disabled={isSaving || isReadOnly} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-2xl disabled:opacity-50">
          {isReadOnly ? 'Onboarding Archived' : isSaving ? 'Saving…' : 'Save Intake'}
        </Button>
      </div>
    </div>
  );
}