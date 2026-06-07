function startOfWindow(hours, endDate = new Date()) {
  return new Date(endDate.getTime() - hours * 60 * 60 * 1000).toISOString();
}

function parseRange(value) {
  const ranges = {
    '1h': { label: 'Last hour', hours: 1, bucket: 'minute15' },
    '8h': { label: 'Last 8 hours', hours: 8, bucket: 'hour' },
    '24h': { label: 'Last 24 hours', hours: 24, bucket: 'hour' },
    '7d': { label: 'Last 7 days', hours: 24 * 7, bucket: 'day' },
    '30d': { label: 'Last 30 days', hours: 24 * 30, bucket: 'day' },
  };
  return ranges[value] || ranges['24h'];
}

async function supabaseSelect({ url, key, table, query }) {
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : [];
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
}

function uniqueCount(rows, field) {
  return new Set(rows.map((row) => row[field]).filter(Boolean)).size;
}

function groupCount(rows, field, limit = 8) {
  const counts = new Map();
  rows.forEach((row) => {
    const key = row[field] || 'Unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, limit);
}

function groupByMetadata(rows, key, limit = 8) {
  const counts = new Map();
  rows.forEach((row) => {
    const value = row.metadata?.[key] || 'Unknown';
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  return Array.from(counts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, limit);
}

function bucketKey(dateValue, bucket) {
  const date = new Date(dateValue);
  if (bucket === 'minute15') date.setMinutes(Math.floor(date.getMinutes() / 15) * 15, 0, 0);
  else if (bucket === 'day') date.setHours(0, 0, 0, 0);
  else date.setMinutes(0, 0, 0);
  return date.toISOString();
}

function bucketStepMs(bucket) {
  if (bucket === 'minute15') return 15 * 60 * 1000;
  if (bucket === 'day') return 24 * 60 * 60 * 1000;
  return 60 * 60 * 1000;
}

function timeSeries(rows, range) {
  const buckets = new Map();
  const end = new Date();
  const start = new Date(Date.now() - range.hours * 60 * 60 * 1000);
  const step = bucketStepMs(range.bucket);
  const first = new Date(bucketKey(start, range.bucket));
  for (let time = first.getTime(); time <= end.getTime(); time += step) buckets.set(new Date(time).toISOString(), 0);
  rows.forEach((row) => {
    const key = bucketKey(row.created_at, range.bucket);
    if (buckets.has(key)) buckets.set(key, buckets.get(key) + 1);
  });
  return Array.from(buckets.entries()).map(([time, count]) => ({ time, count }));
}

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 1000) / 10;
}

function delta(current, previous) {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function safeLimitForHours(hours) {
  if (hours <= 8) return 5000;
  if (hours <= 24) return 10000;
  if (hours <= 24 * 7) return 25000;
  return 50000;
}

function buildMetrics({ events, previousEvents, liveEvents, leads, previousLeads, calls, previousCalls }) {
  const pageViews = events.filter((event) => event.event_type === 'page_view');
  const previousPageViews = previousEvents.filter((event) => event.event_type === 'page_view');
  const clicks = events.filter((event) => ['cta_click', 'nav_click', 'button_click'].includes(event.event_type));
  const previousClicks = previousEvents.filter((event) => ['cta_click', 'nav_click', 'button_click'].includes(event.event_type));
  const formSubmits = events.filter((event) => event.event_type === 'form_submit');
  const checkoutStarts = events.filter((event) => event.page_path?.includes('/GetStartedNow') || event.metadata?.href?.includes('/GetStartedNow'));
  const visitors = uniqueCount(events, 'visitor_id') || uniqueCount(events, 'session_id');
  const previousVisitors = uniqueCount(previousEvents, 'visitor_id') || uniqueCount(previousEvents, 'session_id');
  const sessions = uniqueCount(events, 'session_id');
  const previousSessions = uniqueCount(previousEvents, 'session_id');
  const activeVisitors = uniqueCount(liveEvents, 'visitor_id') || uniqueCount(liveEvents, 'session_id');
  const conversionRate = percent(leads.length, visitors || sessions);
  const previousConversionRate = percent(previousLeads.length, previousVisitors || previousSessions);
  return {
    active_visitors: activeVisitors,
    visitors,
    sessions,
    page_views: pageViews.length,
    clicks: clicks.length,
    form_submits: formSubmits.length,
    checkout_starts: checkoutStarts.length,
    leads: leads.length,
    calls: calls.length,
    conversion_rate: conversionRate,
    avg_pages_per_session: sessions ? Math.round((pageViews.length / sessions) * 10) / 10 : 0,
    deltas: {
      visitors: delta(visitors, previousVisitors),
      sessions: delta(sessions, previousSessions),
      page_views: delta(pageViews.length, previousPageViews.length),
      clicks: delta(clicks.length, previousClicks.length),
      leads: delta(leads.length, previousLeads.length),
      calls: delta(calls.length, previousCalls.length),
      conversion_rate: delta(conversionRate, previousConversionRate),
    }
  };
}

function buildFunnel(metrics) {
  return [
    { name: 'Visitors', count: metrics.visitors, rate: 100 },
    { name: 'Sessions', count: metrics.sessions, rate: percent(metrics.sessions, metrics.visitors) },
    { name: 'CTA clicks', count: metrics.clicks, rate: percent(metrics.clicks, metrics.sessions || metrics.visitors) },
    { name: 'Checkout starts', count: metrics.checkout_starts, rate: percent(metrics.checkout_starts, metrics.sessions || metrics.visitors) },
    { name: 'Leads captured', count: metrics.leads, rate: percent(metrics.leads, metrics.visitors || metrics.sessions) },
  ];
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  try {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return res.status(500).json({ error: 'Analytics database configuration missing' });
    const rangeKey = req.query?.range || '24h';
    const selectedRange = parseRange(rangeKey);
    const end = new Date();
    const sinceCurrent = startOfWindow(selectedRange.hours, end);
    const sincePrevious = startOfWindow(selectedRange.hours * 2, end);
    const liveSince = startOfWindow(0.5, end);
    const limit = safeLimitForHours(selectedRange.hours);

    let events = [], previousEvents = [], leads = [], previousLeads = [], calls = [], previousCalls = [];
    try {
      const allEvents = await supabaseSelect({ url, key, table: 'site_events', query: `select=created_at,session_id,visitor_id,event_type,page_path,page_title,referrer,utm_source,utm_medium,utm_campaign,device_type,browser,os,country,region,city,metadata&created_at=gte.${encodeURIComponent(sincePrevious)}&order=created_at.desc&limit=${limit}` });
      events = allEvents.filter((event) => new Date(event.created_at) >= new Date(sinceCurrent));
      previousEvents = allEvents.filter((event) => new Date(event.created_at) < new Date(sinceCurrent));
    } catch (_error) {}
    try {
      const allLeads = await supabaseSelect({ url, key, table: 'leads', query: `select=id,created_at,status,selected_plan,buyer_intent,source_page,lead_source&created_at=gte.${encodeURIComponent(sincePrevious)}&order=created_at.desc&limit=5000` });
      leads = allLeads.filter((lead) => new Date(lead.created_at) >= new Date(sinceCurrent));
      previousLeads = allLeads.filter((lead) => new Date(lead.created_at) < new Date(sinceCurrent));
    } catch (_error) {}
    try {
      const allCalls = await supabaseSelect({ url, key, table: 'call_records', query: `select=id,created_at,status,call_status,call_duration_seconds,assistant_id&created_at=gte.${encodeURIComponent(sincePrevious)}&order=created_at.desc&limit=5000` });
      calls = allCalls.filter((call) => new Date(call.created_at) >= new Date(sinceCurrent));
      previousCalls = allCalls.filter((call) => new Date(call.created_at) < new Date(sinceCurrent));
    } catch (_error) {}

    const liveEvents = events.filter((event) => new Date(event.created_at) >= new Date(liveSince));
    const pageViews = events.filter((event) => event.event_type === 'page_view');
    const clickEvents = events.filter((event) => ['cta_click', 'nav_click', 'button_click'].includes(event.event_type));
    const metrics = buildMetrics({ events, previousEvents, liveEvents, leads, previousLeads, calls, previousCalls });
    return res.status(200).json({
      success: true,
      generated_at: new Date().toISOString(),
      range: { label: selectedRange.label, key: rangeKey, hours: selectedRange.hours, bucket: selectedRange.bucket, active_minutes: 30, since: sinceCurrent, previous_since: sincePrevious },
      metrics,
      funnel: buildFunnel(metrics),
      series: { page_views: timeSeries(pageViews, selectedRange), clicks: timeSeries(clickEvents, selectedRange) },
      breakdowns: {
        live_pages: groupCount(liveEvents, 'page_path', 8),
        top_pages: groupCount(pageViews, 'page_path', 12),
        referrers: groupCount(events.filter((event) => event.referrer), 'referrer', 10),
        sources: groupCount(events.filter((event) => event.utm_source), 'utm_source', 10),
        campaigns: groupCount(events.filter((event) => event.utm_campaign), 'utm_campaign', 10),
        devices: groupCount(events, 'device_type', 6),
        browsers: groupCount(events, 'browser', 6),
        operating_systems: groupCount(events, 'os', 6),
        countries: groupCount(events, 'country', 10),
        cities: groupCount(events, 'city', 10),
        event_types: groupCount(events, 'event_type', 8),
        cta_labels: groupByMetadata(clickEvents, 'label', 10),
      },
      recent: { events: events.slice(0, 30), leads: leads.slice(0, 12), calls: calls.slice(0, 12) }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Analytics summary failed', details: error.message });
  }
}
