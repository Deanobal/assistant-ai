import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import VapiReceptionistDemoButton from '@/components/voice/VapiReceptionistDemoButton';

export default function CTASection() {
  return (
    <section className="site-section" id="live-demo">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(43,94,255,0.11),transparent_30rem)]" />
      <div className="site-container relative">
        <div className="site-card mx-auto max-w-5xl px-5 py-10 text-center sm:px-8 sm:py-14 lg:px-12 lg:py-16">
          <p className="site-kicker">Start the conversation</p>
          <h2 className="mx-auto max-w-3xl">Ready to turn more enquiries into paying clients?</h2>
          <p className="site-lede mx-auto">Choose a plan or test the AI receptionist and see how quickly your business can respond.</p>
          <div className="mx-auto mt-8 flex max-w-xl flex-col items-stretch justify-center gap-3 sm:flex-row">
            <Link to="/GetStartedNow" className="site-button-primary w-full sm:w-auto">
              Get started now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <VapiReceptionistDemoButton variant="secondary" showFallbackText className="w-full sm:w-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
