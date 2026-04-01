function getWindowGtag() {
  if (typeof window === 'undefined') return null;
  return typeof window.gtag === 'function' ? window.gtag : null;
}

function getDataLayer() {
  if (typeof window === 'undefined') return null;
  if (!window.dataLayer) window.dataLayer = [];
  return window.dataLayer;
}

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase();
}

function buildLeadDedupKey({ eventName, formType, leadId, email, phone, pagePath }) {
  return [
    eventName,
    formType,
    normalizeValue(leadId),
    normalizeValue(email),
    normalizeValue(phone),
    normalizeValue(pagePath),
  ].join('|');
}

function alreadyTracked(key) {
  if (typeof window === 'undefined') return false;
  window.__assistantAiTrackedLeadEvents = window.__assistantAiTrackedLeadEvents || new Set();
  if (window.__assistantAiTrackedLeadEvents.has(key)) return true;
  window.__assistantAiTrackedLeadEvents.add(key);
  return false;
}

function pushTrackingEvent(eventName, payload) {
  const dataLayer = getDataLayer();
  if (dataLayer) {
    dataLayer.push({
      event: eventName,
      ...payload,
    });
  }

  const gtag = getWindowGtag();
  if (gtag) {
    gtag('event', eventName, payload);
  }
}

export function trackLeadSuccess({
  lead,
  form,
  formType,
  strategyCallRequested = false,
  strategyCallBooked = false,
}) {
  const payload = {
    form_type: formType,
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    lead_id: lead?.id || '',
    enquiry_type: lead?.enquiry_type || '',
    source_page: lead?.source_page || '',
    industry: lead?.industry || '',
    booking_intent: !!lead?.booking_intent,
    booking_status: lead?.booking_status || '',
    has_email: !!form?.email,
    has_phone: !!form?.mobile_number,
  };

  const baseKey = {
    formType,
    leadId: lead?.id,
    email: form?.email,
    phone: form?.mobile_number,
    pagePath: payload.page_path,
  };

  const generateLeadKey = buildLeadDedupKey({ ...baseKey, eventName: 'generate_lead' });
  if (!alreadyTracked(generateLeadKey)) {
    pushTrackingEvent('generate_lead', payload);
  }

  if (strategyCallRequested) {
    const strategyRequestKey = buildLeadDedupKey({ ...baseKey, eventName: 'strategy_call_request' });
    if (!alreadyTracked(strategyRequestKey)) {
      pushTrackingEvent('strategy_call_request', payload);
    }
  }

  if (strategyCallBooked) {
    const strategyBookedKey = buildLeadDedupKey({ ...baseKey, eventName: 'strategy_call_booked' });
    if (!alreadyTracked(strategyBookedKey)) {
      pushTrackingEvent('strategy_call_booked', payload);
    }
  }
}