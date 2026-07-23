import { useState } from 'react';
import SEO from '@/components/SEO';
import LeadForm from '@/components/LeadForm';
import BookingSupportPanel from '@/components/contact/BookingSupportPanel';
import StrategyCallAvailability from '@/components/contact/StrategyCallAvailability';
import {
  STRATEGY_CALL_BOOKING_PROVIDER,
  STRATEGY_CALL_BOOKING_URL,
  STRATEGY_CALL_BOOKING_EMBED_URL,
  STRATEGY_CALL_BOOKING_MODE,
} from '@/lib/booking';
import {
  AccentText,
  PageShell,
  Section,
} from '@/components/marketing/PremiumMarketing';

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
      <PageShell>
        <Section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,rgba(31,111,255,0.13),transparent_32%)]" />
          <div className="relative">
            <div className="mb-12 max-w-4xl">
              <h1 className="text-balance text-[2.75rem] font-[720] leading-[1.02] tracking-[-0.052em] text-white sm:text-[3.7rem] lg:text-[4.15rem]">
                Map the right AI receptionist <AccentText>for your business.</AccentText>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#aeb8c6] sm:text-lg">
                Tell us what you want to improve and we’ll help map the call flow, handoffs and integrations that make sense.
              </p>
              {!hasLiveBooking && (
                <p className="mt-5 max-w-2xl border-l-2 border-[#347cff] pl-4 text-sm leading-7 text-[#c7d8f4]">
                  Submit your details and we’ll contact you to confirm the best time.
                </p>
              )}
            </div>

            <div className="grid lg:grid-cols-5 gap-10">
              <div className="rounded-[16px] border border-[#2a394f] bg-[#07121f] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.22)] sm:p-8 lg:col-span-3">
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
                    const response = await fetch('/api/strategy-call-booking', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        leadId: lead.id,
                        fullName: form.full_name,
                        businessName: form.business_name,
                        email: form.email,
                        message: form.message,
                        slotStart: selectedSlot.start,
                        slotEnd: selectedSlot.end,
                        timezone: 'Australia/Melbourne',
                        calendarId: ASSISTANTAI_SALES_CALENDAR_ID,
                      })
                    });
                    const data = await response.json();
                    if (!response.ok || !data.success) throw new Error(data.error || data.details || 'Strategy call booking failed');
                    return data;
                  } : undefined}
                />
              </div>

              <div className="lg:col-span-2">
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
              </div>
            </div>
          </div>
        </Section>
      </PageShell>
    </>
  );
}
