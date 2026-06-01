-- Crisp -> Supabase -> Admin bridge
-- Run this in Supabase SQL editor before enabling the Crisp webhook.

create extension if not exists pgcrypto;

create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  external_provider text not null default 'crisp',
  external_conversation_id text not null,
  crisp_website_id text,
  crisp_session_id text,
  channel text not null default 'crisp',
  status text not null default 'open',
  priority text not null default 'normal',
  visitor_name text,
  visitor_email text,
  visitor_phone text,
  subject text,
  summary text,
  last_message_preview text,
  last_message_at timestamptz,
  unread_for_admin boolean not null default true,
  assigned_to text,
  lead_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (external_provider, external_conversation_id)
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  external_provider text not null default 'crisp',
  external_message_id text,
  direction text not null default 'inbound',
  sender_type text not null default 'visitor',
  sender_name text,
  sender_email text,
  message_type text not null default 'text',
  body text,
  body_text text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (external_provider, external_message_id)
);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  channel text not null default 'in_app',
  entity_name text,
  entity_id uuid,
  recipient_role text not null default 'admin',
  title text,
  message text,
  status text not null default 'new',
  priority text not null default 'normal',
  deep_link text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_support_conversations_status on public.support_conversations(status);
create index if not exists idx_support_conversations_unread on public.support_conversations(unread_for_admin);
create index if not exists idx_support_conversations_last_message on public.support_conversations(last_message_at desc);
create index if not exists idx_support_messages_conversation on public.support_messages(conversation_id, created_at asc);
create index if not exists idx_notification_logs_admin_new on public.notification_logs(recipient_role, status, created_at desc);

-- Optional RLS baseline. Keep disabled unless policies are explicitly configured through authenticated admin APIs.
-- alter table public.support_conversations enable row level security;
-- alter table public.support_messages enable row level security;
-- alter table public.notification_logs enable row level security;
