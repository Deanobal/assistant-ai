import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  { value: '0_20', label: '0â€“20 per month' },
  { value: '21_100', label: '21â€“100 per month' },
  { value: '101_300', label: '101â€“300 per month' },
  { value: '301_plus', label: '301+ per month' },
];

export default function LeadForm({
  submitLabel = 'Request a Call Back',
  successTitle = 'Enquiry Received',
  successText = 'Thanks â€” your enquiry has been received. Weâ€™ll review your details and get back to you with the next step within one business day.',
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
    website: '',
    email: '',
    mobile_number: '',
    industry: '',
    enquiry_type: '',
    monthly_enquiry_volume: '',
    message: '',
    preferred_meeting_date: '',
    preferred_meeting_time: '',
  });
  const navigate = useNavigate();
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
      if (result?.redirectTo) {
        window.location.href = result.redirectTo;
        return;
      }
      const formType = bookingIntent ? 'strategy_call_form' : 'contact_form';
      const strategyCallBooked = result?.booking_status === 'confirmed' || !!result?.confirmed_start;
      trackLeadSuccess({
        lead,
        form,
        formType,
        strategyCallRequested: bookingIntent,
        strategyCallBooked,
      });
      const shouldUseThankYouRedirect = !onSubmitted && !successActionHref && !successSecondaryActionHref && !successTertiaryActionHref && !successEmbedUrl;
      if (shouldUseThankYouRedirect) {
        navigate(`/thank-you?form=${encodeURIComponent(formType)}&lead=${encodeURIComponent(lead?.id || '')}&email=${encodeURIComponent(form?.email || '')}&phone=${encodeURIComponent(form?.mobile_number || '')}`);
        return;
      }
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
          <div className="mx-auto mt-8 max-w-2xl space-y-3 rounded-[16px] border border-[#29405f] bg-[#081727] p-6 text-left">
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
            <p className="text-sm text-gray-300">What happens next: weâ€™ll send reminder details before the meeting and prepare for the strategy call using the information you submitted.</p>
          </div>
        )}

        {primaryActionHref && primaryActionLabel && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a href={primaryActionHref} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-[#347cff] bg-[#0b4dbb] px-8 py-3.5 font-medium text-white transition hover:bg-[#0a45aa]">
              {primaryActionLabel}
              <ArrowRight className="w-4 h-4" />
            </a>
            {successSecondaryActionHref && successSecondaryActionLabel && (
              <Link to={successSecondaryActionHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-[#425067] bg-[#081522] px-8 py-3.5 font-medium text-white transition hover:border-[#66748a] hover:bg-[#0a1725]">
                {successSecondaryActionLabel}
              </Link>
            )}
            {successTertiaryActionHref && successTertiaryActionLabel && (
              <Link to={successTertiaryActionHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-[#425067] bg-transparent px-8 py-3.5 font-medium text-gray-300 transition hover:bg-[#0a1725]">
                {successTertiaryActionLabel}
              </Link>
            )}
          </div>
        )}

        {!primaryActionHref && (successSecondaryActionHref || successTertiaryActionHref) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {successSecondaryActionHref && successSecondaryActionLabel && (
              <Link to={successSecondaryActionHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-[#347cff] bg-[#0b4dbb] px-8 py-3.5 font-medium text-white transition hover:bg-[#0a45aa]">
                {successSecondaryActionLabel}
              </Link>
            )}
            {successTertiaryActionHref && successTertiaryActionLabel && (
              <Link to={successTertiaryActionHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-[#425067] bg-[#081522] px-8 py-3.5 font-medium text-white transition hover:border-[#66748a] hover:bg-[#0a1725]">
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
          <Label className="text-gray-400 text-sm">Website</Label>
          <Input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
            placeholder="https://yourbusiness.com.au"
          />
        </div>
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
              type="text"
              inputMode="numeric"
              value={form.preferred_meeting_date}
              onChange={(e) => setForm({ ...form, preferred_meeting_date: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
              placeholder="dd/mm/yyyy"
            />
            <p className="text-xs text-gray-500">Preferred date, Australian nyßMí¢G§²ÚîÆ­yÜİ\[™İÈ]X[YšXØ][Û‹›İ][™È[™›ÛİË]\ÛÛ›™Xİ‰Ëˆ™Yˆ	ËĞ›ÙËİÚ]Z\[œËXY\‹]KXØ[	ËˆKˆÂˆXÛÛˆØ]YÙKˆ]Nˆ	ĞRH™XÙ\[Ûš\İ“ÒHİZYIËˆ\ØÜš\[Ûˆ	ĞHÜ›İ[™Yœ˜[Y]ÛÜšÈ\Ú[™È[œ]Z\H›Û[YK™\ÜÛœÙH[YKYZ[ˆY™›Ü[™ÛÛ™\œÚ[Ûˆ\Üİ[\[ÛœË‰Ëˆ™Yˆ	ËĞ›ÙËÛYX\İ\š[™Ë\›ÚK[Ù‹XZK\™XÙ\[Ûš\İÉËˆK—NÂ‚™^ÜY˜][[˜İ[Ûˆ™\Ûİ\˜Ù\Ê
HÂˆ™]\›ˆ
ˆ‚ˆÑSÂˆ]OHRH™XÙ\[Ûš\İ™\Ûİ\˜Ù\È›Üˆ]\İ˜[X[ˆÙ\šXÙH\Ú[™\ÜÙ\È\ÜÚ\İ[RH‚ˆ\ØÜš\[ÛH”˜XİXØ[İZY\È›Üˆ]\İ˜[X[ˆÙ\šXÙH\Ú[™\ÜÙ\È]˜[X][™ÈRH™XÙ\[Û‹Z\ÜÙYXØ[]]ÛX][Û‹›ÛÚÚ[™È[™›ÛİË]\ˆ‚ˆØ[›ÛšXØ[]H‹Ô™\Ûİ\˜Ù\È‚ˆÏ‚ˆYÙTÚ[‚ˆYÙR\›Âˆ]O^Ï”˜XİXØ[RH™XÙ\[ÛˆİZY\ËXØÙ[^Ú]İ]H\KĞXØÙ[^ÏŸBˆ\ØÜš\[ÛH•\ÙH\ÙH™\Ûİ\˜Ù\ÈÈÛÛ\\™H›İšY\œË[™\œİ[™ÛÜšÙ›İÈ\ÚYÛˆ[™\ÜÙ\ÜÈH™X[Ü\˜][Û˜[˜[YHÙˆ˜\İ\ˆØ[[™[™È[™›ÛİË]\ˆ‚ˆÙXÛÛ™\UÏH‹Ğ›ÙÈ‚ˆÙXÛÛ™\SX™[Hœ›İÜÙHH›ÙÈ‚ˆÏ‚‚ˆÙXİ[ÛˆYHœYÙKXÛÛ[ˆÛ\ÜÓ˜[YOH˜™ËVÈÌŒMH‚ˆÙXİ[Û’XY[™Âˆ]OH”İ\Ú]HXÚ\Ú[Ûˆ[İH™YYÈXZÙH‚ˆ\ØÜš\[ÛH‘XXÚİZYH\È\ÚYÛ™YÈ[[İH]˜[X]HH™X[\Ú[™\ÜÈ]Y\İ[Û‹›İÚ\ÙHH˜YİYH]]ÛX][Ûˆ™[™ˆ‚ˆÏ‚ˆ]ˆÛ\ÜÓ˜[YOH›]LLÜšYØ\\İ™\™›İËZY[ˆ›İ[™YVÌMœH›Ü™\ˆ›Ü™\‹VÈÌŒÍH™ËVÈÌŒÍHY™ÜšYXÛÛËLˆ‚ˆÜ™\Ûİ\˜Ù\Ë›X\

ÈXÛÛˆXÛÛ‹]K\ØÜš\[Û‹™YˆJHOˆ
ˆ[šÈÙ^O^İ]_HÏ^Ú™YŸHÛ\ÜÓ˜[YOH™Ü›İ\™ËVÈÌÌLŒY—HMˆ˜[œÚ][Ûˆİ™\˜™ËVÈÌLN×HÛNœN‚ˆXÛÛˆÛ\ÜÓ˜[YOHšMˆËMˆ^VÈÍÙ™—Hˆ\šXKZY[HYHˆÏ‚ˆˆÛ\ÜÓ˜[YOH›]MˆX^]Ë[Y^^›Û\Ù[ZX›Û^]Ú]HÜ›İ\Zİ™\^VÈÙ™MÙ™—Hİ]_OÚ‚ˆÛ\ÜÓ˜[YOH›]LÈX^]Ë^^\ÛHXY[™ËMÈ^VÈØXXÌ×HÙ\ØÜš\[ÛŸOÜ‚ˆÜ[ˆÛ\ÜÓ˜[YOH›]Mˆ[›[™KY›^][\ËXÙ[\ˆØ\Lˆ^\ÛH›Û\Ù[ZX›Û^VÈÍÍ˜MÙ™—H‚ˆ™XYHİZYBˆ\œ›İÔšYÚÛ\ÜÓ˜[YOHšMËM˜[œÚ][ÛˆÜ›İ\Zİ™\˜[œÛ]K^LHˆ\šXKZY[HYHˆÏ‚ˆÜÜ[‚ˆÓ[šÏ‚ˆ
J_BˆÙ]‚ˆ]ˆÛ\ÜÓ˜[YOH›]N‚ˆ[šÈÏH‹Ğ›ÙÈˆÛ\ÜÓ˜[YO^Ü™[Z][P]Û”ÙXÛÛ™\_O‚ˆšY]È[\XÛ\Âˆ\œ›İÔšYÚÛ\ÜÓ˜[YOHšMËMˆ\šXKZY[HYHˆÏ‚ˆÓ[šÏ‚ˆÙ]‚ˆÔÙXİ[Û‚‚ˆYÚ[[[šÜÈÏ‚ˆÛÛ™\œÚ[ÛÕBˆ]OH“™YY[ˆ[œİÙ\ˆ›Üˆ[İ\ˆÜXÚYšXÈØ[›İÏÈ‚ˆ\ØÜš\[ÛH•[È›İYÚ[İ\ˆİ\œ™[›ØÙ\ÜÈ[™ÙYHÚ\™H[ˆRH™XÙ\[Ûš\İØ[ˆÜ™X]HHÛX\™\İÜ\˜][Û˜[[\›İ™[Y[ˆ‚ˆš[X\UÏH‹Ğ›ÛÚÔİ˜]YŞPØ[‚ˆš[X\SX™[H›ÛÚÈHİ˜]YŞHØ[‚ˆÏ‚ˆÔYÙTÚ[‚ˆÏ‚ˆ
NÂŸB