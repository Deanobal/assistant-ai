import { ArrowRight } from 'lucide-react';
import HeroBrainCard from './HeroBrainCard';
import VapiReceptionistDemoButton from '@/components/voice/VapiReceptionistDemoButton';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-2 sm:pt-4">
      <div className="absolute inset-0 z-0">
        <img
          src="https://rygyswsngskbdpgeqloy.supabase.co/storage/v1/object/public/site-assets/Hero.png"
          alt="AssistantAI background"
          className="h-full w-full object-cover opacity-15 sm:opacity-20"
          loading="eager"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(34,211,238,0.10),transparent_28%)] sm:bg-[radial-gradient(circle_at_78%_24%,rgba(34,211,238,0.14),transparent_28%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06080d] via-[#070a12]/98 to-[#06080d]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:min-h-[calc(100vh-5.5rem)] lg:flex lg:items-center">
        <div className="grid w-full items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)] lg:gap-14">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5">
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              <span className="text-xs font-medium text-cyan-300 sm:text-sm">
                <span className="sm:hidden">AI Receptionist for Service Businesses</span>
                <span className="hidden sm:inline">AI Receptionist + Sales Automation for Australian Businesses</span>
              </span>
            </div>

            <h1 className="mx-auto max-w-3xl text-[2.5rem] font-bold leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl md:text-6xl lg:mx-0 lg:text-[4.35rem] lg:leading-[0.98] xl:text-[4.7rem]">
              Turn Missed Calls Into Paid Clients
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-[1.05rem] md:text-xl md:leading-8 lg:mx-0">
              Stop losing jobs when you miss a call. AssistantAI answers, qualifies, and follows up with new enquiries 24/7.
            </p>

            <div className="mx-auto mt-8 flex max-w-[34rem] flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:mx-0 lg:justify-start">
              <VapiReceptionistDemoButton className="w-full min-h-[3.5rem] sm:w-auto sm:min-w-[16rem]" />

              <a
                href="/GetStartedNow"
                className="inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/5 px-6 py-3.5 text-center text-base font-semibold text-cyan-100 transition-all hover:border-cyan-300/60 hover:bg-cyan-400/15 sm:min-h-[3.5rem] sm:w-auto sm:min-w-[15.5rem] sm:bg-cyan-400/10 sm:py-4"
              >
                <span>Get Started Now</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </a>

              <a
                href="/Contact"
                className="hidden min-h-[3.5rem] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 py-4 text-center text-base font-semibold text-white transition-all hover:border-white/30 hover:bg-white/[0.08] sm:inline-flex sm:w-auto sm:min-w-[14rem]"
              >
                Contact Us
              </a>
            </div>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base lg:mx-0">
              Talk to the AI first, choose a plan, complete secure checkout, and start setup without waiting days for a callback.
            </p>

            <div className="mx-auto mt-6 hidden max-w-xl flex-wrap justify-center gap-2 text-xs text-slate-300 sm:flex sm:text-sm lg:mx-0 lg:justify-start">
              {['Call answered', 'Enquiry qualified', 'Plan selected', 'Secure signup', 'Setup underway'].map((step) => (
                <span key={step} className="rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1.5">{step}</span>
              ))}
            </div>
          </div>

          <div className="mx-auto hidden w-full max-w-[420px] justify-center md:flex lg:max-w-none lg:justify-end">
            <HeroBrainCard />
          </div>
        </div>
      </div>
    </section>
  );
}
