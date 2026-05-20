create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  asset_url text not null,
  asset_type text not null default 'image',
  alt_text text,
  folder text default 'general',
  tags text[] default '{}',
  status text not null default 'active'
);

create index if not exists media_assets_folder_idx on public.media_assets(folder);
create index if not exists media_assets_type_idx on public.media_assets(asset_type);

alter table public.media_assets enable row level security;
