-- Superseded by 20260722213530_harden_client_portal_rls.sql.
-- Keep this migration safe on databases where the optional call_records table
-- has not been provisioned yet.

begin;

alter table public.integration_status enable row level security;
alter table public.client_notes enable row level security;

do $$
begin
  if to_regclass('public.call_records') is not null then
    execute 'alter table public.call_records enable row level security';
  end if;
end
$$;

commit;
