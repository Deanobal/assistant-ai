create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  menu_key text not null default 'header',
  label text not null,
  href text not null,
  item_type text default 'link',
  parent_label text,
  open_in_new_tab boolean default false,
  sort_order integer default 0,
  status text not null default 'draft'
);

create index if not exists navigation_items_menu_idx on public.navigation_items(menu_key, sort_order);
create index if not exists navigation_items_status_idx on public.navigation_items(status);

alter table public.navigation_items enable row level security;
