import React, { useEffect, useRef, useState } from 'react';
import { Mic, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FALLBACK_MESSAGE = 'Our live voice demo is being connected. You can still get started or leave your details and we’ll send access.';
const CALL_START_TIMEOUT_MS = 12000;
const PRODUCTION_REBUILD_MARK = 'vapi-demo-restored-2026-07-16';
const VAPI_SDK_URL = 'https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.umd.js';

let sdkLoadPromise;

function loadVapiSdk() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Browser unavailable'));
  if (window.Vapi) return Promise.resolve(window.Vapi);

  if (!sdkLoadPromise) {
    sdkLoadPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${VAPI_SDK_URL}"]`);

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.Vapi), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Vapi SDK failed to load')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = VAPI_SDK_URL;
      script.async = true;
      script.onload = () => {
        if (window.Vapi) resolve(window.Vapi);
        else reject(new Error('Vapi SDK loaded without exposing Vapi'));
      };
      script.onerror = () => reject(new Error('Vapi SDK failed to load'));
      document.head.appendChild(script);
    });
  }

  return sdkLoadPromise;
}

function getButtonLabel(status) {
  if (status === 'connecting') return 'Connecting...';
  if (status === 'listening') return 'Listening...';
  if (status === 'ending') return 'Ending Call...';
  return 'Talk to Our AI Receptionist';
}

export default function VapiReceptionistDemoButton({ className = '', variant = 'primary', showFallbackText = false }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const vapiRef = useRef(null);
  const timeoutRef = useRef(null);

  const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
  const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;
  const isReady = Boolean(publicKey && assistantId);
  const isActive = status === 'connecting' || status === 'listening' || status === 'ending';

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current);
      try {
        vapiRef.current?.stop?.();
      } catch (_error) {}
    };
  }, []);

  const handleStart = async () => {
    if (!isReady) {
      setMessage(FALLBACK_MESSAGE);
      return;
    }

    try {
      setMessage('');
      setStatus('connecting');

      const Vapi = await loadVapiSdk();
      const vapi = vapiRef.current || new Vapi(publicKey);
      vapiRef.current = vapi;

      vapi.on?.('call-start', () => {
        window.clearTimeout(timeoutRef.current);
        setStatus('listening');
      });

      vapi.on?.('call-end', () => {
        window.clearTimeout(timeoutRef.current);
        setStatus('idle');
      });

      vapi.on?.('error', (error) => {
        window.clearTimeout(timeoutRef.current);
        setStatus('idle');
        setMessage(error?.message || FALLBACK_MESSAGE);
      });

      timeoutRef.current = window.setTimeout(() => {
        if (status !== 'listening') {
          setMessage('Demo temporarily connecting. Please allow microphone access or try again shortly.');
          setStatus('idle');
        }
      }, CALL_START_TIMEOUT_MS);

      await vapi.start(assistantId);
    } catch (error) {
      window.clearTimeout(timeoutRef.current);
      setStatus('idle');
      setMessage(error?.message || FALLBACK_MESSAGE);
    }
  };

  const handleStop = async () => {
    try {
      setStatus('ending');
      await vapiRef.current?.stop?.();
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
        {status === 'listening' ? 'End Call' : getButtonLabel(status)}
      </Button>

      {(showFallbackText || message) && (
        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
          {message || FALLBACK_MESSAGE}
        </p>
      )}
    </div>
  );
}
