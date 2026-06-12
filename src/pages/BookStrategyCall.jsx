import { useState } from 'react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
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

const ASSISTANTAI_SALES_CALENDAR_ID = 'sales@assistantai.com.au';

export default function BookStrategyCall() {
  const [calendarAvailability, setCalendarAvailability] = useState({ isLive: false, hasSlots: false, error: '' });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const hasConfiguredExternalBooking = STRATEGY_CALL_BOOKING_MODE !== 'request';
  const hasGoogleCalendarLive = calendarAvailability.isLive && calendarAvailability.hasSlots;
  const hasLiveBooking = hasGoogleCalendarLive || hasConfiguredExternalBooking;
  const isEmbeddedBooking = !hasGoogleCalendarLive && STRATEGY_CALL_BOOKING_MODE === 'embed';
  const providerLabel = hasGoogleCalendarLive ? 'Google Calendar' : STRATEGY_CALL_BOOKING_PROVIDER || 'Live Calendar';

  return (
    <>
      <SEO
        title="Book a Strategy Call | AssistantAI"
        description="Request a strategy call with AssistantAI to map the right AI receptionist, lead capture, booking, CRM follow-up, and automation setup for your business."
        canonicalPath="/BookStrategyCall"
      />
      <div>
        <section className="relative py-24 md:py-28 bg-grid">
          <div className="bg-radial-glow absolute inset-0" />
          <div className="relative max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-14"
            >
              <p className="text-cyan-400 mb-3 text-base font-medium">STRATEGY CALL</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
                Request a Strategy Call
              </h1>
              <p className="mt-5 text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
                Tell us what you want to improve and we’ll help map the right AssistantAI setup for your business.
              </p>
              {!hasLiveBooking && (
                <p className="mx-auto mt-4 max-w-2xl rounded-2xl border border-cyan-400/15 bg-cyan-400/5 px-4 py-3 text-sm text-cyan-100">
                  Submit your details and we’ll contact you to confirm the best time.
                </p>
              )}
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
                  submitLabel={hasGoogleCalendarLive ? 'Book 60-Minute Strategy Call' : hasLiveBooking ? 'Save Details and Continue' : 'Request Strategy Call'}
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
                    ? 'Lead selected a strategy call slot and booking is being created.'
                    : hasLiveBooking
                      ? 'Lead requested a strategy call and needs booking confirmation.'
                      : 'Contact lead to confirm the best strategy call time.'}
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
                      timezone: 'Australia/Melbourne',
                      calendarId: ASSISTANTAI_SALES_CALENDAR_ID,
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
                  intro={hasGoogleCalendarLive
                    ? 'Choose a suitable strategy call time, then submit the short form to confirm your details.'
                    : hasLiveBooking
                      ? 'Complete the short form first, then choose a suitable time for your strategy call.'
                      : 'Submit your details and we’ll contact you to confirm the best time.'}
                  responseText={hasGoogleCalendarLive
                    ? 'Monday to Friday, 9:00am–5:00pm Melbourne time.'
                    : hasLiveBooking
                      ? 'We’ll confirm your booking details after you choose a suitable time.'
                      : 'Monday to Friday, 9:00am–5:00pm Melbourne time.'}
                />
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
