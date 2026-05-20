create table if not exists public.social_proof_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  item_type text not null default 'testimonial',
  title text not null,
  client_name text,
  business_name text,
  industry text,
  quote text,
  result_summary text,
  metric_label text,
  metric_value text,
  image_url text,
  case_study_url text,
  sort_order integer default 0,
  status text not null default 'draft'
);

create index if not exists social_proof_status_idx on public.social_proof_items(status, sort_order);
create index if not exists social_proof_type_idx on public.social_proof_items(item_type);

alter table public.social_proof_items enable row level security;
