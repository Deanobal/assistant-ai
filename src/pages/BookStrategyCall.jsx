import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import LeadForm from '@/components/LeadForm';
import BookingSupportPanel from '@/components/contact/BookingSupportPanel';
import {
  STRATEGY_CALL_BOOKING_PROVIDER,
  STRATEGY_CALL_BOOKING_URL,
  STRATEGY_CALL_BOOKING_EMBED_URL,
  STRATEGY_CALL_BOOKING_MODE,
} from '@/lib/booking';

export default function BookStrategyCall() {
  const [showAdminWarning, setShowAdminWarning] = useState(false);
  const hasLiveBooking = STRATEGY_CALL_BOOKING_MODE !== 'request';
  const isEmbeddedBooking = STRATEGY_CALL_BOOKING_MODE === 'embed';
  const providerLabel = STRATEGY_CALL_BOOKING_PROVIDER || 'Live Calendar';

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
              {hasLiveBooking ? 'Save Your Details and Pick a Strategy Call Time' : 'Request Your Free Strategy Call'}
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              {hasLiveBooking
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
              <LeadForm
                submitLabel={hasLiveBooking ? 'Save Details and Continue' : 'Request Free Strategy Call'}
                successTitle={isEmbeddedBooking ? 'Pick Your Strategy Call Time' : hasLiveBooking ? 'Continue to Live Booking' : 'Strategy Call Request Received'}
                successText={isEmbeddedBooking
                  ? 'Your details have been saved. Use the live booking widget below to choose an available slot.'
                  : hasLiveBooking
                    ? 'Your details have been saved. Continue to the live booking page to choose an available slot.'
                    : 'Thanks — your strategy call request has been received. We’ll review your details and send the next step shortly.'}
                matchedLeadStatus="Strategy Call Requested"
                createStatus="Strategy Call Requested"
                nextActionText={hasLiveBooking
                  ? 'Lead requested a strategy call and still needs external booking confirmation.'
                  : 'Follow up on strategy call request and send booking next step.'}
                bookingIntent={true}
                bookingSource={`strategy_call_${STRATEGY_CALL_BOOKING_MODE}`}
                showPreferredMeetingFields={!hasLiveBooking}
                successActionHref={STRATEGY_CALL_BOOKING_URL || undefined}
                successActionLabel={STRATEGY_CALL_BOOKING_URL ? `Open ${providerLabel}` : undefined}
                successEmbedUrl={isEmbeddedBooking ? STRATEGY_CALL_BOOKING_EMBED_URL : undefined}
                successEmbedLabel={`${providerLabel} booking widget`}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <BookingSupportPanel
                bookingUrl={STRATEGY_CALL_BOOKING_URL || STRATEGY_CALL_BOOKING_EMBED_URL}
                bookingMode={STRATEGY_CALL_BOOKING_MODE}
                bookingProvider={providerLabel}
                adminWarning={showAdminWarning ? 'Admin warning: add a live booking URL or embed URL in src/lib/booking.js to enable real calendar scheduling.' : ''}
                intro={hasLiveBooking
                  ? 'Complete the short form first so AssistantAI can save the lead properly before the live scheduling step continues.'
                  : 'Complete the short form to send a strategy call request. No live calendar is connected yet.'}
                responseText={hasLiveBooking
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