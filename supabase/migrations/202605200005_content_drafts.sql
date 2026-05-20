create table if not exists public.content_drafts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  content_type text not null default 'blog',
  target_audience text,
  objective text,
  keywords text[] default '{}',
  prompt text,
  draft_body text,
  status text not null default 'draft',
  channel text default 'website'
);

create index if not exists content_drafts_type_idx on public.content_drafts(content_type);
create index if not exists content_drafts_status_idx on public.content_drafts(status);

alter table public.content_drafts enable row level security;
