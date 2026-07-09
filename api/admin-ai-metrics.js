function startOfWindow(hours, endDate = new Date()) {
  return new Date(endDate.getTime() - hours * 60 * 60 * 1000).toISOString();
}

async function supabaseSelect({ url, key, table, query }) {
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : [];
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
}

function numericValue(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function percentile(values, p) {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, index))];
}

function findNumericField(rows, fieldNames) {
  for (const field of fieldNames) {
    const values = rows.map((row) => numericValue(row?.[field])).filter((value) => value !== null);
    if (values.length) return { field, values };
  }
  return { field: null, values: [] };
}

function sum(values) {
  return Math.round(values.reduce((total, value) => total + value, 0) * 100) / 100;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return res.status(500).json({ error: 'Admin metrics database configuration missing' });

    const since24h = startOfWindow(24);
    let calls = [];

    try {
      calls = await supabaseSelect({
        url,
        key,
        table: 'call_records',
        query: `select=*&created_at=gte.${encodeURIComponent(since24h)}&order=created_at.desc&limit=5000`,
      });
    } catch (error) {
      return res.status(200).json({
        success: true,
        generated_at: new Date().toISOString(),
        source: 'call_records',
        connected: false,
        error: 'call_records unavailable',
        details: error.message,
        metrics: {
          calls_24h: 0,
          ai_cost_24h: { connected: false, value: null, field: null, currency: null },
          p95_latency: { connected: false, value_ms: null, field: null },
          p95_call_duration: { connected: false, value_seconds: null, field: null },
        },
      });
    }

    const cost = findNumericField(calls, [
      'cost_aud',
      'total_cost_aud',
      'ai_cost_aud',
      'usage_cost_aud',
      'cost_usd',
      'total_cost_usd',
      'ai_cost_usd',
      'usage_cost_usd',
      'cost',
      'total_cost',
      'ai_cost',
      'usage_cost',
      'call_cost',
    ]);

    const latency = findNumericField(calls, [
      'p95_latency_ms',
      'latency_ms',
      'response_latency_ms',
      'first_response_latency_ms',
      'time_to_first_token_ms',
      'time_to_first_audio_ms',
      'assistant_latency_ms',
      'webhook_latency_ms',
    ]);

    const duration = findNumericField(calls, [
      'call_duration_seconds',
      'duration_seconds',
      'call_duration',
      'duration',
    ]);

    const currency = cost.field?.includes('_aud') ? 'AUD' : cost.field?.includes('_usd') ? 'USD' : null;

    return res.status(200).json({
      success: true,
      generated_at: new Date().toISOString(),
      source: 'call_records',
      connected: true,
      since: since24h,
      metrics: {
        calls_24h: calls.length,
        ai_cost_24h: {
          connected: Boolean(cost.field),
          value: cost.field ? sum(cost.values) : null,
          field: cost.field,
          currency,
        },
        p95_latency: {
          connected: Boolean(latency.field),
          value_ms: latency.field ? percentile(latency.values, 95) : null,
          field: latency.field,
        },
        p95_call_duration: {
          connected: Boolean(duration.field),
          value_seconds: duration.field ? percentile(duration.values, 95) : null,
          field: duration.field,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Admin AI metrics failed', details: error.message });
  }
}
