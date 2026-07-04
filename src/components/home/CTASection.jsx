import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import VapiReceptionistDemoButton from '@/components/voice/VapiReceptionistDemoButton';

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-[#0c0c14] py-14 sm:py-16 md:py-24" id="live-demo">
      <div className="absolute inset-0 bg-radial-glow opacity-70" />
      <div className="absolute left-1/2 top-0 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[90px] sm:h-[500px] sm:w-[500px]" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="rounded-3xl border border-white/5 bg-[#12121a]/70 px-5 py-8 shadow-2xl shadow-black/20 sm:px-8 sm:py-10 md:px-10 md:py-12">
          <h2 className="mx-auto max-w-3xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Ready to Turn Enquiries Into Paid Clients?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base md:text-lg md:leading-8">
            Choose a plan or test the AI receptionist and see how fast your business can respond.
          </p>
          <div className="mx-auto mt-7 flex max-w-md flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              to="/GetStartedNow"
              className="inline-flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 text-center font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/25 sm:w-auto"
            >
              Get Started Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <VapiReceptionistDemoButton variant="secondary" showFallbackText className="w-full sm:w-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
