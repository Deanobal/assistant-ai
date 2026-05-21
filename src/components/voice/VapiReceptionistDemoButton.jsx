import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FALLBACK_MESSAGE = 'Our live voice demo is being connected. You can still get started or leave your details and we’ll send access.';
const CALL_START_TIMEOUT_MS = 12000;
const PRODUCTION_REBUILD_MARKER = 'vapi-error-detail-2026-05-22';
const VAPI_SDK_MODULE = 'https://esm.sh/@vapi-ai/web';

const BUILD_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || '';
const BUILD_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID || '';

let sdkLoadPromise;

function formatError(error) {
  if (!error) return 'Unknown Vapi error';
  if (typeof error === 'string') return error;
  const candidates = [
    error.message,
    error.error,
    error.errorMsg,
    error.reason,
    error.statusText,
    error?.response?.message,
    error?.response?.error,
    error?.data?.message,
    error?.data?.error,
  ].filter(Boolean);

  if (candidates.length) return candidates.join(' | ');

  try {
    return JSON.stringify(error).slice(0, 320);
  } catch (_error) {
    return 'Unable to read Vapi error payload';
  }
}

async function loadVapiSdk() {
  if (typeof window === 'undefined') throw new Error('Browser unavailable');

  if (!sdkLoadPromise) {
    sdkLoadPromise = import(/* @vite-ignore */ VAPI_SDK_MODULE).then((module) => module.default || module.Vapi);
  }

  const VapiConstructor = await sdkLoadPromise;
  if (!VapiConstructor) throw new Error('Vapi Web SDK unavailable');
  return VapiConstructor;
}

async function requestMicrophonePermission() {
  if (!navigator?.mediaDevices?.getUserMedia) {
    throw new Error('This browser does not support microphone access. Try Chrome on desktop or mobile.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((track) => track.stop());
  return true;
}

async function getRuntimeConfig() {
  try {
    const response = await fetch(`/api/config-status?marker=${PRODUCTION_REBUILD_MARKER}`, { cache: 'no-store' });
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
  const startTimeoutRef = useRef(null);
  const [status, setStatus] = useState('checking');
  const [fallbackVisible, setFallbackVisible] = useState(false);
  const [runtimeConfigured, setRuntimeConfigured] = useState(Boolean(BUILD_PUBLIC_KEY && BUILD_ASSISTANT_ID));
  const [errorMessage, setErrorMessage] = useState('');

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
      clearTimeout(startTimeoutRef.current);
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
    setErrorMessage('');

    if (!hasBuildConfig) {
      setFallbackVisible(true);
      setErrorMessage('The voice demo configuration is visible to the server but not to this browser build. Redeploy with VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID selected for Production.');
      return;
    }

    if (isLive) {
      clearTimeout(startTimeoutRef.current);
      vapiRef.current?.stop?.();
      setStatus('idle');
      return;
    }

    setStatus('connecting');
    setFallbackVisible(false);

    try {
      await requestMicrophonePermission();

      const VapiConstructor = await loadVapiSdk();

      if (!vapiRef.current) {
        vapiRef.current = new VapiConstructor(publicKey);

        vapiRef.current?.on?.('call-start', () => {
          clearTimeout(startTimeoutRef.current);
          setStatus('listening');
          setFallbackVisible(false);
          setErrorMessage('');
        });

        vapiRef.current?.on?.('call-end', () => {
          clearTimeout(startTimeoutRef.current);
          setStatus('idle');
        });

        vapiRef.current?.on?.('error', (error) => {
          clearTimeout(startTimeoutRef.current);
          setStatus('unavailable');
          setFallbackVisible(true);
          const detail = formatError(error);
          console.error('[AssistantAI Vapi demo error]', error);
          setErrorMessage(`Vapi error: ${detail}`);
        });
      }

      startTimeoutRef.current = window.setTimeout(() => {
        setStatus('unavailable');
        setFallbackVisible(true);
        setErrorMessage('Microphone permission was granted, but Vapi did not start the call. Check Vapi Assistant settings: public/web calls enabled, allowed domain includes assistantai.com.au, and public key is from the same workspace as the assistant.');
        vapiRef.current?.stop?.();
      }, CALL_START_TIMEOUT_MS);

      await vapiRef.current?.start?.(assistantId);
    } catch (error) {
      clearTimeout(startTimeoutRef.current);
      setStatus('unavailable');
      setFallbackVisible(true);
      console.error('[AssistantAI Vapi demo start failed]', error);
      const message = error?.name === 'NotAllowedError'
        ? 'Microphone permission was blocked. Click the lock icon in the address bar, allow microphone access, then refresh and try again.'
        : `Vapi start failed: ${formatError(error)}`;
      setErrorMessage(message);
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
      {status === 'connecting' && (
        <p className="max-w-sm text-sm leading-relaxed text-cyan-300">Requesting microphone access and starting the live demo...</p>
      )}
      {isLive && (
        <p className="max-w-sm text-sm leading-relaxed text-cyan-300">Listening...</p>
      )}
      {fallbackVisible && isConfigured && (
        <p className="max-w-sm text-sm leading-relaxed text-slate-400">{errorMessage || FALLBACK_MESSAGE}</p>
      )}
    </div>
  );
}
