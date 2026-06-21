import { ArrowRight } from 'lucide-react';
import HeroBrainCard from './HeroBrainCard';
import VapiReceptionistDemoButton from '@/components/voice/VapiReceptionistDemoButton';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-4">
      <div className="absolute inset-0 z-0">
        <img
          src="https://rygyswsngskbdpgeqloy.supabase.co/storage/v1/object/public/site-assets/Hero.png"
          alt="AssistantAI background"
          className="h-full w-full object-cover opacity-20" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(34,211,238,0.14),transparent_28%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06080d] via-[#070a12]/96 to-[#06080d]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16 lg:min-h-[calc(100vh-5.5rem)] lg:flex lg:items-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.95fr)] lg:gap-14">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">AI Receptionist + Sales Automation for Australian Businesses</span>
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl lg:text-[4.35rem] xl:text-[4.7rem]">
              Turn Missed Calls Into Paid Clients
            </h1>

            <p className="mt-6 max-w-2xl text-[1.05rem] leading-8 text-slate-300 md:text-xl md:leading-8">
              Stop losing jobs when you miss a call. AssistantAI answers, qualifies, and follows up with new enquiries 24/7 — so more leads turn into paying clients.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <VapiReceptionistDemoButton className="sm:min-w-[16rem]" />

              <a
                href="/GetStartedNow"
                className="inline-flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-6 py-4 text-center text-base font-semibold text-cyan-100 transition-all hover:border-cyan-300/60 hover:bg-cyan-400/15 sm:w-auto sm:min-w-[15.5rem]">
                <span>Get Started Now</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </a>

              <a
                href="/Contact"
                className="inline-flex min-h-[3.5rem] w-full items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 py-4 text-center text-base font-semibold text-white transition-all hover:border-white/30 hover:bg-white/[0.08] sm:w-auto sm:min-w-[14rem]">
                Contact Us
              </a>
            </div>

            <p className="mt-5 max-w-2xl leading-7 text-slate-400 md:text-base text-base">
              Talk to the AI first, choose a plan, complete secure checkout, and start setup without waiting days for a callback.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-300">
              {['Call answered', 'Enquiry qualified', 'Plan selected', 'Secure signup', 'Setup underway'].map((step) => (
                <span key={step} className="rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1.5">{step}</span>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroBrainCard />
          </div>
        </div>
      </div>
    </section>
  );
}
