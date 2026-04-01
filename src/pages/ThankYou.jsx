import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, ShieldCheck, Clock3, BriefcaseBusiness } from 'lucide-react';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { STRATEGY_CALL_BOOKING_MODE, STRATEGY_CALL_BOOKING_URL } from '@/lib/booking';

function getQueryValue(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key) || '';
}

export default function ThankYou() {
  const formType = getQueryValue('form') || 'lead_form';
  const leadId = getQueryValue('lead') || '';
  const leadEmail = getQueryValue('email') || '';
  const leadPhone = getQueryValue('phone') || '';
  const hasBookingLink = STRATEGY_CALL_BOOKING_MODE !== 'request' && !!STRATEGY_CALL_BOOKING_URL;

  useEffect(() => {
    if (typeof window === 'undefined' || window.__assistantAiThankYouTracked) return;
    window.__assistantAiThankYouTracked = true;
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        form_type: formType,
        lead_id: leadId,
        has_email: !!leadEmail,
        has_phone: !!leadPhone,
      });
    }
  }, [formType, leadId, leadEmail, leadPhone]);

  return (
    <>
      <SEO
        title="Thank You | AssistantAI"
        description="Thanks — we’ve received your request. AssistantAI will review your details and contact you shortly with the right next step."
        canonicalPath="/thank-you"
      />
      <section className="relative py-24 md:py-28 bg-grid min-h-[calc(100vh-120px)]">
        <div className="bg-radial-glow absolute inset-0" />
        <div className="relative max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10">
              <CheckCircle2 className="h-10 w-10 text-cyan-300" />
            </div>
            <p className="text-cyan-400 mb-3 text-base font-medium">REQUEST RECEIVED</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance text-white">Thanks — we’ve received your request</h1>
            <p className="mt-4 text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">You’ve taken the first step to fixing missed calls and lost leads.</p>
            <p className="mt-4 text-cyan-100 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">Most businesses we speak to are losing leads right now — let’s fix that fast.</p>
            <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">We’ll reach out shortly — or you can lock in a time now.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-10 grid gap-6">
            <Card className="bg-[#12121a] border-white/5 overflow-hidden">
              <CardContent className="p-8 md:p-10 text-center space-y-6">
                <div className="space-y-3">
                  <p className="text-cyan-300 text-sm font-medium uppercase tracking-[0.2em]">Next Best Step</p>
                  <h2 className="text-2xl md:text-3xl font-semibold text-white">Want to get started faster?</h2>
                  <p className="text-gray-300 max-w-2xl mx-auto">We can review your setup and map your AI system today.</p>
                </div>

                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  {hasBookingLink ? (
                    <a href={STRATEGY_CALL_BOOKING_URL} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                      <Button className="w-full min-h-14 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full px-8 text-base shadow-lg shadow-cyan-500/20">
                        Book Your Strategy Call Now
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </a>
                  ) : (
                    <Link to="/Contact" className="w-full sm:w-auto">
                      <Button className="w-full min-h-14 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full px-8 text-base shadow-lg shadow-cyan-500/20">
                        Request Immediate Call
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Link to="/AIDemo" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full min-h-14 rounded-full border-white/10 bg-white/[0.03] px-8 text-white hover:bg-white/[0.06]">
                      Watch 2-Min Demo
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-cyan-100/90">If you're ready, we can map this out with you today.</p>
                  <p className="text-sm text-cyan-100/80">Most strategy calls are booked within hours of enquiry.</p>
                </div>

                <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 text-left max-w-3xl mx-auto">
                  <p className="text-white font-medium mb-4">Used by Australian service businesses to:</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex items-start gap-3 rounded-2xl border border-white/6 bg-black/10 p-4">
                      <CheckCircle2 className="h-5 w-5 text-cyan-300 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-200">Capture more leads</p>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl border border-white/6 bg-black/10 p-4">
                      <CheckCircle2 className="h-5 w-5 text-cyan-300 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-200">Respond instantly</p>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl border border-white/6 bg-black/10 p-4">
                      <CheckCircle2 className="h-5 w-5 text-cyan-300 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-200">Reduce admin workload</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#12121a] border-white/5">
              <CardContent className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <Clock3 className="h-5 w-5 text-cyan-300" />
                  <h2 className="text-xl font-semibold text-white">What Happens Next</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                    <p className="text-sm text-gray-400 mb-2">Step 1</p>
                    <p className="text-white font-medium">We review your enquiry</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                    <p className="text-sm text-gray-400 mb-2">Step 2</p>
                    <p className="text-white font-medium">We map your AI workflow</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                    <p className="text-sm text-gray-400 mb-2">Step 3</p>
                    <p className="text-white font-medium">We contact you within 1–24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#12121a] border-white/5">
              <CardContent className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <BriefcaseBusiness className="h-5 w-5 text-cyan-300" />
                  <h2 className="text-xl font-semibold text-white">What this fixes in your business</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-gray-200">Missed calls after hours</div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-gray-200">Slow response times</div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-gray-200">Lost leads</div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-gray-200">Manual follow-up</div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-gray-200">Admin overload</div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-2">
              <Link to="/" className="w-full sm:w-auto">
                <Button className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 text-white">Back to Home</Button>
              </Link>
              <Link to="/AIDemo" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]">Watch Demo</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}