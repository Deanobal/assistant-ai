import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3 } from 'lucide-react';
import SEO from '@/components/SEO';
import { STRATEGY_CALL_BOOKING_MODE, STRATEGY_CALL_BOOKING_URL } from '@/lib/booking';
import {
  PageShell,
  Section,
  premiumButton,
  premiumButtonSecondary,
} from '@/components/marketing/PremiumMarketing';

function getQueryValue(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key) || '';
}

export default function ThankYou() {
  const formType = getQueryValue('form') || 'lead_form';
  const leadId = getQueryValue('lead') || '';
  const leadEmail = getQueryValue('email') || '';
  const leadPhone = getQueryValue('phone') || '';
  const paymentStatus = getQueryValue('payment');
  const sessionId = getQueryValue('session_id');
  const isPaymentSuccess = paymentStatus === 'success';
  const [onboardingReady, setOnboardingReady] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(isPaymentSuccess);
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

  useEffect(() => {
    if (!isPaymentSuccess || !sessionId) {
      setCheckingOnboarding(false);
      return undefined;
    }

    let cancelled = false;
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/stripe-checkout-status?sessionId=${encodeURIComponent(sessionId)}`);
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        const ready = response.ok && !!data?.client_id && data?.onboarding_status !== 'pending';
        setOnboardingReady(ready);
        setCheckingOnboarding(!ready);
      } catch (_error) {
        if (!cancelled) setCheckingOnboarding(false);
      }
    };

    checkStatus();
    const timer = setInterval(checkStatus, 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [isPaymentSuccess, sessionId]);

  const statusLabel = isPaymentSuccess ? (onboardingReady ? 'Payment confirmed' : 'Payment received') : 'Request received';
  const title = isPaymentSuccess
    ? (onboardingReady ? 'Your AssistantAI onboarding has started.' : 'We’re preparing your onboarding now.')
    : 'Thanks — we’ve received your request.';
  const description = isPaymentSuccess
    ? (onboardingReady ? 'Your onboarding workspace is ready and the next steps are waiting for you.' : 'Stripe has confirmed payment. We’re waiting for the onboarding record to finish creating.')
    : 'We’ll review your details and contact you with the clearest next step.';

  return (
    <>
      <SEO
        title="Thank You | AssistantAI"
        description="Thanks — we’ve received your request and will contact you with the right next step."
        canonicalPath="/thank-you"
        noIndex
      />
      <PageShell>
        <Section className="relative min-h-[760px] overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(31,111,255,0.14),transparent_34%)]" />
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#2d5fae] bg-[#10284c]">
              <CheckCircle2 className="h-8 w-8 text-[#77a9ff]" aria-hidden="true" />
            </span>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#76a7ff]">{statusLabel}</p>
            <h1 className="mx-auto mt-4 max-w-3xl text-balance text-4xl font-[720] tracking-[-0.045em] text-white sm:text-5xl">{title}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#aab4c3]">{description}</p>

            <div className="mt-10 rounded-[16px] border border-[#2a394f] bg-[#07121f] p-6 text-left sm:p-8">
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-[#4b8cff]" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-white">What happens next</h2>
              </div>
              <div className="mt-6 grid gap-px overflow-hidden rounded-[12px] border border-[#26364d] bg-[#26364d] md:grid-cols-3">
                {[
                  isPaymentSuccess ? 'Payment status is confirmed.' : 'We review the details you submitted.',
                  isPaymentSuccess ? 'Your onboarding record is prepared.' : 'We map the most useful workflow and next step.',
                  isPaymentSuccess ? 'You continue into setup and system connection.' : 'Our team contacts you to continue the conversation.',
                ].map((step, index) => (
                  <div key={step} className="bg-[#081522] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#76a7ff]">Step {index + 1}</p>
                    <p className="mt-3 text-sm leading-7 text-[#c2cbd6]">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              {isPaymentSuccess ? (
                <Link to="/Onboarding" className={premiumButton} aria-disabled={!onboardingReady && checkingOnboarding}>
                  {onboardingReady ? 'Go to Onboarding' : 'Preparing Onboarding'}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : hasBookingLink ? (
                <a href={STRATEGY_CALL_BOOKING_URL} target="_blank" rel="noreferrer" className={premiumButton}>
                  Book Your Strategy Call
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : (
                <Link to="/Contact" className={premiumButton}>
                  Continue the Conversation
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
              <Link to="/AIDemo" className={premiumButtonSecondary}>Try the Live Demo</Link>
            </div>
          </div>
        </Section>
      </PageShell>
    </>
  );
}
