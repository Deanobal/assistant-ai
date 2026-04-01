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
            <p className="mt-5 text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">Our team will review your details and contact you shortly to map out your setup.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-10 grid gap-6">
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
                    <p className="text-white font-medium">We prepare your AI setup strategy</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                    <p className="text-sm text-gray-400 mb-2">Step 3</p>
                    <p className="text-white font-medium">We contact you within 1–24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#12121a] border-white/5">
              <CardContent className="p-8 md:p-10 space-y-5 text-center">
                <h2 className="text-xl font-semibold text-white">Next Best Step</h2>
                {hasBookingLink ? (
                  <>
                    <p className="text-gray-400 max-w-2xl mx-auto">If you want to move faster, you can lock in a time right now using the booking link below.</p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <a href={STRATEGY_CALL_BOOKING_URL} target="_blank" rel="noreferrer">
                        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full px-8 py-6 shadow-lg shadow-cyan-500/20">
                          Book Your Strategy Call Now
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </a>
                      <Link to="/AIDemo">
                        <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]">
                          Watch Demo
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-300 max-w-2xl mx-auto">Want to speed things up? Send us a priority follow-up request and our team can move on it straight away.</p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Link to="/Contact">
                        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full px-8 py-6 shadow-lg shadow-cyan-500/20">
                          Request Immediate Call
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to="/AIDemo">
                        <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]">
                          Watch Demo
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#12121a] border-white/5">
              <CardContent className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="h-5 w-5 text-cyan-300" />
                  <h2 className="text-xl font-semibold text-white">Why businesses choose AssistantAI</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                    <BriefcaseBusiness className="h-5 w-5 text-cyan-300 mb-3" />
                    <p className="text-white font-medium">Built for Australian service businesses</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                    <ShieldCheck className="h-5 w-5 text-cyan-300 mb-3" />
                    <p className="text-white font-medium">Designed to capture more leads and reduce admin</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                    <CheckCircle2 className="h-5 w-5 text-cyan-300 mb-3" />
                    <p className="text-white font-medium">Real systems, not demos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link to="/">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full px-8">Back to Home</Button>
              </Link>
              <Link to="/AIDemo">
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]">Watch Demo</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}