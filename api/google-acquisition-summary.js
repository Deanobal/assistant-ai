import crypto from 'crypto';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GA_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

function getPrivateKey() {
  return String(process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
}

function base64Url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function normaliseRange(value) {
  const map = {
    '1h': { days: 1, label: 'Last 24 hours' },
    '8h': { days: 1, label: 'Last 24 hours' },
    '24h': { days: 1, label: 'Last 24 hours' },
    '7d': { days: 7, label: 'Last 7 days' },
    '30d': { days: 30, label: 'Last 30 days' },
  };
  return map[value] || map['30d'];
}

function isoDateOffset(daysAgo) {
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function getRequiredConfig() {
  return {
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    privateKey: getPrivateKey(),
    oauthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
    oauthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
    oauthRefreshToken: process.env.GOOGLE_OAUTH_REFRESH_TOKEN || '',
    gaPropertyId: process.env.GA_PROPERTY_ID || '',
    gscSiteUrl: process.env.GSC_SITE_URL || 'https://www.assistantai.com.au/',
  };
}

function getSearchConsoleCandidates(siteUrl) {
  const candidates = new Set([siteUrl]);
  try {
    if (siteUrl && siteUrl.startsWith('http')) {
      const host = new URL(siteUrl).hostname.replace(/^www\./, '');
      if (host) candidates.add(`sc-domain:${host}`);
    }
    if (siteUrl && siteUrl.startsWith('sc-domain:')) {
      const domain = siteUrl.replace('sc-domain:', '').trim();
      if (domain) {
        candidates.add(`https://${domain}/`);
        candidates.add(`https://www.${domain}/`);
      }
    }
  } catch (_error) {
    return Array.from(candidates).filter(Boolean);
  }
  return Array.from(candidates).filter(Boolean);
}

async function getServiceAccountAccessToken(scopes) {
  const { clientEmail, privateKey } = getRequiredConfig();
  if (!clientEmail || !privateKey) throw new Error('Google service account credentials are not configured');

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = { iss: clientEmail, scope: Array.isArray(scopes) ? scopes.join(' ') : scopes, aud: TOKEN_URL, exp: now + 3600, iat: now };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(privateKey, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const assertion = `${unsigned}.${signature}`;

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }).toString(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) throw new Error(data.error_description || data.error || 'Google service-account token request failed');
  return data.access_token;
}

async function getOAuthRefreshAccessToken() {
  const { oauthClientId, oauthClientSecret, oauthRefreshToken } = getRequiredConfig();
  if (!oauthClientId || !oauthClientSecret || !oauthRefreshToken) throw new Error('Google OAuth refresh-token credentials are not configured');

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: oauthClientId,
      client_secret: oauthClientSecret,
      refresh_token: oauthRefreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) throw new Error(data.error_description || data.error || 'Google OAuth refresh-token request failed');
  return data.access_token;
}

async function getAccessToken(scopes) {
  const config = getRequiredConfig();
  if (config.oauthClientId && config.oauthClientSecret && config.oauthRefreshToken) {
    return getOAuthRefreshAccessToken();
  }
  return getServiceAccountAccessToken(scopes);
}

function rowValue(row, metricName, metricHeaders) {
  const index = metricHeaders.findIndex((item) => item.name === metricName);
  if (index < 0) return 0;
  return Number(row.metricValues?.[index]?.value || 0);
}

function dimensionValue(row, index) {
  return row.dimensionValues?.[index]?.value || 'Unknown';
}

async function runGaReport({ accessToken, propertyId, range }) {
  if (!propertyId) return { ready: false, error: 'GA_PROPERTY_ID is not configured', rows: [], totals: {} };

  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: `${range.days}daysAgo`, endDate: 'today' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }, { name: 'sessionSourceMedium' }, { name: 'landingPagePlusQueryString' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' }, { name: 'conversions' }, { name: 'engagementRate' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 50,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { ready: false, error: data?.error?.message || 'GA4 report failed', rows: [], totals: {} };

  const metricHeaders = data.metricHeaders || [];
  const rows = data.rows || [];
  const totalsRow = data.totals?.[0] || {};
  const totals = {
    sessions: rowValue(totalsRow, 'sessions', metricHeaders),
    users: rowValue(totalsRow, 'totalUsers', metricHeaders),
    page_views: rowValue(totalsRow, 'screenPageViews', metricHeaders),
    conversions: rowValue(totalsRow, 'conversions', metricHeaders),
    engagement_rate: Math.round(rowValue(totalsRow, 'engagementRate', metricHeaders) * 1000) / 10,
  };

  return { ready: true, error: '', totals, channels: rows.map((row) => ({ channel: dimensionValue(row, 0), source_medium: dimensionValue(row, 1), landing_page: dimensionValue(row, 2), sessions: rowValue(row, 'sessions', metricHeaders), users: rowValue(row, 'totalUsers', metricHeaders), page_views: rowValue(row, 'screenPageViews', metricHeaders), conversions: rowValue(row, 'conversions', metricHeaders) })).slice(0, 20) };
}

