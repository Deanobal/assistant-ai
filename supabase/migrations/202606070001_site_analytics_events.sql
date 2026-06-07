create table if not exists public.site_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null,
  visitor_id text,
  event_type text not null default 'page_view',
  page_path text,
  page_title text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text,
  browser text,
  os text,
  country text,
  region text,
  city text,
  ip_hash text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists site_events_created_at_idx on public.site_events (created_at desc);
create index if not exists site_events_session_idx on public.site_events (session_id, created_at desc);
create index if not exists site_events_page_path_idx on public.site_events (page_path);
create index if not exists site_events_event_type_idx on public.site_events (event_type);
create index if not exists site_events_visitor_idx on public.site_events (visitor_id, created_at desc);

alter table public.site_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'site_events' and policyname = 'Service role manages site events'
  ) then
    create policy "Service role manages site events" on public.site_events
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end $$;
