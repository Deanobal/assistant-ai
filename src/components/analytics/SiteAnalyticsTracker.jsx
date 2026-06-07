import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { GA_MEASUREMENT_ID } from '@/lib/googleAnalyticsConfig';

const SESSION_KEY = 'assistantai_session_id';
const VISITOR_KEY = 'assistantai_visitor_id';

function createId() {
  return crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getOrCreateStorageValue(key) {
  if (typeof window === 'undefined') return '';
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const value = createId();
  window.localStorage.setItem(key, value);
  return value;
}

function getSessionId() {
  if (typeof window === 'undefined') return '';
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const value = createId();
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

function basePayload(location) {
  const searchParams = new URLSearchParams(location.search);
  return {
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
}

function trackGoogleEvent(payload) {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  if (payload.event_type === 'page_view') {
    window.gtag('event', 'page_view', {
      page_path: payload.page_path,
      page_title: payload.page_title,
      page_location: window.location.href,
    });
    return;
  }
  window.gtag('event', payload.event_type, {
    event_category: payload.metadata?.tag || 'site_interaction',
    event_label: payload.metadata?.label || payload.page_path,
    page_path: payload.page_path,
    link_url: payload.metadata?.href || '',
  });
}

function trackEvent(payload) {
  trackGoogleEvent(payload);
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

function getClickableElement(target) {
  if (!target?.closest) return null;
  return target.closest('a,button,[role="button"],input[type="submit"]');
}

function cleanLabel(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 120);
}

function classifyClick(element) {
  const href = element.getAttribute('href') || '';
  const label = cleanLabel(element.getAttribute('aria-label') || element.innerText || element.value || href || element.tagName);
  const ctaPattern = /get started|pricing|contact|demo|call|checkout|strategy|book|receptionist|sign up|start/i;
  const hrefPattern = /GetStartedNow|Pricing|Contact|AIDemo|BookStrategyCall|checkout|stripe/i;
  const isCta = ctaPattern.test(label) || hrefPattern.test(href);
  return { event_type: isCta ? 'cta_click' : 'nav_click', label, href };
}

export default function SiteAnalyticsTracker() {
  const location = useLocation();
  const lastPathRef = useRef('');

  useEffect(() => {
    if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || document.getElementById('assistantai-gtag')) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
    const script = document.createElement('script');
    script.id = 'assistantai-gtag';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = `${location.pathname}${location.search}`;
    if (lastPathRef.current === path) return;
    lastPathRef.current = path;

    window.setTimeout(() => trackEvent({
      ...basePayload(location),
      event_type: 'page_view',
    }), 250);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleClick = (event) => {
      const element = getClickableElement(event.target);
      if (!element) return;
      const clickData = classifyClick(element);
      trackEvent({
        ...basePayload(location),
        event_type: clickData.event_type,
        metadata: {
          label: clickData.label,
          href: clickData.href,
          tag: element.tagName?.toLowerCase(),
        },
      });
    };

    const handleSubmit = (event) => {
      const form = event.target;
      trackEvent({
        ...basePayload(location),
        event_type: 'form_submit',
        metadata: {
          form_id: form?.id || '',
          form_name: form?.getAttribute?.('name') || '',
        },
      });
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('submit', handleSubmit, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('submit', handleSubmit, true);
    };
  }, [location.pathname, location.search]);

  return null;
}
