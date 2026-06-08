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
    event_category: payload.metadata?.tag || payload.metadata?.intent || 'site_interaction',
    event_label: payload.metadata?.label || payload.page_path,
    page_path: payload.page_path,
    link_url: payload.metadata?.href || '',
    cta_intent: payload.metadata?.intent || '',
    commercial_stage: payload.metadata?.stage || '',
    source_section: payload.metadata?.section || '',
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

function classifyConversionIntent({ href = '', label = '', pathname = '' }) {
  const joined = `${label} ${href} ${pathname}`;
  if (/AIDemo|Talk to Our AI Receptionist|voice demo|live demo|receptionist demo/i.test(joined)) {
    return { event_type: 'demo_intent', intent: 'voice_demo', stage: 'consideration' };
  }
  if (/GetStartedNow|Get Started|sign up|secure checkout|checkout|stripe/i.test(joined)) {
    return { event_type: 'signup_intent', intent: 'get_started', stage: 'conversion' };
  }
  if (/Pricing|View Pricing|price|plans/i.test(joined)) {
    return { event_type: 'pricing_intent', intent: 'pricing_view', stage: 'evaluation' };
  }
  if (/BookStrategyCall|Book Strategy|strategy call|consultation/i.test(joined)) {
    return { event_type: 'strategy_call_intent', intent: 'book_strategy_call', stage: 'conversion' };
  }
  if (/Contact|contact|sales@assistantai/i.test(joined)) {
    return { event_type: 'contact_intent', intent: 'contact_sales', stage: 'conversion' };
  }
  if (/ai-receptionist|missed-call|lead-follow-up|appointment-booking|phone-assistant/i.test(href)) {
    return { event_type: 'solution_page_click', intent: 'solution_research', stage: 'consideration' };
  }
  return null;
}

function classifyClick(element, location) {
  const href = element.getAttribute('href') || '';
  const label = cleanLabel(element.getAttribute('aria-label') || element.innerText || element.value || href || element.tagName);
  const explicitEvent = element.getAttribute('data-analytics-event');
  const explicitIntent = element.getAttribute('data-analytics-intent');
  const explicitSection = element.getAttribute('data-analytics-section') || element.closest('[data-analytics-section]')?.getAttribute('data-analytics-section') || '';
  const explicitStage = element.getAttribute('data-analytics-stage');
  const conversion = classifyConversionIntent({ href, label, pathname: location.pathname });
  const ctaPattern = /get started|pricing|contact|demo|call|checkout|strategy|book|receptionist|sign up|start/i;
  const hrefPattern = /GetStartedNow|Pricing|Contact|AIDemo|BookStrategyCall|checkout|stripe/i;
  const isCta = Boolean(conversion) || ctaPattern.test(label) || hrefPattern.test(href) || explicitEvent;

  return {
    event_type: explicitEvent || conversion?.event_type || (isCta ? 'cta_click' : 'nav_click'),
    label,
    href,
    intent: explicitIntent || conversion?.intent || '',
    stage: explicitStage || conversion?.stage || '',
    section: explicitSection,
  };
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

    window.AssistantAIAnalytics = {
      track: (eventType, metadata = {}) => trackEvent({
        ...basePayload(location),
        event_type: eventType,
        metadata,
      }),
    };

    const handleClick = (event) => {
      const element = getClickableElement(event.target);
      if (!element) return;
      const clickData = classifyClick(element, location);
      trackEvent({
        ...basePayload(location),
        event_type: clickData.event_type,
        metadata: {
          label: clickData.label,
          href: clickData.href,
          tag: element.tagName?.toLowerCase(),
          intent: clickData.intent,
          stage: clickData.stage,
          section: clickData.section,
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
          intent: 'form_submission',
          stage: 'conversion',
        },
      });
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('submit', handleSubmit, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('submit', handleSubmit, true);
      if (window.AssistantAIAnalytics) delete window.AssistantAIAnalytics;
    };
  }, [location.pathname, location.search]);

  return null;
}