-- AssistantAI Vapi routing fields
-- Allows the inbound Vapi assistant-request router to map any phone number/assistant to the correct client.

alter table public.clients
  add column if not exists vapi_assistant_id text,
  add column if not exists vapi_phone_number_id text,
  add column if not exists vapi_phone_number text,
  add column if not exists vapi_inbound_route_enabled boolean not null default true;

create index if not exists clients_vapi_assistant_id_idx on public.clients(vapi_assistant_id);
create index if not exists clients_vapi_phone_number_id_idx on public.clients(vapi_phone_number_id);
create index if not exists clients_vapi_phone_number_idx on public.clients(vapi_phone_number);

update public.clients
set
  vapi_assistant_id = coalesce(vapi_assistant_id, '8452ae19-09ee-4457-8379-8f46ecb6996e'),
  vapi_phone_number_id = coalesce(vapi_phone_number_id, '09f37f50-6550-4d81-be85-d05c4b65ee3b'),
  vapi_phone_number = coalesce(vapi_phone_number, '+13618852186'),
  vapi_inbound_route_enabled = true
where id = 'e1ef2110-58e6-4abb-9ac0-24d3d0abbddc';
