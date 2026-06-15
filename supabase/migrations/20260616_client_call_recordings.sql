-- AssistantAI client call recordings
-- Stores Vapi call recordings against the correct client so each client portal can play back only its own calls.

create extension if not exists pgcrypto;

create table if not exists public.client_call_recordings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  vapi_call_id text unique,
  assistant_id text,
  phone_number text,
  caller_name text,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer,
  recording_url text,
  stereo_recording_url text,
  transcript text,
  summary text,
  sentiment text,
  outcome_label text,
  enquiry_category text,
  follow_up_required boolean default false,
  status text default 'completed',
  raw_payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.client_call_recordings
add column if not exists client_id uuid references public.clients(id) on delete cascade,
add column if not exists lead_id uuid references public.leads(id) on delete set null,
add column if not exists vapi_call_id text unique,
add column if not exists assistant_id text,
add column if not exists phone_number text,
add column if not exists caller_name text,
add column if not exists started_at timestamptz,
add column if not exists ended_at timestamptz,
add column if not exists duration_seconds integer,
add column if not exists recording_url text,
add column if not exists stereo_recording_url text,
add column if not exists transcript text,
add column if not exists summary text,
add column if not exists sentiment text,
add column if not exists outcome_label text,
add column if not exists enquiry_category text,
add column if not exists follow_up_required boolean default false,
add column if not exists status text default 'completed',
add column if not exists raw_payload jsonb default '{}'::jsonb,
add column if not exists created_at timestamptz default now(),
add column if not exists updated_at timestamptz default now();

create index if not exists client_call_recordings_client_id_idx on public.client_call_recordings(client_id);
create index if not exists client_call_recordings_vapi_call_id_idx on public.client_call_recordings(vapi_call_id);
create index if not exists client_call_recordings_phone_idx on public.client_call_recordings(phone_number);
create index if not exists client_call_recordings_started_at_idx on public.client_call_recordings(started_at desc);
