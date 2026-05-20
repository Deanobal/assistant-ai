create table if not exists public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  slug text not null unique,
  headline text not null,
  subheadline text,
  offer text,
  cta_label text default 'Get Started',
  cta_url text default '/GetStartedNow',
  meta_title text,
  meta_description text,
  sections jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  published_at timestamptz
);

create index if not exists landing_pages_slug_idx on public.landing_pages(slug);
create index if not exists landing_pages_status_idx on public.landing_pages(status);

alter table public.landing_pages enable row level security;
