# Production environment blockers - 2026-05-20

Live config endpoint checked:

https://www.assistantai.com.au/api/config-status

## Current state

The application code for Supabase, Stripe checkout, Stripe webhook, Vapi tool calls, portal resolver, onboarding start, GoHighLevel sync and notification logging is deployed to Vercel.

The following production routes are live:

- /api/health
- /api/config-status
- /api/contact-submit
- /api/leads-create
- /api/onboarding-start
- /api/notifications-send
- /api/ghl-sync
- /api/client-portal-resolve
- /api/vapi-tool-call
- /api/stripe-checkout
- /api/stripe-webhook

## Confirmed live route checks

GET /api/stripe-checkout returns 405 Method Not Allowed. Correct.

GET /api/stripe-webhook returns 405 Method Not Allowed. Correct.

## Critical missing Vercel environment variables

These must be added in Vercel before the migrated backend can run live.

### Supabase

Missing:

- SUPABASE_SERVICE_ROLE_KEY

Present:

- VITE_SUPABASE_URL

Impact:

- Contact form Supabase write fails
- Signup lead Supabase write fails
- Client portal Supabase resolver fails
- Stripe webhook cannot create client/onboarding records
- Vapi lead capture cannot write to Supabase

### Stripe

Missing:

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

Present:

- STRIPE_STARTER_SETUP_PRICE_ID
- STRIPE_STARTER_PRICE_ID
- STRIPE_GROWTH_SETUP_PRICE_ID
- STRIPE_GROWTH_PRICE_ID

Impact:

- /api/stripe-checkout cannot create live checkout sessions
- /api/stripe-webhook cannot verify Stripe webhook calls
- GetStartedNow will fall back to Base44 checkout until this is fixed

### Vapi

Missing:

- VAPI_WEBHOOK_SECRET

Present:

- VITE_VAPI_PUBLIC_KEY
- VITE_VAPI_ASSISTANT_ID

Impact:

- Vapi route can work without the secret if left unset, but production security is weaker
- Recommended: set VAPI_WEBHOOK_SECRET and configure Vapi to send x-webhook-secret

### GoHighLevel

Missing:

- GHL_API_KEY
- GHL_LOCATION_ID

Impact:

- /api/ghl-sync returns safe not_configured response
- Lead CRM sync is not active yet

### Email notifications

Missing:

- RESEND_API_KEY
- RESEND_FROM_EMAIL
- ADMIN_NOTIFICATION_EMAIL

Impact:

- Notifications are logged to Supabase only
- Email delivery is not active yet

### SMS notifications

Required:

- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_FROM_NUMBER
- ADMIN_NOTIFICATION_PHONE

Current sender/admin number to use moving forward:

- TWILIO_FROM_NUMBER=+61482088811
- ADMIN_NOTIFICATION_PHONE=+61482088811

Impact if missing:

- SMS alerts are not active yet

## Required Vercel action

Go to:

Vercel -> assistant-ai-2h29 -> Settings -> Environment Variables

Add at minimum:

- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

Set for:

- Production
- Preview
- Development if required

Then redeploy latest production deployment.

## Required Stripe action

Create webhook endpoint:

https://www.assistantai.com.au/api/stripe-webhook

Event:

- checkout.session.completed

Copy the webhook signing secret into Vercel as:

- STRIPE_WEBHOOK_SECRET

## Required SMS action

Set the Twilio sender/admin number wherever SMS configuration is stored:

- Vercel environment variables
- Base44/backend secrets
- Supabase app settings/config tables if used
- Vapi webhook/tool payloads should reference backend env vars, not hardcoded numbers
- Admin settings screens should display +61482088811 as the current SMS sender/admin number

Use:

- TWILIO_FROM_NUMBER=+61482088811
- ADMIN_NOTIFICATION_PHONE=+61482088811

## Launch status

Code migration: largely complete.

Live execution: blocked by missing production environment variables if these remain unset.

Base44 remains as fallback for checkout and auth until the missing env vars are added and tested.
