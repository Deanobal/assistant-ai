-- AssistantAI client AI call recordings
-- Run this in Supabase SQL Editor if migrations are not applied automatically.

create extension if not exists pgcrypto;

create table if not exists public.client_call_recordings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  lead_id uuid,
  provider text not null default 'vapi',
  provider_call_id text unique,
  assistant_id text,
  phone_number_id text,
  caller_name text,
  caller_phone text,
  caller_email text,
  business_name text,
  call_direction text,
  call_status text default 'completed',
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer default 0,
  recording_url text,
  stereo_recording_url text,
  mono_recording_url text,
  transcript text,
  ai_summary text,
  structured_summary jsonb default '{}'::jsonb,
  sentiment text,
  sentiment_score numeric,
  outcome_label text,
  enquiry_category text,
  urgency text,
  follow_up_required boolean default false,
  lead_quality text,
  topics jsonb default '[]'::jsonb,
  raw_payload jsonb default '{}'::jsonb,
  visible_to_client boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.client_call_recordings
add column if not exists client_id uuid references public.clients(id) on delete cascade,
add column if not exists lead_id uuid,
add column if not exists provider text default 'vapi',
add column if not exists provider_call_id text,
add column if not exists assistant_id text,
add column if not exists phone_number_id text,
add column if not exists caller_name text,
add column if not exists caller_phone text,
add column if not exists caller_email text,
add column if not exists business_name text,
add column if not exists call_direction text,
add column if not exists call_status text default 'completed',
add column if not exists started_at timestamptz,
add column if not exists ended_at timestamptz,
add column if not exists duration_seconds integer default 0,
add column if not exists recording_url text,
add column if not exists stereo_recording_url text,
add column if not exists mono_recording_url text,
add column if not exists transcript text,
add column if not exists ai_summary text,
add column if not exists structured_summary jsonb default '{}'::jsonb,
add column if not exists sentiment text,
add column if not exists sentiment_score numeric,
add column if not exists outcome_label text,
add column if not exists enquiry_category text,
add column if not exists urgency text,
add column if not exists follow_up_required boolean default false,
add column if not exists lead_quality text,
add column if not exists topics jsonb default '[]'::jsonb,
add column if not exists raw_payload jsonb default '{}'::jsonb,
add column if not exists visible_to_client boolean default true,
add column if not exists created_at timestamptz default now(),
add column if not exists updated_at timestamptz default now();

create unique index if not exists client_call_recordings_provider_call_id_uidx
on public.client_call_recordings(provider_call_id)
where provider_call_id is not null;

create index if not exists client_call_recordings_client_id_idx on public.client_call_recordings(client_id);
create index if not exists client_call_recordings_lead_id_idx on public.client_call_recordings(lead_id);
create index if not exists client_call_recordings_started_at_idx on public.client_call_recordings(started_at desc);
create index if not exists client_call_recordings_visible_idx on public.client_call_recordings(client_id, visible_to_client, started_at desc);
