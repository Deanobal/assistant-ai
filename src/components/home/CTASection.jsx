import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import VapiReceptionistDemoButton from '@/components/voice/VapiReceptionistDemoButton';

export default function CTASection() {
  return (
    <section className="relative py-18 md:py-24 bg-[#0c0c14]" id="live-demo">
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-balance md:text-5xl">
            Ready to Turn Enquiries Into Paid Clients?
          </h2>
          <p className="mt-6 max-w-3xl mx-auto text-base leading-8 text-gray-400 md:text-lg">
            Ready to stop missing enquiries? Choose a plan or test the AI receptionist and see how fast your business can respond.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              to="/GetStartedNow"
              className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 text-center font-medium text-white transition-all hover:shadow-lg hover:shadow-cyan-500/25"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <VapiReceptionistDemoButton variant="secondary" showFallbackText />
          </div>
        </div>
      </div>
    </section>
  );
}