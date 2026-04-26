import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import LeadForm from '@/components/LeadForm';
import BookingSupportPanel from '@/components/contact/BookingSupportPanel';
import StrategyCallAvailability from '@/components/contact/StrategyCallAvailability';
import {
  STRATEGY_CALL_BOOKING_PROVIDER,
  STRATEGY_CALL_BOOKING_URL,
  STRATEGY_CALL_BOOKING_EMBED_URL,
  STRATEGY_CALL_BOOKING_MODE,
} from '@/lib/booking';

export default function BookStrategyCall() {
  const [showAdminWarning, setShowAdminWarning] = useState(false);
  const [calendarAvailability, setCalendarAvailability] = useState({ isLive: false, hasSlots: false, error: '' });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const hasConfiguredExternalBooking = STRATEGY_CALL_BOOKING_MODE !== 'request';
  const hasGoogleCalendarLive = calendarAvailability.isLive && calendarAvailability.hasSlots;
  const hasLiveBooking = hasGoogleCalendarLive || hasConfiguredExternalBooking;
  const isEmbeddedBooking = !hasGoogleCalendarLive && STRATEGY_CALL_BOOKING_MODE === 'embed';
  const providerLabel = hasGoogleCalendarLive ? 'Google Calendar' : STRATEGY_CALL_BOOKING_PROVIDER || 'Live Calendar';

  useEffect(() => {
    const checkAdmin = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) return;
      const user = await base44.auth.me();
      setShowAdminWarning(user?.role === 'admin' && !hasLiveBooking);
    };

    checkAdmin();
  }, [hasLiveBooking]);

  return (
    <div>
      <section className="relative py-24 md:py-28 bg-grid">
        <div className="bg-radial-glow absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <p className="text-cyan-400 mb-3 text-base font-medium">{hasLiveBooking ? 'LIVE STRATEGY CALL BOOKING' : 'STRATEGY CALL REQUEST'}</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              {hasLiveBooking ? 'Pick a Live Strategy Call Slot' : 'Request Your Free Strategy Call'}
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              {hasGoogleCalendarLive
                ? 'Choose a live 60-minute slot from Google Calendar, then submit your details to book it instantly.'
                : hasLiveBooking
                  ? 'Tell us about your business first, then continue into the live booking flow to choose an available strategy call time.'
                  : 'Tell us about your business and request a strategy call. We’ll review your details and send the best next step.'}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3 p-8 md:p-10 rounded-[28px] border border-white/5 bg-[#12121a]"
            >
              <StrategyCallAvailability
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                onAvailabilityStateChange={setCalendarAvailability}
              />

              <LeadForm
                submitLabel={hasGoogleCalendarLive ? 'Book 60-Minute Strategy Call' : hasLiveBooking ? 'Save Details and Continue' : 'Request Free Strategy Call'}
                successTitle={hasGoogleCalendarLive ? 'Strategy Call Confirmed' : isEmbeddedBooking ? 'Details Saved — Continue to Booking' : hasLiveBooking ? 'Details Saved — Continue to Booking' : 'Strategy Call Request Received'}
                successText={hasGoogleCalendarLive
                  ? 'Your strategy call is confirmed. We’ve added the booking details below and will send reminder information before the meeting.'
                  : isEmbeddedBooking
                    ? 'Your details have been saved. The next step is to choose a suitable time in the live booking widget below.'
                    : hasLiveBooking
                      ? 'Your details have been saved. The next step is to choose a suitable time in the live booking page.'
                      : 'Thanks — your strategy call request has been received. Our team will contact you shortly to confirm a suitable time.'}
                matchedLeadStatus="Contacted"
                createStatus="New Lead"
                nextActionText={hasGoogleCalendarLive
                  ? 'Lead selected a live Google Calendar slot and booking is being created.'
                  : hasLiveBooking
                    ? 'Lead requested a strategy call and still needs external booking confirmation.'
                    : 'Follow up on strategy call request and send booking next step.'}
                bookingIntent={true}
                bookingSource="strategy_call_page"
                enquiryTypeOverride="other"
                showPreferredMeetingFields={!hasLiveBooking}
                successActionHref={!hasGoogleCalendarLive ? STRATEGY_CALL_BOOKING_URL || undefined : undefined}
                successActionLabel={!hasGoogleCalendarLive && STRATEGY_CALL_BOOKING_URL ? `Open ${providerLabel}` : undefined}
                successEmbedUrl={!hasGoogleCalendarLive && isEmbeddedBooking ? STRATEGY_CALL_BOOKING_EMBED_URL : undefined}
                successEmbedLabel={`${providerLabel} booking widget`}
                isSubmitDisabled={hasGoogleCalendarLive && !selectedSlot}
                disabledNotice={hasGoogleCalendarLive ? 'Select one of the live 60-minute Google Calendar slots above before booking.' : undefined}
                successSecondaryActionHref="/"
                successSecondaryActionLabel="Back to Home"
                successTertiaryActionHref="/Contact"
                successTertiaryActionLabel="Contact Our Team"
                onSubmitted={hasGoogleCalendarLive ? async ({ lead, form }) => {
                  const response = await base44.functions.invoke('createStrategyCallBooking', {
                    leadId: lead.id,
                    fullName: form.full_name,
                    businessName: form.business_name,
                    email: form.email,
                    message: form.message,
                    slotStart: selectedSlot.start,
                    slotEnd: selectedSlot.end,
                    timezone: 'UTC',
                  });
                  return response.data;
                } : undefined}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <BookingSupportPanel
                bookingUrl={hasGoogleCalendarLive ? 'googlecalendar-live' : STRATEGY_CALL_BOOKING_URL || STRATEGY_CALL_BOOKING_EMBED_URL}
                bookingMode={hasGoogleCalendarLive ? 'calendar' : STRATEGY_CALL_BOOKING_MODE}
                bookingProvider={providerLabel}
                adminWarning={showAdminWarning ? 'Admin warning: Google Calendar live booking is not available yet, so the page is staying in honest request mode.' : ''}
                intro={hasGoogleCalendarLive
                  ? 'Choose a live Google Calendar slot, then submit the short form to create the booking directly in your calendar.'
                  : hasLiveBooking
                    ? 'Complete the short form first so AssistantAI can save the lead properly before the live scheduling step continues.'
                    : 'Complete the short form to send a strategy call request. No live calendar is connected yet.'}
                responseText={hasGoogleCalendarLive
                  ? 'Calendar updates are monitored for follow-up actions, and reminder emails are sent before scheduled meetings.'
                  : hasLiveBooking
                    ? 'Live scheduling is available after the form step, but calendar confirmation still happens in the external booking tool.'
                    : 'We usually respond within one business day when a live calendar is not connected.'}
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}