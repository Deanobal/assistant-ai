-- Native AssistantAI compatibility schema for campaign and notification workflows.

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  type text,
  template text,
  segment text,
  subject text,
  body text,
  cta_text text,
  cta_url text,
  scheduled_date timestamptz,
  status text not null default 'draft',
  total_sent integer not null default 0,
  open_rate numeric not null default 0,
  click_rate numeric not null default 0,
  reply_rate numeric not null default 0,
  metadata jsonb default '{}'::jsonb
);

alter table public.notification_logs
  add column if not exists lead_id uuid,
  add column if not exists recipient_phone text,
  add column if not exists provider_status text,
  add column if not exists provider_error_message text;

create index if not exists campaigns_status_idx on public.campaigns(status, created_at desc);
create index if not exists campaigns_segment_idx on public.campaigns(segment);
create index if not exists notification_logs_lead_id_idx on public.notification_logs(lead_id);

alter table public.campaigns enable row level security;
