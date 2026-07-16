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

function visibleColumns(rows) {
  const columns = new Set();
  rows.slice(0, 25).forEach((row) => {
    Object.keys(row || {}).forEach((key) => columns.add(key));
  });
  return Array.from(columns).sort();
}

function sourceStatus({ calls, cost, latency, duration }) {
  if (!calls.length) {
    return {
      state: 'no_recent_call_records',
      message: 'call_records exists, but no records were found in the last 24 hours.',
      next_step: 'Run a live Vapi test call and confirm it writes to call_records.',
    };
  }

  const missing = [];
  if (!cost.field) missing.push('cost');
  if (!latency.field) missing.push('latency');

  if (!missing.length) {
    return {
      state: 'fully_connected',
      message: 'call_records contains live cost and latency fields.',
      next_step: 'No dashboard source action required.',
    };
  }

  return {
    state: 'partial_call_metrics',
    message: `call_records has ${calls.length} recent record${calls.length === 1 ? '' : 's'}, but ${missing.join(' and ')} field${missing.length === 1 ? ' is' : 's are'} not present or not numeric.`,
    next_step: 'Add real Vapi cost and latency fields to the call_records upsert/webhook flow, or map the existing provider field names into this endpoint.',
    duration_available: Boolean(duration.field),
  };
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
        diagnostics: {
          state: 'call_records_unavailable',
          message: 'The call_records table could not be read.',
          next_step: 'Confirm the call_records table exists, Supabase service role access works, and RLS policies allow service-role reads.',
          details: error.message,
        },
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
    const diagnostics = sourceStatus({ calls, cost, latency, duration });

    return res.status(200).json({
      success: true,
      generated_at: new Date().toISOString(),
      source: 'call_records',
      connected: true,
      since: since24h,
      diagnostics: {
        ...diagnostics,
        detected_columns: visibleColumns(calls),
        detected_fields: {
          cost: cost.field,
          latency: latency.field,
          duration: duration.field,
        },
      },
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
