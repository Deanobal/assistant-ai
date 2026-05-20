-- AssistantAI core schema: leads, clients, billing.

create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null,
  business_name text,
  email text,
  mobile_number text,
  industry text,
  website text,
  service_needed text,
  urgency text default 'normal',
  enquiry_type text default 'lead_capture',
  lead_source text,
  source_page text,
  message text,
  conversation_summary text,
  likely_plan_fit text,
  selected_plan text,
  buyer_intent text default 'researching',
  status text not null default 'New Lead',
  payment_status text not null default 'not_started',
  checkout_url text,
  checkout_session_id text,
  checkout_created_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  payment_confirmed_at timestamptz,
  lead_score integer default 0,
  assigned_owner text,
  notes text,
  next_action text,
  client_id uuid,
  ghl_contact_id text,
  ghl_last_synced_at timestamptz
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null,
  business_name text not null,
  email text not null,
  mobile_number text,
  industry text,
  website text,
  main_service text,
  monthly_enquiry_volume text,
  biggest_problem text,
  current_missed_call_handling text,
  ai_first_goal text,
  plan text not null default 'Starter',
  status text not null default 'New',
  lifecycle_state text not null default 'pre_live',
  progress_percentage integer not null default 0,
  assigned_owner text,
  target_go_live_date date,
  source_lead_id uuid references public.leads(id) on delete set null,
  last_activity text,
  blockers text[] default '{}',
  next_action text,
  workflow_phase text default 'Lead / Qualification',
  assets_status text default 'not_started',
  onboarding_archived boolean default false,
  go_live_ready boolean default false,
  go_live_date date,
  shared_files jsonb default '[]'::jsonb
);

alter table public.leads
  add constraint leads_client_id_fkey
  foreign key (client_id) references public.clients(id) on delete set null;

create table if not exists public.billing_status (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  plan text not null,
  setup_fee numeric not null,
  monthly_fee numeric not null,
  billing_status text not null default 'awaiting_payment',
  setup_fee_paid boolean default false,
  subscription_status text default 'none',
  payment_method text,
  invoice_reference text,
  renewal_date date,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_checkout_session_id text,
  notes text
);

create index if not exists leads_email_idx on public.leads(lower(email));
create index if not exists leads_mobile_idx on public.leads(mobile_number);
create index if not exists leads_status_idx on public.leads(status);
create index if not exists clients_email_idx on public.clients(lower(email));
create index if not exists clients_source_lead_idx on public.clients(source_lead_id);

alter table public.leads enable row level security;
alter table public.clients enable row level security;
alter table public.billing_status enable row level security;