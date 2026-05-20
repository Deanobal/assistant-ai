create table if not exists public.site_content_blocks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  page_key text not null,
  section_key text not null,
  label text not null,
  content_type text not null default 'text',
  value text,
  status text not null default 'active',
  sort_order integer default 0,
  unique(page_key, section_key)
);

create index if not exists site_content_blocks_page_idx on public.site_content_blocks(page_key, sort_order);

alter table public.site_content_blocks enable row level security;
