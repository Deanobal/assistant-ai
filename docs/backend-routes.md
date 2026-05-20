# AssistantAI backend route plan

These routes replace Base44 progressively. Do not remove Base44 fallback until every route is tested in production.

## Implemented

- GET /api/health
- POST /api/contact-submit

## Next routes

### POST /api/checkout-create
Creates Stripe Checkout for Starter or Growth.

Inputs:
- lead_id
- selected_plan: starter or growth
- full_name
- email

Behaviour:
- validate Starter/Growth only
- use Stripe secret key from Vercel server env
- use configured price IDs
- create subscription checkout session with setup fee and recurring price
- update Supabase lead with checkout URL and pending payment status

### POST /api/stripe-webhook
Processes Stripe checkout completion.

Behaviour:
- verify webhook signature
- dedupe using stripe_event_logs
- find lead by metadata.lead_id
- mark lead Won
- create or update client
- create billing_status
- create intake_forms
- create integration_status rows
- create onboarding_tasks from selected plan
- create client_note
- log notification

### POST /api/vapi-tool-call
Handles Vapi tool calls.

Required response shape:
{
  "results": [
    {
      "toolCallId": "call_xxx",
      "result": { "success": true }
    }
  ]
}

Supported tools:
- create_ai_qualified_lead
- create_checkout_for_qualified_lead

### POST /api/onboarding-start
Manual onboarding start shortcut.

Behaviour:
- create Lead as Won
- create Client
- create supporting canonical records
- redirect frontend to client workspace

## Security rules

- Never expose server keys through VITE variables
- Public browser values only use VITE prefix
- Stripe, Supabase service role, GHL, Twilio and Resend keys stay server-only
- Webhooks must verify signatures/secrets before mutating data
