-- AssistantAI core schema: onboarding, support, notifications.

create table if not exists public.intake_forms (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  business_name text,
  contact_name text,
  phone text,
  email text,
  website text,
  industry text,
  service_areas text,
  crm_used_now text,
  calendar_used_now text,
  messaging_sms_tool text,
  payment_billing_method text,
  main_business_phone text,
  business_hours text,
  after_hours_rules text,
  hot_lead_definition text,
  urgent_job_definition text,
  escalation_rules text,
  ai_never_say_rules text,
  booking_rules text,
  required_capture_before_handoff text,
  escalation_contacts text,
  scripts_assets text,
  faq_list text,
  pricing_guidance text,
  objection_handling text,
  sensitive_data_limits text,
  recordings_allowed boolean default false,
  sms_followup_approved boolean default false,
  outbound_calling_approved boolean default false,
  final_approver text,
  approval_status text default 'draft',
  last_updated timestamptz default now(),
  is_archived boolean default false
);

create table if not exists public.integration_status (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  integration_type text not null,
  integration_name text not null,
  connection_status text not null default 'planned',
  last_sync timestamptz,
  notes text
);

create table if not exists public.client_notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  note_type text not null default 'general',
  content text not null,
  created_by text default 'system',
  is_archived boolean default false
);

create table if not exists public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  task_name text not null,
  task_phase text not null,
  required boolean default true,
  completed boolean default false,
  blocked boolean default false,
  plan_scope text not null default 'Starter',
  due_date date,
  assigned_to text,
  notes text,
  is_archived boolean default false
);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_type text not null,
  entity_name text not null,
  entity_id text not null,
  client_id uuid,
  recipient_role text not null default 'admin',
  recipient_email text,
  channel text not null default 'in_app',
  delivery_status text not null default 'stored',
  provider_name text,
  provider_message text,
  provider_message_id text,
  title text not null,
  message text not null,
  triggered_at timestamptz not null default now(),
  delivered_at timestamptz,
  failed_at timestamptz,
  actor_email text,
  metadata jsonb default '{}'::jsonb
);

create table if not exists public.stripe_event_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  stripe_event_id text not null unique,
  event_type text not null,
  checkout_session_id text,
  lead_id uuid,
  processing_status text not null default 'event_received',
  processing_started_at timestamptz,
  processing_completed_at timestamptz,
  business_result jsonb,
  error_message text,
  retry_count integer default 0,
  processed_at timestamptz,
  status text default 'processing',
  related_client_id uuid
);

create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text default 'new',
  source_type text default 'public_site',
  source_page text,
  visitor_name text,
  visitor_email text,
  visitor_phone text,
  subject text,
  linked_lead_id uuid references public.leads(id) on delete set null,
  linked_client_id uuid references public.clients(id) on delete set null,
  priority text default 'normal',
  ai_mode text default 'ai_active',
  ai_summary text
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_role text not null,
  sender_name text,
  message text not null,
  metadata jsonb default '{}'::jsonb
);

create index if not exists onboarding_tasks_client_idx on public.onboarding_tasks(client_id);
create index if not exists notification_logs_event_idx on public.notification_logs(event_type, created_at desc);
create index if not exists stripe_event_logs_event_id_idx on public.stripe_event_logs(stripe_event_id);

alter table public.intake_forms enable row level security;
alter table public.integration_status enable row level security;
alter table public.client_notes enable row level security;
alter table public.onboarding_tasks enable row level security;
alter table public.notification_logs enable row level security;
alter table public.stripe_event_logs enable row level security;
alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;