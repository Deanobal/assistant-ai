import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock3, Globe, MapPin, Monitor } from 'lucide-react';

const SAMPLE_VISITOR = {
  city: 'Sydney',
  country: 'Australia',
  latitude: -33.8688,
  longitude: 151.2093,
  ip: '103.48.xx.xx',
  os: 'iOS',
  page: '/Pricing',
};

function detectOs() {
  const userAgent = navigator.userAgent || '';
  const platform = navigator.platform || '';

  if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
  if (/Android/.test(userAgent)) return 'Android';
  if (/Win/.test(platform)) return 'Windows';
  if (/Mac/.test(platform)) return 'macOS';
  if (/Linux/.test(platform)) return 'Linux';
  return 'Unknown';
}

function getSessionStartedAt() {
  const key = 'live-visitor-session-started-at';
  const existing = window.sessionStorage.getItem(key);

  if (existing) {
    return Number(existing);
  }

  const startedAt = Date.now();
  window.sessionStorage.setItem(key, String(startedAt));
  return startedAt;
}

function formatDuration(startedAt, now) {
  const totalSeconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatPageLabel(page) {
  if (!page || page === '/') return 'Home';
  return page.replace(/^\//, '').replace(/[-_]/g, ' ');
}

function projectCoordinates(latitude, longitude) {
  return {
    x: ((longitude + 180) / 360) * 100,
    y: ((90 - latitude) / 180) * 100,
  };
}

function WorldBackdrop() {
  return (
    <svg viewBox="0 0 1000 500" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="worldGlow" x1="0" x2="1">
          <stop offset="0%" stopColor="rgba(34,211,238,0.22)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0.14)" />
        </linearGradient>
      </defs>
      <path d="M115 132l42-29 57 10 34 29-8 45-31 19-52-4-23-26-37-12-16-17z" fill="url(#worldGlow)" stroke="rgba(148,163,184,0.18)" />
      <path d="M242 246l29 18 18 47-19 49 17 54 27 18 17-13 12-61-15-59 23-44-26-20-37-4z" fill="url(#worldGlow)" stroke="rgba(148,163,184,0.18)" />
      <path d="M430 126l52-34 113 8 95 29 78 3 73 40-12 47-68 12-27 35-72-5-46-31-49 6-41 43-67 3-44-28-6-52 21-23-11-23z" fill="url(#worldGlow)" stroke="rgba(148,163,184,0.18)" />
      <path d="M559 299l57-11 52 15 44 35 39 12 17 31-25 18-62-6-32-29-61 5-32-38z" fill="url(#worldGlow)" stroke="rgba(148,163,184,0.18)" />
      <path d="M807 339l56 10 33 24-29 28-70-9-21-29z" fill="url(#worldGlow)" stroke="rgba(148,163,184,0.18)" />
    </svg>
  );
}

export default function LiveVisitorWorld({ mode = 'live' }) {
  const isSample = mode === 'sample';
  const [isOpen, setIsOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [sessionStartedAt] = useState(() => getSessionStartedAt());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['live-visitor-world'],
    queryFn: async () => {
      const response = await fetch('https://ipwho.is/');
      const visitor = await response.json();
      return {
        city: visitor.city,
        country: visitor.country,
        latitude: visitor.latitude,
        longitude: visitor.longitude,
        ip: visitor.ip,
        os: detectOs(),
        page: window.location.pathname,
      };
    },
    enabled: !isSample,
    staleTime: 1000 * 60 * 5,
  });

  const visitor = isSample ? SAMPLE_VISITOR : data;
  const dotPosition = useMemo(() => {
    if (!visitor?.latitude && !visitor?.longitude) return null;
    return projectCoordinates(Number(visitor.latitude), Number(visitor.longitude));
  }, [visitor]);

  return (
    <Card className="bg-[#12121a] border-white/5 overflow-hidden">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            Live Visitor World View
          </CardTitle>
          <p className="text-sm text-gray-400 mt-2">Hover over the breathing dot to see the visitor location, OS, time online, and current page.</p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 w-fit">1 visitor live</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_45%),linear-gradient(180deg,#0c1220_0%,#090d16_100%)] aspect-[2/1]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />
          <WorldBackdrop />

          {isLoading && !isSample && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-300">Locating live visitor…</div>
          )}

          {dotPosition && visitor && (
            <div
              className="absolute"
              style={{ left: `${dotPosition.x}%`, top: `${dotPosition.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <button
                type="button"
                className="relative flex h-6 w-6 items-center justify-center"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setIsOpen(false)}
                aria-label="Live visitor details"
              >
                <span className="absolute h-6 w-6 rounded-full bg-cyan-400/35 animate-ping" />
                <span className="absolute h-4 w-4 rounded-full bg-cyan-300/45" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_18px_rgba(34,211,238,0.95)]" />
              </button>

              {isOpen && (
                <div className="absolute left-1/2 top-0 z-10 w-72 -translate-x-1/2 -translate-y-[110%] rounded-2xl border border-cyan-500/20 bg-[#08101c]/95 p-4 text-left shadow-2xl backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/70">Live visitor</p>
                  <p className="mt-2 text-lg font-semibold text-white">{visitor.city}, {visitor.country}</p>
                  <div className="mt-4 space-y-3 text-sm text-gray-300">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-300" /> {visitor.latitude.toFixed(2)}, {visitor.longitude.toFixed(2)}</div>
                    <div className="flex items-center gap-2"><Monitor className="w-4 h-4 text-cyan-300" /> {visitor.os}</div>
                    <div className="flex items-center gap-2"><Clock3 className="w-4 h-4 text-cyan-300" /> Online for {formatDuration(sessionStartedAt, now)}</div>
                    <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-cyan-300" /> {formatPageLabel(visitor.page)}</div>
                  </div>
                  <p className="mt-4 text-xs text-gray-500">IP: {visitor.ip}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {[
            ['Location', visitor ? `${visitor.city}, ${visitor.country}` : 'Finding visitor...'],
            ['Platform OS', visitor?.os || 'Detecting...'],
            ['Time Online', formatDuration(sessionStartedAt, now)],
            ['Current Page', formatPageLabel(visitor?.page || '/')],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{label}</p>
              <p className="mt-2 text-sm font-medium text-white">{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}