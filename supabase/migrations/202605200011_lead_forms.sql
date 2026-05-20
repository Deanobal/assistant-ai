create table if not exists public.lead_forms (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  form_name text not null,
  form_key text not null unique,
  title text not null,
  description text,
  submit_label text default 'Submit',
  success_message text default 'Thanks. We will be in touch shortly.',
  route_to text default 'lead_dashboard',
  notification_group text default 'sales',
  fields jsonb not null default '[]'::jsonb,
  status text not null default 'draft'
);

create index if not exists lead_forms_key_idx on public.lead_forms(form_key);
create index if not exists lead_forms_status_idx on public.lead_forms(status);

alter table public.lead_forms enable row level security;
