import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, PhoneOff, Radio, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LIVEKIT_SDK_URL = 'https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js';
const CONNECTION_TIMEOUT_MS = 15000;

let liveKitLoadPromise;

function loadLiveKitSdk() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Browser unavailable'));
  if (window.LivekitClient) return Promise.resolve