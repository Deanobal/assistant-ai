function startOfWindow(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

async function supabaseSelect({ url, key, table, query }) {
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
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
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function toHourKey(dateValue) {
  const date = new Date(dateValue);
  date.setMinutes(0, 0, 0);
  return date.toISOString();
}

function hourlySeries(rows, hours = 24) {
  const buckets = new Map();
  for (let i = hours - 1; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * 60 * 60 * 1000);
    date.setMinutes(0, 0, 0);
    buckets.set(date.toISOString(), 0);
  }
  rows.forEach((row) => {
    const key = toHourKey(row.created_at);
    if (buckets.has(key)) buckets.set(key, buckets.get(key) + 1);
  });
  return Array.from(buckets.entries()).map(([time, count]) => ({ time, count }));
}

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return res.status(500).json({ error: 'Analytics database configuration missing' });

    const since24 = startOfWindow(24);
    const since30m = startOfWindow(0.5);
    const since7d = startOfWindow(24 * 7);

    let events24 = [];
    let events30m = [];
    let events7d = [];
    let leads24 = [];
    let calls24 = [];

    try {
      events24 = await supabaseSelect({ url, key, table: 'site_events', query: `select=created_at,session_id,visitor_id,event_type,page_path,referrer,utm_source,utm_medium,device_type,browser,country,city&created_at=gte.${encodeURIComponent(since24)}&order=created_at.desc&limit=5000` });
      events30m = events24.filter((event) => new Date(event.created_at).getTime() >= new Date(since30m).getTime());
      events7d = await supabaseSelect({ url, key, table: 'site_events', query: `select=created_at,session_id,visitor_id,event_type,page_path&created_at=gte.${encodeURIComponent(since7d)}&order=created_at.desc&limit=20000` });
    } catch (error) {
      events24 = [];
      events30m = [];
      events7d = [];
    }

    try {
      leads24 = await supabaseSelect({ url, key, table: 'leads', query: `select=id,created_at,status,selected_plan,buyer_intent,source_page&created_at=gte.${encodeURIComponent(since24)}&order=created_at.desc&limit=1000` });
    } catch (_error) {
      leads24 = [];
    }

    try {
      calls24 = await supabaseSelect({ url, key, table: 'call_records', query: `select=id,created_at,status,call_status,call_duration_seconds,assistant_id&created_at=gte.${encodeURIComponent(since24)}&order=created_at.desc&limit=1000` });
    } catch (_error) {
      calls24 = [];
    }

    const pageViews24 = events24.filter((event) => event.event_type === 'page_view');
    const visitors24 = uniqueCount(events24, 'visitor_id') || uniqueCount(events24, 'session_id');
    const activeVisitors = uniqueCount(events30m, 'visitor_id') || uniqueCount(events30m, 'session_id');
    const sessions24 = uniqueCount(events24, 'session_id');
    const leads = leads24.length;
    const calls = calls24.length;
    const conversionRate = percent(leads, visitors24 || sessions24);
    const avgPagesPerSession = sessions24 ? Math.round((pageViews24.length / sessions24) * 10) / 10 : 0;

    const topPages = groupCount(pageViews24, 'page_path', 10);
    const topReferrers = groupCount(events24.filter((event) => event.referrer), 'referrer', 8);
    const topSources = groupCount(events24.filter((event) => event.utm_source), 'utm_source', 8);
    const devices = groupCount(events24, 'device_type', 5);
    const browsers = groupCount(events24, 'browser', 5);
    const countries = groupCount(events24, 'country', 8);
    const livePages = groupCount(events30m, 'page_path', 8);
    const hourly = hourlySeries(pageViews24, 24);
    const weeklyVisitors = uniqueCount(events7d, 'visitor_id') || uniqueCount(events7d, 'session_id');

    return res.status(200).json({
      success: true,
      generated_at: new Date().toISOString(),
      window: {
        active_minutes: 30,
        primary_hours: 24,
        trend_days: 7
      },
      metrics: {
        active_visitors: activeVisitors,
        visitors_24h: visitors24,
        sessions_24h: sessions24,
        page_views_24h: pageViews24.length,
        leads_24h: leads,
        calls_24h: calls,
        conversion_rate_24h: conversionRate,
        avg_pages_per_session: avgPagesPerSession,
        visitors_7d: weeklyVisitors
      },
      series: {
        hourly_page_views: hourly
      },
      breakdowns: {
        live_pages: livePages,
        top_pages: topPages,
        referrers: topReferrers,
        sources: topSources,
        devices,
        browsers,
        countries
      },
      recent: {
        events: events24.slice(0, 20),
        leads: leads24.slice(0, 10),
        calls: calls24.slice(0, 10)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Analytics summary failed', details: error.message });
  }
}
