import { CheckCircle2, Mic, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import VapiReceptionistDemoButton from '@/components/voice/VapiReceptionistDemoButton';

const flowCards = [
  'Answer the enquiry',
  'Qualify the business',
  'Recommend Starter or Growth',
  'Capture contact details',
  'Create secure checkout if the buyer is ready',
  'Escalate Enterprise/custom builds for review',
];

export default function LiveDemoSection() {
  return (
    <section id="live-demo" className="relative scroll-mt-20 bg-[#070a12] py-16 md:py-24">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-40" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1.5">
            <Mic className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">Live AI Receptionist Demo</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Talk to the AI That Can Turn Enquiries Into Clients
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-400 md:text-lg md:leading-8">
            Start a live browser voice call with the AssistantAI receptionist. It can answer questions, qualify your business, recommend Starter or Growth, and help ready buyers move to secure checkout.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0f18]/90 p-6 shadow-[0_24px_90px_rgba(6,182,212,0.10)] backdrop-blur-xl md:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
              <Mic className="h-5 w-5" />
            </div>
            <h3 className="text-2xl font-bold text-white">Try the AssistantAI Receptionist</h3>
            <p className="mt-3 text-base leading-7 text-slate-400">
              See how your business could handle missed calls, qualify new enquiries, and follow up instantly — even after hours.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-start">
              <VapiReceptionistDemoButton showFallbackText />
              <Link
                to="/GetStartedNow"
                className="inline-flex min-h-[3.5rem] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 py-4 text-base font-semibold text-white transition-all hover:border-white/30 hover:bg-white/[0.08]"
              >
                Get Started Now
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-300">
              <CheckCircle2 className="h-4 w-4" />
              What the AI Can Do
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {flowCards.map((item, index) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-[#0b0f18] p-4">
                  <p className="text-xs font-medium text-cyan-300">{index + 1}</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-white">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4 text-sm leading-6 text-slate-300">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <p>Starter and Growth buyers can be guided toward secure checkout. Enterprise or complex workflows are escalated for review.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}