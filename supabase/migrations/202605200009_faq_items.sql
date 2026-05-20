create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  question text not null,
  answer text not null,
  category text default 'general',
  page_key text default 'global',
  keywords text[] default '{}',
  sort_order integer default 0,
  status text not null default 'draft'
);

create index if not exists faq_items_status_idx on public.faq_items(status, sort_order);
create index if not exists faq_items_page_idx on public.faq_items(page_key, sort_order);
create index if not exists faq_items_category_idx on public.faq_items(category);

alter table public.faq_items enable row level security;
