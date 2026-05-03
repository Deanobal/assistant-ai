import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, MicOff, Phone, PhoneOff, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CAPTURE_ENDPOINT = 'https://ai-assistant-flow.base44.app/functions/captureElevenLabsLead';
const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || null;

// Sample transcript for fallback display
const sampleTranscript = [
  { role: 'ai', text: "Hi, thanks for calling! I'm the AI receptionist for AssistantAI. How can I help you today?" },
  { role: 'customer', text: "Hey, my hot water system just stopped working. I need someone urgently." },
  { role: 'ai', text: "No hot water is definitely urgent — I can help with that. Can I grab your name and best contact number so we can get someone to you quickly?" },
  { role: 'customer', text: "Sure, it's James Carter, 0412 345 678. I'm in Surry Hills." },
  { role: 'ai', text: "Thanks James. I've captured your details and flagged this as urgent. Our on-call technician will call you within 15 minutes to confirm a time." },
];

// ElevenLabs widget loader
function useElevenLabsWidget(agentId, onCallEnd) {
  const [status, setStatus] = useState('idle'); // idle | loading | active | ended | error
  const [errorMsg, setErrorMsg] = useState('');
  const widgetRef = useRef(null);

  const startCall = async () => {
    if (!agentId) {
      setStatus('error');
      setErrorMsg('ElevenLabs Agent ID is not configured. This demo is running in sample mode.');
      return;
    }

    setStatus('loading');

    try {
      // Dynamically load ElevenLabs Conversational AI widget script
      if (!document.getElementById('elevenlabs-widget-script')) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.id = 'elevenlabs-widget-script';
          script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed/dist/index.js';
          script.type = 'text/javascript';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load ElevenLabs widget script.'));
          document.head.appendChild(script);
        });
      }

      // Small delay to ensure custom element is registered
      await new Promise((r) => setTimeout(r, 300));

      setStatus('active');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to start demo. Please try again.');
    }
  };

  const endCall = () => {
    setStatus('ended');
    if (onCallEnd) onCallEnd();
  };

  return { status, errorMsg, startCall, endCall, widgetRef };
}

// Lead capture after ElevenLabs conversation
async function captureLeadFromConversation(leadData) {
  const webhookSecret = import.meta.env.VITE_ELEVENLABS_WEBHOOK_SECRET;
  const headers = {
    'Content-Type': 'application/json',
    ...(webhookSecret ? { 'x-webhook-secret': webhookSecret } : {}),
  };

  const response = await fetch(CAPTURE_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ...leadData,
      lead_source: 'ElevenLabs website demo',
    }),
  });

  return response.json();
}

