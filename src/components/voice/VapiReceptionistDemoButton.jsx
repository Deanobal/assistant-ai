import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID || '';
const VAPI_SDK_SRC = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js';
const FALLBACK_MESSAGE = 'Our live voice demo is being connected. You can still get started or leave your details and we’ll send access.';

let sdkLoadPromise;

function loadVapiSdk() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Browser unavailable'));
  if (window.vapiSDK) return Promise.resolve(window.vapiSDK);
  if (!sdkLoadPromise) {
    sdkLoadPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${VAPI_SDK_SRC}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve(window.vapiSDK));
        existing.addEventListener('error', reject);
        return;
      }

      const script = document.createElement('script');
      script.src = VAPI_SDK_SRC;
      script.async = true;
      script.onload = () => resolve(window.vapiSDK);
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
  return sdkLoadPromise;
}

export default function VapiReceptionistDemoButton({ className = '', variant = 'primary', showFallbackText = false }) {
  const vapiRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [fallbackVisible, setFallbackVisible] = useState(false);

  const publicKey = useMemo(() => import.meta.env.VITE_VAPI_PUBLIC_KEY || '', []);
  const isConfigured = Boolean(publicKey && VAPI_ASSISTANT_ID);
  const isLive = status === 'listening';
  const isBusy = status === 'connecting';

  useEffect(() => {
    return () => {
      vapiRef.current?.stop?.();
    };
  }, []);

  const buttonLabel = isBusy
    ? 'Connecting...'
    : isLive
      ? 'End Call'
      : (!isConfigured || fallbackVisible)
        ? 'Demo Temporarily Connecting'
        : 'Talk to Our AI Receptionist';

  const handleClick = async () => {
    if (!isConfigured) {
      setFallbackVisible(true);
      return;
    }

    if (isLive) {
      vapiRef.current?.stop?.();
      setStatus('idle');
      return;
    }

    setStatus('connecting');
    setFallbackVisible(false);

    try {
      const sdk = await loadVapiSdk();
      if (!sdk) throw new Error('Vapi unavailable');

      if (!vapiRef.current) {
        vapiRef.current = sdk.run({
          apiKey: publicKey,
          assistant: VAPI_ASSISTANT_ID,
          assistantOverrides: {
            firstMessage: 'Hi, you’re speaking with the AssistantAI.com.au demo receptionist. I can explain pricing, recommend Starter or Growth, and escalate Enterprise needs for review.',
            variableValues: {
              tool_wait_phrases: 'I’ll prepare that now. I’m creating that securely now. I’m just finalising that for you.',
              avoid_tool_wait_phrases: 'This’ll just take a sec. Hold on a sec.',
            },
          },
        });

        vapiRef.current?.on?.('call-start', () => setStatus('listening'));
        vapiRef.current?.on?.('call-end', () => setStatus('idle'));
        vapiRef.current?.on?.('error', () => {
          setStatus('unavailable');
          setFallbackVisible(true);
        });
      }

      await vapiRef.current?.start?.(VAPI_ASSISTANT_ID);
      setStatus('listening');
    } catch {
      setStatus('unavailable');
      setFallbackVisible(true);
    }
  };

  const baseClass = variant === 'secondary'
    ? 'border border-white/15 bg-white/[0.04] text-white hover:border-white/30 hover:bg-white/[0.08]'
    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25';

  const Icon = isLive ? PhoneOff : isBusy ? Mic : Phone;

  return (
    <div className="flex flex-col items-center gap-2 sm:items-start">
      <Button
        type="button"
        onClick={handleClick}
        disabled={isBusy || fallbackVisible || !isConfigured}
        className={`inline-flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-center text-base font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto ${baseClass} ${className}`}
      >
        <Icon className="h-4 w-4" />
        <span>{buttonLabel}</span>
      </Button>
      {(showFallbackText || fallbackVisible) && !isConfigured && (
        <p className="max-w-sm text-sm leading-relaxed text-slate-400">{FALLBACK_MESSAGE}</p>
      )}
      {isLive && (
        <p className="max-w-sm text-sm leading-relaxed text-cyan-300">Listening...</p>
      )}
      {fallbackVisible && isConfigured && (
        <p className="max-w-sm text-sm leading-relaxed text-slate-400">{FALLBACK_MESSAGE}</p>
      )}
    </div>
  );
}