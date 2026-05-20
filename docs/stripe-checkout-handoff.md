# Stripe checkout migration handoff

The Supabase/Vercel backend now has the non-payment migration layer in place. The remaining payment cutover must be applied carefully through Codex/Codespaces or a manual PR because direct live payment route writes may be blocked by safety controls.

## Goal

Replace Base44 checkout creation with a Vercel API route while preserving Base44 fallback until production testing passes.

## Route to add

POST /api/stripe-checkout

## Allowed plans

Only these plans should create instant checkout:

- Starter
- Growth

Enterprise should not create checkout by default. It should create or update a lead and mark it as Enterprise Review Required.

## Required server environment variables

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_STARTER_SETUP_PRICE_ID
- STRIPE_STARTER_PRICE_ID
- STRIPE_GROWTH_SETUP_PRICE_ID
- STRIPE_GROWTH_PRICE_ID
- VITE_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

Do not expose STRIPE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY to frontend code.

## Request body

- lead_id
- selected_plan or plan
- full_name
- business_name
- email

## Behaviour

1. Validate method is POST.
2. Validate selected plan is Starter or Growth only.
3. Resolve Stripe setup and monthly price IDs from server env.
4. Create Stripe Checkout session in subscription mode.
5. Include setup fee and monthly subscription line items.
6. Include metadata:
   - lead_id
   - selected_plan
   - name
7. Return:
   - success
   - checkout_url
   - session_id
   - selected_plan
8. If lead_id exists, update Supabase leads:
   - selected_plan
   - checkout_url
   - checkout_session_id
   - checkout_created_at
   - status = Payment Pending
   - payment_status = pending

## Frontend cutover rule

GetStartedNow should call /api/stripe-checkout first.
If it fails, keep Base44 createCheckoutForQualifiedLead fallback until Supabase webhook is live.

## Test cases

1. Starter checkout creates Stripe URL.
2. Growth checkout creates Stripe URL.
3. Enterprise returns blocked/escalation response.
4. Missing price IDs returns server configuration error.
5. Missing Stripe key returns server configuration error.
6. Successful checkout updates Supabase lead to Payment Pending.
7. No private keys appear in browser bundle or network response.

## Do not cut over fully until

- /api/stripe-checkout passes Starter and Growth tests
- /api/stripe-webhook is live and verified
- paid checkout creates Client, BillingStatus, IntakeForm, IntegrationStatus, ClientNote and OnboardingTask rows
- admin notification is logged
- Base44 fallback can be removed safely
