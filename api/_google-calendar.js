export const ASSISTANTAI_SALES_CALENDAR_ID = 'sales@assistantai.com.au';
export const TIMEZONE = 'Australia/Melbourne';

function firstConfigured(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return { name, value };
  }
  throw new Error(`${names.join(' or ')} is not configured`);
}

export async function getGoogleAccessToken() {
  const { value: refreshToken } = firstConfigured(['GOOGLE_REFRESH_TOKEN', 'GOOGLE_OAUTH_REFRESH_TOKEN']);
  const { value: clientId } = firstConfigured(['GOOGLE_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_ID']);
  const { value: clientSecret } = firstConfigured(['GOOGLE_CLIENT_SECRET', 'GOOGLE_OAUTH_CLIENT_SECRET']);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    }).toString()
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data?.error_description || data?.error || 'Unable to refresh Google access token');
  }
  return data.access_token;
}

export function getTimeZoneOffsetMinutes(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone,
    timeZoneName: 'shortOffset',
    hour: '2-digit'
  }).formatToParts(date);
  const offset = parts.find((part) => part.type === 'timeZoneName')?.value || 'GMT+0';
  const match = offset.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!match) return 0;
  const sign = match[1] === '+' ? 1 : -1;
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);
  return sign * ((hours * 60) + minutes);
}

export function zonedDateTimeToUtc(year, month, day, hour, minute, timeZone = TIMEZONE) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
  const offsetMinutes = getTimeZoneOffsetMinutes(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offsetMinutes * 60 * 1000);
}

export function getLocalDateParts(date, dayOffset = 0, timeZone = TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);
  const localMiddayUtc = zonedDateTimeToUtc(year, month, day, 12, 0, timeZone);
  localMiddayUtc.setUTCDate(localMiddayUtc.getUTCDate() + dayOffset);
  const shiftedParts = new Intl.DateTimeFormat('en-AU', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  }).formatToParts(localMiddayUtc);
  return {
    year: Number(shiftedParts.find((part) => part.type === 'year')?.value),
    month: Number(shiftedParts.find((part) => part.type === 'month')?.value),
    day: Number(shiftedParts.find((part) => part.type === 'day')?.value),
    weekday: shiftedParts.find((part) => part.type === 'weekday')?.value
  };
}

export async function googleCalendarFetch(path, options = {}) {
  const token = await getGoogleAccessToken();
  const response = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.error?.message || text || response.statusText);
  return data;
}
