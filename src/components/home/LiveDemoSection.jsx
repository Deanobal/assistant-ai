import { ArrowRight, CheckCircle2, Mic, Phone } from 'lucide-react';

const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_5301kpkzdmade089yktcm780dz3s';
const ELEVENLABS_SCRIPT_ID = 'elevenlabs-convai-widget-script';
const ELEVENLABS_SCRIPT_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
let elevenLabsScriptPromise = null;

function loadElevenLabsScript() {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('Document is not available'));
  }

  const existingScript = document.getElementById(ELEVENLABS_SCRIPT_ID);
  if (existingScript) {
    return Promise.resolve();
  }

  if (!elevenLabsScriptPromise) {
    elevenLabsScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = ELEVENLABS_SCRIPT_ID;
      script.src = ELEVENLABS_SCRIPT_SRC;
      script.async = true;
      script.type = 'text/javascript';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('ElevenLabs demo failed to load'));
      document.body.appendChild(script);
    });
  }

  return elevenLabsScriptPromise;
}

function startElevenLabsDemo() {
  if (typeof document === 'undefined') {
    return;
  }

  const status = document.getElementById('elevenlabs-demo-status');
  const mount = document.getElementById('elevenlabs-demo-mount');

  if (status) {
    status.textContent = 'Loading live voice demo...';
  }

  loadElevenLabsScript()
    .then(() => {
      if (!mount) return;

      if (!mount.querySelector('elevenlabs-convai')) {
        const widget = document.createElement('elevenlabs-convai');
        widget.setAttribute('agent-id', ELEVENLABS_AGENT_ID);
        mount.appendChild(widget);
      }

      if (status) {
        status.textContent = 'Live demo ready. Your browser may ask for microphone permission.';
      }
    })
    .catch(() => {
      if (status) {
        status.textContent = 'Live demo is temporarily unavailable. The sample call flow remains available below.';
      }
    });
}

export default function LiveDemoSection() {
  return (
    <section id="live-demo" className="relative py-16 md:py-24 bg-[#070a12] scroll-mt-20">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-40" />

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1.5 mb-5">
            <Phone className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">Live demo</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Live AI Receptionist Demo
          </h2>
          <p className="mt-4 text-base text-slate-400 max-w-2xl mx-auto leading-7">
            The live voice demo is being connected. You can still book a strategy call or view the sample call flow.
          </p>
        </div>

        <div className="relative rounded-[28px] border border-white/10 bg-[#0b0f18]/90 overflow-hidden shadow-[0_24px_90px_rgba(6,182,212,0.10)] backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          <div className="p-6 border-b border-white/8">
            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-5 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
                <Mic className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-white">Start the live AI voice demo</p>
              <p id="elevenlabs-demo-status" className="mt-2 text-sm leading-6 text-slate-400" aria-live="polite">
                Click Start Live Demo when you are ready. If the live widget is unavailable, this fallback stays visible.
              </p>
              <div id="elevenlabs-demo-mount" className="mt-5 flex justify-center" />
              <button
                type="button"
                onClick={startElevenLabsDemo}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                Start Live Demo
                <ArrowRight className="h-4 w-4" />
              </button>
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

          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/BookStrategyCall"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white hover:bg-white/[0.06] transition-all"
              >
                Book Free Strategy Call
              </a>
              <a
                href="/AIDemo"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white hover:bg-white/[0.06] transition-all"
              >
                View Sample Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}