import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FALLBACK_MESSAGE = 'Our live voice demo is being connected. You can still get started or leave your details and we’ll send access.';
const VAPI_SDK_SOURCES = [
  'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js',
  'https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.umd.js',
];

const BUILD_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || '';
const BUILD_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID || '';

let sdkLoadPromise;

function getLoadedVapiConstructor() {
  return window?.Vapi || window?.vapiSDK?.Vapi || window?.vapiSDK || window?.VapiAI || null;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      if (getLoadedVapiConstructor()) resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

async function loadVapiSdk() {
  if (typeof window === 'undefined') throw new Error('Browser unavailable');

  const existing = getLoadedVapiConstructor();
  if (existing) return existing;

  if (!sdkLoadPromise) {
    sdkLoadPromise = (async () => {
      let lastError;
      for (const src of VAPI_SDK_SOURCES) {
        try {
          await loadScript(src);
          const loaded = getLoadedVapiConstructor();
          if (loaded) return loaded;
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError || new Error('Vapi SDK unavailable');
    })();
  }

  return sdkLoadPromise;
}

async function getRuntimeConfig() {
  try {
    const response = await fetch('/api/config-status', { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    const vapiVariables = data?.status?.vapi?.variables || [];
    const hasPublicKey = vapiVariables.some((item) => item.name === 'VITE_VAPI_PUBLIC_KEY' && item.present);
    const hasAssistantId = vapiVariables.some((item) => item.name === 'VITE_VAPI_ASSISTANT_ID' && item.present);
    return { hasPublicKey, hasAssistantId };
  } catch (_error) {
    return null;
  }
}

export default function VapiReceptionistDemoButton({ className = '', variant = 'primary', showFallbackText = false }) {
  const vapiRef = useRef(null);
  const [status, setStatus] = useState('checking');
  const [fallbackVisible, setFallbackVisible] = useState(false);
  const [runtimeConfigured, setRuntimeConfigured] = useState(Boolean(BUILD_PUBLIC_KEY && BUILD_ASSISTANT_ID));

  const publicKey = useMemo(() => BUILD_PUBLIC_KEY, []);
  const assistantId = useMemo(() => BUILD_ASSISTANT_ID, []);
  const hasBuildConfig = Boolean(publicKey && assistantId);
  const isConfigured = hasBuildConfig || runtimeConfigured;
  const isLive = status === 'listening';
  const isBusy = status === 'connecting' || status === 'checking';

  useEffect(() => {
    let cancelled = false;

    async function checkConfig() {
      const runtime = await getRuntimeConfig();
      if (cancelled) return;
      const configured = Boolean(hasBuildConfig || (runtime?.hasPublicKey && runtime?.hasAssistantId));
      setRuntimeConfigured(configured);
      setStatus('idle');
      setFallbackVisible(!configured);
    }

    checkConfig();

    return () => {
      cancelled = true;
      vapiRef.current?.stop?.();
    };
  }, [hasBuildConfig]);

  const buttonLabel = status === 'checking'
    ? 'Checking Demo...'
    : status === 'connecting'
      ? 'Connecting...'
      : isLive
        ? 'End Call'
        : (!isConfigured || fallbackVisible)
          ? 'Demo Temporarily Connecting'
          : 'Talk to Our AI Receptionist';

  const handleClick = async () => {
    if (!hasBuildConfig) {
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
      const VapiConstructor = await loadVapiSdk();
      if (!VapiConstructor) throw new Error('Vapi unavailable');

      if (!vapiRef.current) {
        if (typeof VapiConstructor === 'function') {
          vapiRef.current = new VapiConstructor(publicKey);
        } else if (typeof VapiConstructor.run === 'function') {
          vapiRef.current = VapiConstructor.run({ apiKey: publicKey });
        } else {
          throw new Error('Unsupported Vapi SDK shape');
        }

        vapiRef.current?.on?.('call-start', () => setStatus('listening'));
        vapiRef.current?.on?.('call-end', () => setStatus('idle'));
        vapiRef.current?.on?.('error', () => {
          setStatus('unavailable');
          setFallbackVisible(true);
        });
      }

      await vapiRef.current?.start?.(assistantId, {
        firstMessage: 'Hi, you’re speaking with the AssistantAI.com.au demo receptionist. I can explain pricing, recommend Starter or Growth, and escalate Enterprise needs for review.',
      });

      setStatus('listening');
    } catch (_error) {
      setStatus('unavailable');
      setFallbackVisible(true);
    }
  };

  const baseClass = variant === 'secondary'
    ? 'border border-white/15 bg-white/[0.04] text-white hover:border-white/30 hover:bg-white/[0.08]'
    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25';

  const Icon = isLive ? PhoneOff : status === 'connecting' ? Mic : Phone;

  return (
    <div className="flex flex-col items-center gap-2 sm:items-start">
      <Button
        type="button"
        onClick={handleClick}
        disabled={isBusy || !isConfigured}
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
