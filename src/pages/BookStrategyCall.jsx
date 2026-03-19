import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import LeadForm from '@/components/LeadForm';
import BookingSupportPanel from '@/components/contact/BookingSupportPanel';
import { STRATEGY_CALL_BOOKING_URL } from '@/lib/booking';

export default function BookStrategyCall() {
  const [showAdminWarning, setShowAdminWarning] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) return;
      const user = await base44.auth.me();
      setShowAdminWarning(user?.role === 'admin' && !STRATEGY_CALL_BOOKING_URL);
    };

    checkAdmin();
  }, []);

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
            <p className="text-cyan-400 mb-3 text-base font-medium">BOOK FREE STRATEGY CALL</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              Book Your Free Strategy Call
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              Tell us about your business and we’ll show you how AssistantAI can help answer more calls, capture better leads, and automate follow-up.
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
                submitLabel="Book Free Strategy Call"
                successTitle={STRATEGY_CALL_BOOKING_URL ? 'Continue to Live Booking' : 'Strategy Call Request Received'}
                successText={STRATEGY_CALL_BOOKING_URL
                  ? 'Your details have been saved. Continue to the live calendar to confirm your strategy call.'
                  : 'Thanks — your enquiry has been received. We’ll review your details and send you the next step for your strategy call shortly.'}
                matchedLeadStatus="Strategy Call Booked"
                createStatus="Strategy Call Booked"
                nextActionText="Follow up on strategy call request and send booking next step."
                bookingIntent={true}
                bookingSource="strategy_call_page"
                showPreferredMeetingFields={!STRATEGY_CALL_BOOKING_URL}
                successActionHref={STRATEGY_CALL_BOOKING_URL || undefined}
                successActionLabel={STRATEGY_CALL_BOOKING_URL ? 'Continue to Live Booking' : undefined}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <BookingSupportPanel
                bookingUrl={STRATEGY_CALL_BOOKING_URL}
                adminWarning={showAdminWarning ? 'Admin warning: add your live booking URL in src/lib/booking.js to enable direct calendar booking.' : ''}
                intro="Complete the short form first so AssistantAI can save the lead properly before the booking step continues."
                responseText="We usually respond within one business day if a live calendar link is not connected."
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}