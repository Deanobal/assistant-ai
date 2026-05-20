create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  setting_key text not null unique,
  setting_label text not null,
  setting_value text,
  setting_group text not null default 'general',
  is_public boolean default false
);

create index if not exists site_settings_group_idx on public.site_settings(setting_group);

alter table public.site_settings enable row level security;
