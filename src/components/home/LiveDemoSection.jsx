import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, MicOff, Phone, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CAPTURE_ENDPOINT = 'https://ai-assistant-flow.base44.app/functions/captureElevenLabsLead';
const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || null;
const ELEVENLABS_WIDGET_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
const ELEVENLABS_WIDGET_TAG = 'elevenlabs-convai';

const sampleTranscript = [
  { role: 'ai', text: "Hi, thanks for calling! I'm the AI receptionist for AssistantAI. How can I help you today?" },
  { role: 'customer', text: "Hey, my hot water system just stopped working. I need someone urgently." },
  { role: 'ai', text: "No hot water is definitely urgent — I can help with that. Can I grab your name and best contact number so we can get someone to you quickly?" },
  { role: 'customer', text: "Sure, it's James Carter, 0412 345 678. I'm in Surry Hills." },
  { role: 'ai', text: "Thanks James. I've captured your details and flagged this as urgent. Our on-call technician will call you within 15 minutes to confirm a time." },
];

export default function LiveDemoSection() {
  const [micPermission, setMicPermission] = useState('unknown');
  const [demoStatus, setDemoStatus] = useState('idle'); // idle | active | ended
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState({ full_name: '', phone: '', service_needed: '' });
  const [submitting, setSubmitting] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const [widgetFailed, setWidgetFailed] = useState(false);

  const isLive = !!ELEVENLABS_AGENT_ID && !widgetFailed;

  useEffect(() => {
    if (!navigator.permissions) return;
    navigator.permissions.query({ name: 'microphone' }).then((result) => {
      setMicPermission(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'unknown');
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!ELEVENLABS_AGENT_ID || typeof window === 'undefined') return;

    if (window.customElements?.get(ELEVENLABS_WIDGET_TAG)) {
      setWidgetReady(true);
      return;
    }

    const existingScript = document.querySelector(`script[src="${ELEVENLABS_WIDGET_SRC}"]`);
    const script = existingScript || document.createElement('script');

    const markReady = () => {
      customElements.whenDefined(ELEVENLABS_WIDGET_TAG)
        .then(() => setWidgetReady(true))
        .catch(() => setWidgetFailed(true));
    };

    script.addEventListener('load', markReady, { once: true });
    script.addEventListener('error', () => setWidgetFailed(true), { once: true });

    if (!existingScript) {
      script.src = ELEVENLABS_WIDGET_SRC;
      script.async = true;
      script.type = 'text/javascript';
      document.head.appendChild(script);
    } else {
      markReady();
    }

    const timeout = window.setTimeout(() => {
      if (!window.customElements?.get(ELEVENLABS_WIDGET_TAG)) setWidgetFailed(true);
    }, 8000);

    return () => window.clearTimeout(timeout);
  }, []);

  const handleStartDemo = async () => {
    if (!isLive || !widgetReady) {
      setWidgetFailed(true);
      return;
    }
    if (micPermission === 'denied') return;
    if (micPermission !== 'granted') {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission('granted');
      } catch {
        setMicPermission('denied');
        return;
      }
    }
    setDemoStatus('active');
  };

  const handleEndCall = () => {
    setDemoStatus('ended');
    setShowLeadForm(true);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.full_name || !leadForm.phone || !leadForm.service_needed) return;
    setSubmitting(true);
    try {
      const webhookSecret = import.meta.env.VITE_ELEVENLABS_WEBHOOK_SECRET;
      await fetch(CAPTURE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhookSecret ? { 'x-webhook-secret': webhookSecret } : {}),
        },
        body: JSON.stringify({
          ...leadForm,
          urgency: 'medium',
          lead_source: 'ElevenLabs website demo',
          conversation_summary: 'Lead captured via ElevenLabs website demo interaction.',
        }),
      });
      setLeadCaptured(true);
      setShowLeadForm(false);
    } catch {
      // silently fail — lead form still shown
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="homepage-demo" className="relative py-16 md:py-24 bg-[#070a12] scroll-mt-20">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-40" />

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1.5 mb-5">
            <Phone className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">
              {isLive ? 'Live AI Receptionist' : 'Sample AI receptionist call'}
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Try the AI Receptionist Live
          </h2>
          <p className="mt-4 text-base text-slate-400 max-w-2xl mx-auto leading-7">
            Speak with a live demo of how AssistantAI answers enquiries, captures leads, and routes follow-up.
          </p>

          {!isLive && (
            <div className="mt-4 inline-flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-300 max-w-xl mx-auto text-left">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>Sample mode:</strong> Set <code className="font-mono text-xs bg-white/10 px-1 py-0.5 rounded">VITE_ELEVENLABS_AGENT_ID</code> in environment variables to enable live voice.
              </span>
            </div>
          )}
        </motion.div>

        {/* Main demo card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative rounded-[28px] border border-white/10 bg-[#0b0f18]/90 overflow-hidden shadow-[0_24px_90px_rgba(6,182,212,0.10)] backdrop-blur-xl"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          {/* Live ElevenLabs widget — only rendered when active & agent ID set */}
          {isLive && demoStatus === 'active' && (
            <div className="p-6 border-b border-white/8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-400" />
                  </span>
                  <span className="text-sm font-medium text-white">Live session active</span>
                </div>
                <button
                  onClick={handleEndCall}
                  className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-300 hover:bg-red-500/20 transition-colors"
                >
                  End Call
                </button>
              </div>
              {/* ElevenLabs custom element — script loaded via index.html when agent ID is configured */}
              <div className="rounded-2xl overflow-hidden bg-black/30 min-h-[140px] flex items-center justify-center">
                <elevenlabs-convai agent-id={ELEVENLABS_AGENT_ID} style={{ width: '100%' }} />
              </div>
            </div>
          )}

          {/* Sample / idle transcript */}
          {demoStatus !== 'active' && isLive && (
            <div className="p-6 border-b border-white/8">
              <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-5 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
                  <Mic className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-white">
                  {widgetReady ? 'Live receptionist ready' : 'Loading live receptionist…'}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Click Start Live Demo to allow microphone access and begin a real ElevenLabs voice session.
                </p>
              </div>
            </div>
          )}

          {demoStatus !== 'active' && !isLive && (
            <div className="p-6 border-b border-white/8">
              <div className="mb-3 flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest">
                <Phone className="h-3 w-3 text-cyan-400" />
                {demoStatus === 'ended' ? 'Session ended' : 'Sample call transcript'}
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {sampleTranscript.map((line, i) => (
                  <div key={i} className={`flex gap-3 ${line.role === 'customer' ? 'justify-end' : 'justify-start'}`}>
                    {line.role === 'ai' && (
                      <div className="flex-shrink-0 h-7 w-7 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center mt-0.5">
                        <span className="text-[10px] font-bold text-cyan-300">AI</span>
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      line.role === 'ai'
                        ? 'bg-white/[0.06] text-slate-200 rounded-tl-sm'
                        : 'bg-cyan-500/10 border border-cyan-400/20 text-slate-300 rounded-tr-sm'
                    }`}>
                      {line.text}
                    </div>
                    {line.role === 'customer' && (
                      <div className="flex-shrink-0 h-7 w-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center mt-0.5">
                        <span className="text-[10px] font-bold text-slate-300">You</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mic blocked warning */}
          {micPermission === 'denied' && isLive && (
            <div className="px-6 py-3 flex items-start gap-3 bg-amber-400/5 border-b border-amber-400/10">
              <MicOff className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-300">Microphone access is blocked. Allow microphone access to speak with the AI receptionist.</p>
            </div>
          )}

          {/* Lead capture success */}
          {leadCaptured && (
            <div className="px-6 py-4 flex items-start gap-3 bg-emerald-500/5 border-b border-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-sm text-emerald-300">Your details have been captured. Our team will be in touch shortly.</p>
            </div>
          )}

          {/* Post-call lead form */}
          {showLeadForm && !leadCaptured && (
            <div className="p-6 border-b border-white/8">
              <p className="text-sm font-medium text-white mb-4">Leave your details and we'll follow up</p>
              <form onSubmit={handleLeadSubmit} className="grid sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Your name *"
                  value={leadForm.full_name}
                  onChange={(e) => setLeadForm((f) => ({ ...f, full_name: e.target.value }))}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone number *"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm((f) => ({ ...f, phone: e.target.value }))}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Service needed *"
                  value={leadForm.service_needed}
                  onChange={(e) => setLeadForm((f) => ({ ...f, service_needed: e.target.value }))}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  className="sm:col-span-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-full"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting ? 'Sending…' : 'Send My Details'}
                </Button>
              </form>
            </div>
          )}

          {/* CTA buttons */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {isLive ? (
                <Button
                  onClick={handleStartDemo}
                  disabled={micPermission === 'denied' || !widgetReady}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mic className="h-4 w-4" />
                  {!widgetReady ? 'Loading Live Demo…' : demoStatus === 'ended' ? 'Start New Session' : 'Start Live Demo'}
                </Button>
              ) : (
                <Link
                  to="/AIDemo"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                >
                  <Phone className="h-4 w-4" />
                  Watch Full Demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                to="/BookStrategyCall"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white hover:bg-white/[0.06] transition-all"
              >
                Book Free Strategy Call
              </Link>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              No commitment. 30 minutes. Real results.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}