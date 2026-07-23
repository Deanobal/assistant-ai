# AssistantAI backend routes

The production backend is implemented as Vercel Functions backed by Supabase.

## Public routes

- Lead, contact and strategy-call submission routes validate public input and perform narrowly scoped server-side writes.
- `POST /api/stripe-checkout` accepts only Starter or Growth and maps those names to server-owned Stripe Price IDs.
- `POST /api/stripe-webhook` verifies Stripe's raw-body signature before processing a payment event.
- Vapi webhook/tool routes must verify their configured secret before mutating data.

## Admin routes

- `/api/native-*`, `/api/admin-ai-*`, `/api/config-status` and client workspace administration require the signed admin session cookie.
- Admin session signing uses `ADMIN_SESSION_SECRET`; the password is never stored in browser storage.

## Client portal

- Supabase Auth identifies the client.
- Row-level security binds the authenticated user to one `clients.auth_user_id` record.
- Portal access is read-only and limited to rows owned by that client.

## Security rules

- Never expose server keys through `VITE_` variables.
- Stripe, Supabase service role, Vapi, GoHighLevel, Twilio and Resend keys remain server-only.
- Webhooks verify signatures or shared secrets before mutations.
- Direct leaf-route requests must enforce the same authentication as aggregator routes.
