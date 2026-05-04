import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, CheckCircle2, Mic, Loader2 } from 'lucide-react';

const ELEVENLABS_SCRIPT_ID = 'assistantai-elevenlabs-widget-script';
const ELEVENLABS_SCRIPT_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

function SafeFallback() {
  return (
    <>
      <div className="p-6 border-b border-white/8">
        <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-5 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
            <Phone className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-white">Live voice demo temporarily in safe mode</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            We have paused the live widget on the homepage to keep the public site stable while the live connection is finalised.
          </p>
        </div>
      </div>

      <div className="p-6 border-b border-white/8">
        <div className="mb-4 flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest">
          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
          Sample call flow
        </div>
        <div className="space-y-3">
          <div className="max-w-[85%] rounded-2xl bg-white/[0.06] px-4 py-3 text-sm leading-relaxed text-slate-200">
            Hi, thanks for calling. How can I help you today?
          </div>
          <div className="ml-auto max-w-[85%] rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm leading-relaxed text-slate-300">
            I need help with an urgent service booking.
          </div>
          <div className="max-w-[85%] rounded-2xl bg-white/[0.06] px-4 py-3 text-sm leading-relaxed text-slate-200">
            I can help with that. I’ll capture your details, urgency, and preferred next step so the team can follow up quickly.
          </div>
        </div>
      </div>
    </>
  );
}

export default function LiveDemoSection() {
  const [scriptStatus, setScriptStatus] = React.useState(ELEVENLABS_AGENT_ID ? 'loading' : 'fallback');
  const [demoStarted, setDemoStarted] = React.useState(false);
  const widgetRef = React.useRef(null);

  React.useEffect(() => {
    if (!ELEVENLABS_AGENT_ID || typeof window === 'undefined') {
      setScriptStatus('fallback');
      return;
    }

    const existingScript = document.getElementById(ELEVENLABS_SCRIPT_ID);
    if (existingScript?.dataset.loaded === 'true') {
      setScriptStatus('ready');
      return;
    }

    const script = existingScript || document.createElement('script');
    script.id = ELEVENLABS_SCRIPT_ID;
    script.src = ELEVENLABS_SCRIPT_SRC;
    script.async = true;
    script.type = 'text/javascript';

    const handleLoad = () => {
      script.dataset.loaded = 'true';
      setScriptStatus('ready');
    };

    const handleError = () => {
      setScriptStatus('fallback');
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (!existingScript) {
      document.body.appendChild(script);
    }

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, []);

  const handleStartDemo = () => {
    setDemoStarted(true);

    window.setTimeout(() => {
      const widget = widgetRef.current;
      const actionButton = widget?.shadowRoot?.querySelector('button');
      if (actionButton) {
        actionButton.click();
      }
    }, 300);
  };

  const showLiveDemo = scriptStatus === 'ready';
  const showFallback = scriptStatus === 'fallback';

  return (
    <section id="homepage-demo" className="relative py-16 md:py-24 bg-[#070a12] scroll-mt-20">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-40" />

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1.5 mb-5">
            <Phone className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">Live demo</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Live AI Receptionist Demo
          </h2>
          <p className="mt-4 text-base text-slate-400 max-w-2xl mx-auto leading-7">
            Try the AI receptionist safely from this page. If the live connection is unavailable, the sample call flow stays visible.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative rounded-[28px] border border-white/10 bg-[#0b0f18]/90 overflow-hidden shadow-[0_24px_90px_rgba(6,182,212,0.10)] backdrop-blur-xl"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          {scriptStatus === 'loading' && (
            <div className="p-6 border-b border-white/8">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-cyan-300" />
                <p className="text-sm font-semibold text-white">Preparing live demo</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">Loading the voice receptionist in an isolated widget.</p>
              </div>
            </div>
          )}

          {showLiveDemo && (
            <div className="p-6 border-b border-white/8">
              <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-5 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
                  <Mic className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-white">Live receptionist ready</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Click Start Live Demo, then allow microphone access when your browser asks.
                </p>
                <button
                  type="button"
                  onClick={handleStartDemo}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/25"
                >
                  <Mic className="h-4 w-4" />
                  Start Live Demo
                </button>
              </div>

              <div className={demoStarted ? 'mt-5 rounded-2xl border border-white/10 bg-black/20 p-4' : 'sr-only'}>
                <elevenlabs-convai ref={widgetRef} agent-id={ELEVENLABS_AGENT_ID}></elevenlabs-convai>
              </div>
            </div>
          )}

          {showFallback && <SafeFallback />}

          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/BookStrategyCall"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                Book Free Strategy Call
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/AIDemo"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white hover:bg-white/[0.06] transition-all"
              >
                View Sample Call
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}