-- AssistantAI onboarding hardening migration
-- Run this in Supabase SQL Editor if migrations are not applied automatically.

create extension if not exists pgcrypto;

alter table public.clients
add column if not exists phone text,
add column if not exists source_page text,
add column if not exists main_service text,
add column if not exists monthly_enquiry_volume text,
add column if not exists biggest_problem text,
add column if not exists current_missed_call_handling text,
add column if not exists ai_first_goal text,
add column if not exists target_go_live_date date,
add column if not exists assets_status text default 'not_started',
add column if not exists shared_files jsonb default '[]'::jsonb,
add column if not exists description text,
add column if not exists is_test_record boolean default false,
add column if not exists migrated_from text default 'supabase_native',
add column if not exists created_date timestamptz default now(),
add column if not exists updated_date timestamptz default now();

create table if not exists public.intake_forms (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  contact_name text,
  full_name text,
  business_name text,
  email text,
  phone text,
  mobile_number text,
  website text,
  industry text,
  approval_status text default 'draft',
  business_description text,
  services_offered text,
  service_areas text,
  business_hours text,
  emergency_rules text,
  faq_list text,
  pricing_guidance text,
  escalation_contact text,
  crm_used_now text,
  calendar_used_now text,
  messaging_sms_tool text,
  payment_billing_method text,
  main_business_phone text,
  after_hours_rules text,
  hot_lead_definition text,
  urgent_job_definition text,
  escalation_rules text,
  ai_never_say_rules text,
  booking_rules text,
  required_capture_before_handoff text,
  escalation_contacts text,
  scripts_assets text,
  objection_handling text,
  sensitive_data_limits text,
  recordings_allowed boolean,
  sms_followup_approved boolean,
  outbound_calling_approved boolean,
  final_approver text,
  script_files jsonb default '[]'::jsonb,
  knowledge_files jsonb default '[]'::jsonb,
  pricing_files jsonb default '[]'::jsonb,
  brand_files jsonb default '[]'::jsonb,
  supporting_files jsonb default '[]'::jsonb,
  ai_call_summary text,
  ai_captured_payload jsonb default '{}'::jsonb,
  is_archived boolean default false,
  last_updated timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.intake_forms
add column if not exists crm_used_now text,
add column if not exists calendar_used_now text,
add column if not exists messaging_sms_tool text,
add column if not exists payment_billing_method text,
add column if not exists main_business_phone text,
add column if not exists after_hours_rules text,
add column if not exists hot_lead_definition text,
add column if not exists urgent_job_definition text,
add column if not exists escalation_rules text,
add column if not exists ai_never_say_rules text,
add column if not exists booking_rules text,
add column if not exists required_capture_before_handoff text,
add column if not exists escalation_contacts text,
add column if not exists scripts_assets text,
add column if not exists objection_handling text,
add column if not exists sensitive_data_limits text,
add column if not exists recordings_allowed boolean,
add column if not exists sms_followup_approved boolean,
add column if not exists outbound_calling_approved boolean,
add column if not exists final_approver text,
add column if not exists script_files jsonb default '[]'::jsonb,
add column if not exists knowledge_files jsonb default '[]'::jsonb,
add column if not exists pricing_files jsonb default '[]'::jsonb,
add column if not exists brand_files jsonb default '[]'::jsonb,
add column if not exists supporting_files jsonb default '[]'::jsonb,
add column if not exists ai_call_summary text,
add column if not exists ai_captured_payload jsonb default '{}'::jsonb;

create table if not exists public.client_files (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  intake_id uuid references public.intake_forms(id) on delete set null,
  section text not null default 'supporting',
  file_name text not null,
  file_size bigint,
  file_type text,
  storage_bucket text default 'client-files',
  storage_path text,
  public_url text,
  metadata jsonb default '{}'::jsonb,
  uploaded_by text default 'admin',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  task_name text not null,
  task_phase text,
  task_type text,
  required boolean default true,
  completed boolean default false,
  due_date date,
  assigned_to text,
  notes text,
  blocked boolean default false,
  is_archived boolean default false,
  sort_order integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.integration_status (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  integration_name text not null,
  provider text,
  integration_type text,
  connection_status text default 'not_connected',
  last_sync timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.billing_status (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  plan text,
  setup_fee numeric,
  monthly_fee numeric,
  billing_status text default 'draft',
  payment_method text,
  invoice_reference text,
  renewal_date date,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_checkout_session_id text,
  admin_override boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.client_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  note_type text default 'note',
  content text,
  created_by text default 'admin',
  is_archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.secure_setup_requests (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  source text default 'vapi',
  caller_phone text,
  captured_name text,
  captured_email text,
  captured_business_name text,
  captured_plan text,
  captured_notes text,
  call_id text,
  lead_id text,
  corrected_name text,
  corrected_email text,
  corrected_phone text,
  corrected_business_name text,
  corrected_plan text,
  corrected_notes text,
  submitted_payload jsonb default '{}'::jsonb,
  status text default 'pending',
  submitted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', false)
on conflict (id) do nothing;

create index if not exists intake_forms_client_id_idx on public.intake_forms(client_id);
create index if not exists client_files_client_id_idx on public.client_files(client_id);
create index if not exists onboarding_tasks_client_id_idx on public.onboarding_tasks(client_id);
create index if not exists integration_status_client_id_idx on public.integration_status(client_id);
create index if not exists billing_status_client_id_idx on public.billing_status(client_id);
create index if not exists client_notes_client_id_idx on public.client_notes(client_id);
create index if not exists secure_setup_requests_token_idx on public.secure_setup_requests(token);
