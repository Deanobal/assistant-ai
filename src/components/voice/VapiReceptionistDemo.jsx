import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, MicOff, Phone, PhoneOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VapiReceptionistDemo() {
  const vapiRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('Talk to our AI receptionist about pricing, plan fit, signup, and onboarding.');

  const config = useMemo(() => ({
    publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY,
    assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID,
    hasElevenLabsBackup: Boolean(import.meta.env.VITE_ELEVENLABS_AGENT_ID),
  }), []);

  const isReady = Boolean(config.publicKey && config.assistantId);

  useEffect(() => {
    if (!isReady || vapiRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js';
    script.async = true;
    script.onload = () => {
      if (window.vapiSDK) {
        vapiRef.current = window.vapiSDK.run({
          apiKey: config.publicKey,
          assistant: config.assistantId,
          config: { position: 'bottom-right' },
        });
        setMessage('Vapi AI receptionist is ready. Start a call to qualify your plan fit.');
      }
    };
    script.onerror = () => setMessage('Vapi voice demo could not load. Please try again shortly.');
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [config.assistantId, config.publicKey, isReady]);

  const startCall = () => {
    if (!isReady) {
      setMessage('Vapi is not configured yet. ElevenLabs remains available as an optional backup voice provider.');
      return;
    }
    setStatus('starting');
    setMessage('Opening Vapi receptionist. If prompted, allow microphone access.');
    vapiRef.current?.start?.(config.assistantId);
    setStatus('live');
  };

  const stopCall = () => {
    vapiRef.current?.stop?.();
    setStatus('idle');
    setMessage('Call ended. You can restart the AI receptionist anytime.');
  };

  return (
    <section id="live-demo" className="rounded-3xl border border-cyan-500/20 bg-[#0f1724] p-6 md:p-8 text-white shadow-2xl shadow-cyan-950/30">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" /> Vapi-powered AI receptionist
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">Talk to Our AI Receptionist</h2>
          <p className="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-slate-300">It can explain AssistantAI, qualify your needs, recommend Starter, Growth, or Enterprise, and create a secure checkout only after you confirm your selected plan.</p>
          <p className="mt-3 text-sm text-slate-400">{message}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <Button onClick={startCall} className="rounded-full bg-cyan-500 px-6 hover:bg-cyan-400" disabled={status === 'live'}>
            {status === 'live' ? <Mic className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
            Talk to Our AI Receptionist
          </Button>
          <Button onClick={stopCall} variant="outline" className="rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10" disabled={status !== 'live'}>
            <PhoneOff className="h-4 w-4" /> End Call
          </Button>
        </div>
      </div>
      {!isReady && (
        <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          Vapi config is missing. ElevenLabs remains configured as an optional backup/premium voice test provider, but the primary public demo requires Vapi.
        </div>
      )}
    </section>
  );
}