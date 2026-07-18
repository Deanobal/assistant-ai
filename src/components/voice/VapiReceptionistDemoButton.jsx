import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FALLBACK_MESSAGE = 'Our live voice demo is being connected. You can still get started or leave your details and we’ll send access.';
const CALL_START_TIMEOUT_MS = 12000;
const PRODUCTION_REBUILD_MARK = 'vapi-esm-loader-2026-07-19';
const VAPI_SDK_MODULE = 'https://esm.sh/@vapi-ai/web';

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
    sdkLoadPromise = import(/* @vite-ignore */ VAPI_SDK_MODULE).then((module) => {
      const VapiConstructor = module.default || module.Vapi;
      if (!VapiConstructor) throw new Error('Vapi Web SDK unavailable');
      return VapiConstructor;
    });
  }

  return sdkLoadPromise;
}

async function requestMicrophonePermission() {
  if (!navigator?.mediaDevices?.getUserMedia) {
    throw new Error('This browser does not support microphone access. Try Chrome on desktop or mobile.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((track) => track.stop());
}

function getButtonLabel(status) {
  if (status === 'connecting') return 'Connecting...';
  if (status === 'ending') return 'Ending Call...';
  if (status === 'listening') return 'End Call';
  return 'Talk to Our AI Receptionist';
}

export default function VapiReceptionistDemoButton({ className = '', variant = 'primary', showFallbackText = false }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const vapiRef = useRef(null);
  const timeoutRef = useRef(null);
  const callStartedRef = useRef(false);
  const listenersBoundRef = useRef(false);

  const publicKey = useMemo(() => import.meta.env.VITE_VAPI_PUBLIC_KEY || '', []);
  const assistantId = useMemo(() => import.meta.env.VITE_VAPI_ASSISTANT_ID || '', []);
  const isReady = Boolean(publicKey && assistantId);

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current);
      try {
        vapiRef.current?.stop?.();
      } catch (_error) {
        // Best-effort cleanup only.
      }
    };
  }, []);

  const handleStart = async () => {
    if (!isReady) {
      setMessage('The live demo is not configured in this deployment yet.');
      return;
    }

    try {
      setMessage('');
      setStatus('connecting');
      callStartedRef.current = false;

      await requestMicrophonePermission();
      const Vapi = await loadVapiSdk();
      const vapi = vapiRef.current || new Vapi(publicKey);
      vapiRef.current = vapi;

      if (!listenersBoundRef.current) {
        vapi.on?.('call-start', () => {
          callStartedRef.current = true;
          window.clearTimeout(timeoutRef.current);
          setStatus('listening');
          setMessage('');
        });

        vapi.on?.('call-end', () => {
          callStartedRef.current = false;
          window.clearTimeout(timeoutRef.current);
          setStatus('idle');
        });

        vapi.on?.('error', (error) => {
          callStartedRef.current = false;
          window.clearTimeout(timeoutRef.current);
          setStatus('idle');
          setMessage(`Vapi error: ${formatError(error)}`);
          console.error('[AssistantAI Vapi demo error]', error);
        });

        listenersBoundRef.current = true;
      }

      timeoutRef.current = window.setTimeout(() => {
        if (!callStartedRef.current) {
          setMessage('Microphone access was granted, but the call did not start. Please try again shortly.');
          setStatus('idle');
          vapiRef.current?.stop?.();
        }
      }, CALL_START_TIMEOUT_MS);

      await vapi.start(assistantId);
    } catch (error) {
      callStartedRef.current = false;
      window.clearTimeout(timeoutRef.current);
      setStatus('idle');

      const detail = error?.name === 'NotAllowedError'
        ? 'Microphone permission was blocked. Allow microphone access in your browser and try again.'
        : `Vapi start failed: ${formatError(error)}`;

      setMessage(detail);
      console.error('[AssistantAI Vapi demo start failed]', error);
    }
  };

  const handleStop = async () => {
    try {
      setStatus('ending');
      callStartedRef.current = false;
      window.clearTimeout(timeoutRef.current);
      await vapiRef.current?.stop?.();
      setStatus('idle');
    } catch (_error) {
      setStatus('idle');
    }
  };

  const handleClick = () => {
    if (status === 'listening' || status === 'connecting') {
      handleStop();
      return;
    }

    handleStart();
  };

  const baseClass = variant === 'secondary'
    ? 'border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]'
    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25';

  return (
    <div className={className} data-build={PRODUCTION_REBUILD_MARK}>
      <Button
        type="button"
        onClick={handleClick}
        disabled={status === 'ending'}
        className={`inline-flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold transition-all sm:w-auto ${baseClass}`}
      >
        {status === 'listening' ? <PhoneOff className="h-4 w-4" /> : status === 'connecting' ? <Phone className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        {getButtonLabel(status)}
      </Button>

      {status === 'connecting' && (
        <p className="mt-3 max-w-sm text-sm leading-6 text-cyan-300">Requesting microphone access and starting the live demo...</p>
      )}

      {status === 'listening' && (
        <p className="mt-3 max-w-sm text-sm leading-6 text-cyan-300">Listening...</p>
      )}

      {(showFallbackText || message) && message && (
        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">{message || FALLBACK_MESSAGE}</p>
      )}
    </div>
  );
}
