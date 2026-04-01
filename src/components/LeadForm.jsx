import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import BookingEmbedCard from '@/components/contact/BookingEmbedCard';
import { submitLeadCapture } from '@/lib/leadCapture';
import { trackLeadSuccess } from '@/lib/leadTracking';

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

const helpOptions = [
  { value: 'lead_capture', label: 'Lead capture' },
  { value: 'booking_automation', label: 'Booking automation' },
  { value: 'integrations', label: 'Integrations' },
  { value: 'call_handling', label: 'Call handling' },
  { value: 'support', label: 'Support' },
  { value: 'other', label: 'Something else' },
];

const volumeOptions = [
  { value: '0_20', label: '0–20 per month' },
  { value: '21_100', label: '21–100 per month' },
  { value: '101_300', label: '101–300 per month' },
  { value: '301_plus', label: '301+ per month' },
];

export default function LeadForm({
  submitLabel = 'Request a Call Back',
  successTitle = 'Enquiry Received',
  successText = 'Thanks — your enquiry has been received. We’ll review your details and get back to you with the next step within one business day.',
  matchedLeadStatus,
  createStatus,
  nextActionText,
  bookingIntent = false,
  bookingSource = '',
  enquiryTypeOverride,
  showPreferredMeetingFields = false,
  successActionHref,
  successActionLabel,
  successSecondaryActionHref,
  successSecondaryActionLabel,
  successTertiaryActionHref,
  successTertiaryActionLabel,
  successEmbedUrl,
  successEmbedLabel,
  onSubmitted,
  isSubmitDisabled = false,
  disabledNotice,
}) {
  const [form, setForm] = useState({
    full_name: '',
    business_name: '',
    email: '',
    mobile_number: '',
    industry: '',
    enquiry_type: '',
    monthly_enquiry_volume: '',
    message: '',
    preferred_meeting_date: '',
    preferred_meeting_time: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitResult, setSubmitResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const lead = await submitLeadCapture(form, {
        matchedLeadStatus,
        createStatus,
        nextActionText,
        bookingIntent,
        bookingSource,
        enquiryTypeOverride,
      });
      let result = null;
      if (onSubmitted) {
        result = await onSubmitted({ lead, form });
        setSubmitResult(result || null);
      }
      trackLeadSuccess({
        lead,
        form,
        formType: bookingIntent ? 'strategy_call_form' : 'contact_form',
        strategyCallRequested: bookingIntent,
        strategyCallBooked: result?.booking_status === 'confirmed' || !!result?.confirmed_start,
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Lead submission failed', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Something went wrong while sending your enquiry.';
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const primaryActionHref = submitResult?.checkout_url || successActionHref;
    const primaryActionLabel = submitResult?.actionLabel || successActionLabel;
    const confirmedStart = submitResult?.confirmed_start ? new Date(submitResult.confirmed_start) : null;
    const hasConfirmedBooking = submitResult?.booking_status === 'confirmed' || !!submitResult?.confirmed_start;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-16"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{submitResult?.title || successTitle}</h3>
          <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">{submitResult?.message || successText}</p>
        </div>

        {hasConfirmedBooking && (
          <div className="mt-8 max-w-2xl mx-auto rounded-[28px] border border-cyan-500/20 bg-cyan-500/5 p-6 text-left space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Confirmed Booking</p>
            {confirmedStart && (
              <div>
                <p className="text-sm text-gray-400">Confirmed date and time</p>
                <p className="text-white font-medium mt-1">{confirmedStart.toLocaleString()}</p>
              </div>
            )}
            {submitResult?.provider && (
              <div>
                <p className="text-sm text-gray-400">Booking provider</p>
                <p className="text-white font-medium mt-1">{submitResult.provider}</p>
              </div>
            )}
            <p className="text-sm text-gray-300">What happens next: we’ll send reminder details before the meeting and prepare for the strategy call using the information you submitted.</p>
          </div>
        )}

        {primaryActionHref && primaryActionLabel && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a href={primaryActionHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
              {primaryActionLabel}
              <ArrowRight className="w-4 h-4" />
            </a>
            {successSecondaryActionHref && successSecondaryActionLabel && (
              <Link to={successSecondaryActionHref} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/10 bg-white/[0.03] text-white font-medium rounded-full hover:bg-white/[0.05] transition-all">
                {successSecondaryActionLabel}
              </Link>
            )}
            {successTertiaryActionHref && successTertiaryActionLabel && (
              <Link to={successTertiaryActionHref} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/10 bg-transparent text-gray-300 font-medium rounded-full hover:bg-white/[0.03] transition-all">
                {successTertiaryActionLabel}
              </Link>
            )}
          </div>
        )}

        {!primaryActionHref && (successSecondaryActionHref || successTertiaryActionHref) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {successSecondaryActionHref && successSecondaryActionLabel && (
              <Link to={successSecondaryActionHref} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                {successSecondaryActionLabel}
              </Link>
            )}
            {successTertiaryActionHref && successTertiaryActionLabel && (
              <Link to={successTertiaryActionHref} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/10 bg-white/[0.03] text-white font-medium rounded-full hover:bg-white/[0.05] transition-all">
                {successTertiaryActionLabel}
              </Link>
            )}
          </div>
        )}

        {(submitResult?.embed_url || successEmbedUrl) && (
          <BookingEmbedCard embedUrl={submitResult?.embed_url || successEmbedUrl} title={submitResult?.embed_label || successEmbedLabel || 'Live Booking Widget'} />
        )}
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-gray-400 text-sm">Full Name *</Label>
          <Input
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
            placeholder="John Smith"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-400 text-sm">Business Name</Label>
          <Input
            value={form.business_name}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
            placeholder="Smith's Plumbing"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-gray-400 text-sm">Email *</Label>
          <Input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
            placeholder="john@business.com.au"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-400 text-sm">Mobile Number</Label>
          <Input
            type="tel"
            value={form.mobile_number}
            onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
            placeholder="+61 4XX XXX XXX"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-gray-400 text-sm">Industry</Label>
          <Select value={form.industry} onValueChange={(value) => setForm({ ...form, industry: value })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>{industry.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-400 text-sm">What do you need help with?</Label>
          <Select value={form.enquiry_type} onValueChange={(value) => setForm({ ...form, enquiry_type: value })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20">
              <SelectValue placeholder="Choose one" />
            </SelectTrigger>
            <SelectContent>
              {helpOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-400 text-sm">Estimated Monthly Enquiry Volume</Label>
        <Select value={form.monthly_enquiry_volume} onValueChange={(value) => setForm({ ...form, monthly_enquiry_volume: value })}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20">
            <SelectValue placeholder="Select volume" />
          </SelectTrigger>
          <SelectContent>
            {volumeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showPreferredMeetingFields && (
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-gray-400 text-sm">Preferred Meeting Date</Label>
            <Input
              type="date"
              value={form.preferred_meeting_date}
              onChange={(e) => setForm({ ...form, preferred_meeting_date: e.target.value })}
              className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-400 text-sm">Preferred Meeting Time</Label>
            <Input
              type="time"
              value={form.preferred_meeting_time}
              onChange={(e) => setForm({ ...form, preferred_meeting_time: e.target.value })}
              className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-gray-400 text-sm">Message</Label>
        <Textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 min-h-28"
          placeholder="Tell us about your workflow, what needs fixing, or what you want AssistantAI to help with."
        />
      </div>

      {submitError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {submitError}
        </div>
      )}

      {disabledNotice && isSubmitDisabled && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-300">
          {disabledNotice}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || isSubmitDisabled}
        className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {submitLabel}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}