export default function LiveDemoSection() {
  const [micPermission, setMicPermission] = useState('unknown'); // unknown | granted | denied
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState({ full_name: '', phone: '', service_needed: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const { status, errorMsg, startCall, endCall } = useElevenLabsWidget(
    ELEVENLABS_AGENT_ID,
    () => setShowLeadForm(true)
  );

  const isLive = !!ELEVENLABS_AGENT_ID;

  const checkMicPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' });
      setMicPermission(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'unknown');
    } catch {
      setMicPermission('unknown');
    }
  };

  useEffect(() => {
    checkMicPermission();
  }, []);

  const handleStartDemo = async () => {
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
    startCall();
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.full_name || !leadForm.phone || !leadForm.service_needed) return;
    setSubmitting(true);
    try {
      const result = await captureLeadFromConversation({
        full_name: leadForm.full_name,
        phone: leadForm.phone,
        service_needed: leadForm.service_needed,
        urgency: 'medium',
        conversation_summary: 'Lead captured via ElevenLabs website demo interaction.',
      });
      setSubmitResult(result);
      setLeadCaptured(true);
      setShowLeadForm(false);
    } catch (err) {
      setSubmitResult({ error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="homepage-demo" className="relative py-16 md:py-24 bg-[#070a12] scroll-mt-20">
      {/* Background glow */}
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
            {isLive ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-sm font-medium text-cyan-300">Live AI Receptionist</span>
              </>
            ) : (
              <>
                <Phone className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-300">Sample AI receptionist call</span>
              </>
            )}
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Try the AI Receptionist Live
          </h2>
          <p className="mt-4 text-base text-slate-400 max-w-2xl mx-auto leading-7">
            Speak with a live demo of how AssistantAI answers enquiries, captures leads, and routes follow-up.
          </p>

          {!isLive && (
            <div className="mt-4 inline-flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-300 max-w-xl mx-auto">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>Sample mode:</strong> ElevenLabs Agent ID not configured. This shows a sample transcript.{' '}
                Set <code className="font-mono text-xs bg-white/10 px-1 py-0.5 rounded">VITE_ELEVENLABS_AGENT_ID</code> to enable live voice.
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
          className="rounded-[28px] border border-white/10 bg-[#0b0f18]/90 overflow-hidden shadow-[0_24px_90px_rgba(6,182,212,0.10)] backdrop-blur-xl"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          {/* Live ElevenLabs widget area */}
          {isLive && status === 'active' && (
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
                  onClick={endCall}
                  className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-300 hover:bg-red-500/20 transition-colors"
                >
                  <PhoneOff className="h-3.5 w-3.5" />
                  End Call
                </button>
              </div>
              {/* ElevenLabs embeddable widget */}
              <div className="rounded-2xl overflow-hidden bg-black/30 min-h-[120px] flex items-center justify-center">
                <elevenlabs-convai agent-id={ELEVENLABS_AGENT_ID} className="w-full" />
              </div>
            </div>
          )}

          {/* Sample transcript (shown when not live or not active) */}
          {(!isLive || status === 'idle' || status === 'ended' || status === 'error') && (
            <div className="p-6 border-b border-white/8">
              <div className="mb-3 flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest">
                <Phone className="h-3 w-3 text-cyan-400" />
                {isLive ? 'Previous session ended' : 'Sample call transcript'}
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

          {/* Loading state */}
          {status === 'loading' && (
            <div className="px-6 py-8 flex flex-col items-center gap-3 text-slate-300">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              <p className="text-sm">Connecting to AI receptionist…</p>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="px-6 py-4 flex items-start gap-3 bg-red-500/5 border-t border-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-300">{errorMsg}</p>
            </div>
          )}

          {/* Mic permission warning */}
          {micPermission === 'denied' && isLive && (
            <div className="px-6 py-3 flex items-start gap-3 bg-amber-400/5 border-t border-amber-400/10">
              <MicOff className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-300">
                Microphone access is blocked. Allow microphone access to speak with the AI receptionist.
              </p>
            </div>
          )}

          {micPermission === 'unknown' && isLive && status === 'idle' && (
            <div className="px-6 py-3 flex items-start gap-3 bg-cyan-400/5 border-t border-cyan-400/10">
              <Mic className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
              <p className="text-sm text-cyan-200">Allow microphone access to speak with the AI receptionist.</p>
            </div>
          )}

          {/* Lead capture success */}
          {leadCaptured && (
            <div className="px-6 py-4 flex items-start gap-3 bg-emerald-500/5 border-t border-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-sm text-emerald-300">Your details have been captured. Our team will be in touch shortly.</p>
            </div>
          )}

          {/* Lead form (post-call capture) */}
          {showLeadForm && !leadCaptured && (
            <div className="p-6 border-t border-white/8">
              <p className="text-sm font-medium text-white mb-4">Capture your demo enquiry details</p>
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
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {submitting ? 'Sending…' : 'Send My Details'}
                </Button>
              </form>
            </div>
          )}

          {/* CTA buttons */}
          <div className="p-6 border-t border-white/8">
            <div className="flex flex-col sm:flex-row gap-3">
              {isLive && status !== 'active' && (
                <Button
                  onClick={handleStartDemo}
                  disabled={micPermission === 'denied' || status === 'loading'}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mic className="h-4 w-4" />
                  {status === 'ended' ? 'Start New Session' : 'Start Live Demo'}
                </Button>
              )}
              {!isLive && (
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
              {isLive
                ? 'Live voice demo. Your enquiry details may be captured for follow-up.'
                : 'No commitment. 30 minutes. Real results. Set VITE_ELEVENLABS_AGENT_ID to enable live voice.'}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}