async function querySearchConsole({ accessToken, siteUrl, range, dimensions, rowLimit = 25 }) {
  const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate: isoDateOffset(range.days), endDate: isoDateOffset(0), dimensions, rowLimit, startRow: 0 }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || 'Search Console query failed');
  return data.rows || [];
}

function mapGscRows(rows, keyName) {
  return rows.map((row) => ({ [keyName]: row.keys?.[0] || 'Unknown', clicks: row.clicks || 0, impressions: row.impressions || 0, ctr: Math.round((row.ctr || 0) * 1000) / 10, position: Math.round((row.position || 0) * 10) / 10 }));
}

async function runSearchConsoleForSite({ accessToken, siteUrl, range }) {
  const [queries, pages, countries, devices] = await Promise.all([
    querySearchConsole({ accessToken, siteUrl, range, dimensions: ['query'], rowLimit: 25 }),
    querySearchConsole({ accessToken, siteUrl, range, dimensions: ['page'], rowLimit: 25 }),
    querySearchConsole({ accessToken, siteUrl, range, dimensions: ['country'], rowLimit: 15 }),
    querySearchConsole({ accessToken, siteUrl, range, dimensions: ['device'], rowLimit: 10 }),
  ]);
  const queryRows = mapGscRows(queries, 'query');
  const totals = queryRows.reduce((acc, row) => ({ clicks: acc.clicks + row.clicks, impressions: acc.impressions + row.impressions, ctr: 0, avg_position_sum: acc.avg_position_sum + row.position }), { clicks: 0, impressions: 0, ctr: 0, avg_position_sum: 0 });
  totals.ctr = totals.impressions ? Math.round((totals.clicks / totals.impressions) * 1000) / 10 : 0;
  totals.avg_position = queryRows.length ? Math.round((totals.avg_position_sum / queryRows.length) * 10) / 10 : 0;
  delete totals.avg_position_sum;
  return { ready: true, error: '', property_used: siteUrl, attempted_properties: [], totals, queries: queryRows, pages: mapGscRows(pages, 'page'), countries: mapGscRows(countries, 'country'), devices: mapGscRows(devices, 'device') };
}

async function runSearchConsole({ accessToken, siteUrl, range }) {
  if (!siteUrl) return { ready: false, error: 'GSC_SITE_URL is not configured', property_used: '', attempted_properties: [], totals: {}, queries: [], pages: [] };
  const candidates = getSearchConsoleCandidates(siteUrl);
  const errors = [];
  for (const candidate of candidates) {
    try {
      const result = await runSearchConsoleForSite({ accessToken, siteUrl: candidate, range });
      return { ...result, attempted_properties: candidates };
    } catch (error) {
      errors.push(`${candidate}: ${error.message}`);
    }
  }
  return { ready: false, error: errors.join(' | '), property_used: '', attempted_properties: candidates, totals: {}, queries: [], pages: [], countries: [], devices: [] };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const range = normaliseRange(req.query?.range || '30d');
  const config = getRequiredConfig();
  const hasOAuth = Boolean(config.oauthClientId && config.oauthClientSecret && config.oauthRefreshToken);
  const hasServiceAccount = Boolean(config.clientEmail && config.privateKey);
  const missing = [];
  if (!hasOAuth && !hasServiceAccount) missing.push('GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET', 'GOOGLE_OAUTH_REFRESH_TOKEN');

  if (missing.length) {
    return res.status(200).json({
      success: true,
      connected: false,
      auth_method: 'none',
      missing,
      generated_at: new Date().toISOString(),
      range,
      ga4: { ready: false, error: 'Google OAuth refresh-token credentials are missing', totals: {}, channels: [] },
      search_console: { ready: false, error: 'Google OAuth refresh-token credentials are missing', totals: {}, queries: [], pages: [], countries: [], devices: [] },
    });
  }

  try {
    const accessToken = await getAccessToken([GA_SCOPE, GSC_SCOPE]);
    const [ga4, searchConsole] = await Promise.all([
      runGaReport({ accessToken, propertyId: config.gaPropertyId, range }),
      runSearchConsole({ accessToken, siteUrl: config.gscSiteUrl, range }),
    ]);

    return res.status(200).json({ success: true, connected: ga4.ready || searchConsole.ready, auth_method: hasOAuth ? 'oauth_refresh_token' : 'service_account', generated_at: new Date().toISOString(), range, ga4, search_console: searchConsole });
  } catch (error) {
    return res.status(200).json({ success: true, connected: false, auth_method: hasOAuth ? 'oauth_refresh_token' : 'service_account', generated_at: new Date().toISOString(), range, ga4: { ready: false, error: error.message, totals: {}, channels: [] }, search_console: { ready: false, error: error.message, totals: {}, queries: [], pages: [], countries: [], devices: [] } });
  }
}
