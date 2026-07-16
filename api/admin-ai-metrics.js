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

  const