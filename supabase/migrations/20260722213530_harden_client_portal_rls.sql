-- Bind each authenticated portal user to exactly one client and make every
-- browser-facing permission explicit. Server-side service-role routes retain
-- their normal RLS bypass for administration and webhook processing.

begin;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter table public.clients
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

alter table public.secure_setup_requests
  add column if not exists client_id uuid references public.clients(id) on delete cascade;

alter table public.client_call_recordings
  add column if not exists visible_to_client boolean not null default true;

-- Historical test accounts can contain duplicate client shells for one auth
-- user. Preserve every row, but keep the portal link on the most meaningful
-- record before enforcing the one-user-to-one-client invariant. Real client
-- rows are never detached automatically.
with ranked_test_links as (
  select
    c.id,
    c.is_test_record,
    row_number() over (
      partition by c.auth_user_id
      order by
        (not coalesce(c.is_test_record, false)) desc,
        (
          (select count(*) from public.leads t where t.client_id = c.id) +
          (select count(*) from public.billing_status t where t.client_id = c.id) +
          (select count(*) from public.intake_forms t where t.client_id = c.id) +
          (select count(*) from public.integration_status t where t.client_id = c.id) +
          (select count(*) from public.client_notes t where t.client_id = c.id) +
          (select count(*) from public.onboarding_tasks t where t.client_id = c.id) +
          (select count(*) from public.client_call_recordings t where t.client_id = c.id) +
          (select count(*) from public.secure_setup_requests t where t.client_id = c.id)
        ) desc,
        c.created_at asc,
        c.id asc
    ) as link_rank
  from public.clients c
  where c.auth_user_id is not null
)
update public.clients c
set auth_user_id = null,
    updated_at = now()
from ranked_test_links ranked
where c.id = ranked.id
  and ranked.link_rank > 1
  and coalesce(ranked.is_test_record, false) = true;

do $$
begin
  if exists (
    select 1
    from public.clients
    where auth_user_id is not null
    group by auth_user_id
    having count(*) > 1
  ) then
    raise exception 'Duplicate production client authentication links require manual review';
  end if;
end
$$;

create unique index if not exists clients_auth_user_id_uidx
  on public.clients(auth_user_id)
  where auth_user_id is not null;

create index if not exists secure_setup_requests_client_id_idx
  on public.secure_setup_requests(client_id);

create or replace function private.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id
  from public.clients
  where auth_user_id = (select auth.uid())
  limit 1
$$;

revoke all on function private.current_client_id() from public, anon;
grant execute on function private.current_client_id() to authenticated;

create or replace function public.claim_client_account()
returns table(client_id uuid, business_name text, email text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  caller_email text;
  email_confirmed_at timestamptz;
  claimed_client_id uuid;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  select lower(trim(email)), auth.users.email_confirmed_at
    into caller_email, email_confirmed_at
  from auth.users
  where id = caller_id;

  if caller_email is null or email_confirmed_at is null then
    raise exception 'A confirmed email address is required';
  end if;

  select id
    into claimed_client_id
  from public.clients
  where auth_user_id = caller_id
  limit 1;

  if claimed_client_id is not null then
    return query
    select c.id, c.business_name, c.email
    from public.clients c
    where c.id = claimed_client_id;
    return;
  end if;

  select id
    into claimed_client_id
  from public.clients
  where lower(trim(email)) = caller_email
    and auth_user_id is null
  order by created_at asc
  limit 1
  for update skip locked;

  if claimed_client_id is null then
    raise exception 'No client account is available for this user';
  end if;

  update public.clients
  set auth_user_id = caller_id,
      updated_at = now()
  where id = claimed_client_id
    and auth_user_id is null;

  if not found then
    raise exception 'Client account could not be claimed';
  end if;

  return query
  select c.id, c.business_name, c.email
  from public.clients c
  where c.id = claimed_client_id;
end
$$;

revoke all on function public.claim_client_account() from public, anon;
grant execute on function public.claim_client_account() to authenticated;

alter table public.leads enable row level security;
alter table public.clients enable row level security;
alter table public.billing_status enable row level security;
alter table public.intake_forms enable row level security;
alter table public.integration_status enable row level security;
alter table public.client_notes enable row level security;
alter table public.onboarding_tasks enable row level security;
alter table public.notification_logs enable row level security;
alter table public.stripe_event_logs enable row level security;
alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;
alter table public.campaigns enable row level security;
alter table public.client_call_recordings enable row level security;
alter table public.secure_setup_requests enable row level security;

do $$
begin
  if to_regclass('public.call_records') is not null then
    execute 'alter table public.call_records enable row level security';
  end if;
end
$$;

revoke all on table
  public.leads,
  public.clients,
  public.billing_status,
  public.intake_forms,
  public.integration_status,
  public.client_notes,
  public.onboarding_tasks,
  public.notification_logs,
  public.stripe_event_logs,
  public.support_conversations,
  public.support_messages,
  public.campaigns,
  public.client_call_recordings,
  public.secure_setup_requests
from anon, authenticated;

grant select on table
  public.clients,
  public.billing_status,
  public.intake_forms,
  public.integration_status,
  public.client_notes,
  public.onboarding_tasks,
  public.client_call_recordings,
  public.secure_setup_requests
to authenticated;

do $$
begin
  if to_regclass('public.call_records') is not null then
    execute 'revoke all on table public.call_records from anon, authenticated';
    execute 'grant select on table public.call_records to authenticated';
  end if;
end
$$;

drop policy if exists client_self_select on public.clients;
create policy client_self_select
  on public.clients
  for select
  to authenticated
  using (id = private.current_client_id());

drop policy if exists client_self_select on public.billing_status;
create policy client_self_select
  on public.billing_status
  for select
  to authenticated
  using (client_id = private.current_client_id());

drop policy if exists client_self_select on public.intake_forms;
create policy client_self_select
  on public.intake_forms
  for select
  to authenticated
  using (client_id = private.current_client_id());

drop policy if exists client_self_select on public.integration_status;
create policy client_self_select
  on public.integration_status
  for select
  to authenticated
  using (client_id = private.current_client_id());

drop policy if exists client_self_select on public.client_notes;
create policy client_self_select
  on public.client_notes
  for select
  to authenticated
  using (
    client_id = private.current_client_id()
    and coalesce(is_archived, false) = false
  );

drop policy if exists client_self_select on public.onboarding_tasks;
create policy client_self_select
  on public.onboarding_tasks
  for select
  to authenticated
  using (client_id = private.current_client_id());

drop policy if exists client_self_select on public.client_call_recordings;
create policy client_self_select
  on public.client_call_recordings
  for select
  to authenticated
  using (
    client_id = private.current_client_id()
    and coalesce(visible_to_client, true) = true
  );

drop policy if exists client_self_select on public.secure_setup_requests;
create policy client_self_select
  on public.secure_setup_requests
  for select
  to authenticated
  using (client_id = private.current_client_id());

do $$
begin
  if to_regclass('public.call_records') is not null then
    execute 'drop policy if exists client_self_select on public.call_records';
    execute $policy$
      create policy client_self_select
        on public.call_records
        for select
        to authenticated
        using (client_id = private.current_client_id())
    $policy$;
  end if;
end
$$;

commit;
