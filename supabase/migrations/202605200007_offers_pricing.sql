create table if not exists public.offers_pricing (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  offer_name text not null,
  slug text not null unique,
  headline text,
  description text,
  setup_fee numeric default 0,
  monthly_fee numeric default 0,
  currency text default 'AUD',
  billing_cycle text default 'monthly',
  inclusions jsonb not null default '[]'::jsonb,
  cta_label text default 'Get Started',
  cta_url text default '/GetStartedNow',
  stripe_price_key text,
  sort_order integer default 0,
  status text not null default 'draft'
);

create index if not exists offers_pricing_status_idx on public.offers_pricing(status, sort_order);
create index if not exists offers_pricing_slug_idx on public.offers_pricing(slug);

alter table public.offers_pricing enable row level security;
