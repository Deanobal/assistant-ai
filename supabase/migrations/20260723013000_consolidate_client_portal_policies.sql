-- Remove superseded portal policies after the private client lookup becomes
-- authoritative. This closes legacy email-fallback reads and avoids evaluating
-- multiple permissive policies for every portal query.

begin;

drop policy if exists client_self_select_20260621_clients
  on public.clients;
drop policy if exists client_self_select_20260621_billing_status
  on public.billing_status;
drop policy if exists client_self_select_20260621_intake_forms
  on public.intake_forms;
drop policy if exists client_self_select_20260621_integration_status
  on public.integration_status;
drop policy if exists client_self_select_20260621_onboarding_tasks
  on public.onboarding_tasks;
drop policy if exists client_self_select_20260621_client_call_recordings
  on public.client_call_recordings;
drop policy if exists client_self_select_20260621_secure_setup_requests
  on public.secure_setup_requests;

drop policy if exists "Service role only legacy billing status"
  on public.billing_status;
drop policy if exists "Service role only legacy integration status"
  on public.integration_status;
drop policy if exists "Service role only client call recordings"
  on public.client_call_recordings;
drop policy if exists "Service role only secure setup requests"
  on public.secure_setup_requests;

revoke all on function public.current_client_id() from public, anon, authenticated;
drop function if exists public.current_client_id();

-- Both indexes had the same lower(email) definition. Keep the explicitly named
-- clients_lower_email_idx and remove only the redundant copy.
drop index if exists public.idx_clients_email;

commit;
