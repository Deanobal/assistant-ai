import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const SESSION_KEY = 'assistantai_session_id';
const VISITOR_KEY = 'assistantai_visitor_id';

function getOrCreateStorageValue(key) {
  if (typeof window === 'undefined') return '';
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const value = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(key, value);
  return value;
}

function getSessionId() {
  if (typeof window === 'undefined') return '';
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const value = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.sessionStorage.setItem(SESSION_KEY, value);
  return value;
}

function getDeviceType() {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return 'tablet';
  if (/mobile|iphone|android/.test(ua)) return 'mobile';
  return 'desktop';
}

function readUtm(searchParams, key) {
  return searchParams.get(key) || '';
}

function trackEvent(payload) {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon('/api/analytics-track', blob);
    return;
  }

  fetch('/api/analytics-track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}

export default function SiteAnalyticsTracker() {
  const location = useLocation();
  const lastPathRef = useRef('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = `${location.pathname}${location.search}`;
    if (lastPathRef.current === path) return;
    lastPathRef.current = path;

    const searchParams = new URLSearchParams(location.search);
    const payload = {
      event_type: 'page_view',
      page_path: location.pathname,
      page_title: document.title,
      referrer: document.referrer || '',
      session_id: getSessionId(),
      visitor_id: getOrCreateStorageValue(VISITOR_KEY),
      utm_source: readUtm(searchParams, 'utm_source'),
      utm_medium: readUtm(searchParams, 'utm_medium'),
      utm_campaign: readUtm(searchParams, 'utm_campaign'),
      device_type: getDeviceType(),
      screen: typeof window.screen !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      language: navigator.language || '',
    };

    window.setTimeout(() => trackEvent(payload), 250);
  }, [location.pathname, location.search]);

  return null;
}
