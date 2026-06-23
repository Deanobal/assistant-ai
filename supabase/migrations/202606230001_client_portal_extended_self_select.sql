-- AssistantAI client portal extended read policies
-- Additive only: does not alter or drop service-role policies.
-- Purpose: allow authenticated client portal users to read their own
-- integrations, call analytics records, and non-archived client notes.

begin;

alter table public.integration_status enable row level security;
alter table public.call_records enable row level security;
alter table public.client_notes enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'integration_status'
      and policyname = 'client_self_select'
  ) then
    create policy client_self_select
      on public.integration_status
      for select
      to authenticated
      using (client_id = public.current_client_id());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'call_records'
      and policyname = 'client_self_select'
  ) then
    create policy client_self_select
      on public.call_records
      for select
      to authenticated
      using (client_id = public.current_client_id());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'client_notes'
      and policyname = 'client_self_select'
  ) then
    create policy client_self_select
      on public.client_notes
      for select
      to authenticated
      using (
        client_id = public.current_client_id()
        and coalesce(is_archived, false) = false
      );
  end if;
end $$;

commit;
