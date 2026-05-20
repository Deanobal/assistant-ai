# Supabase route tests

Use these after Vercel deploys the latest GitHub commits and after Supabase migrations are applied.

## 1. Health

Open:

```text
https://www.assistantai.com.au/api/health
```

Expected:

```json
{
  "ok": true,
  "service": "assistantai-api",
  "version": "supabase-migration-v1"
}
```

## 2. Contact lead capture

Use browser devtools or a REST client:

```bash
curl -X POST https://www.assistantai.com.au/api/contact-submit \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test Contact",
    "business_name": "Test Business",
    "email": "contact.test@example.com",
    "mobile_number": "0400000000",
    "enquiry_type": "pricing",
    "message": "Testing Supabase contact form route",
    "lead_source": "manual_test",
    "source_page": "/contact"
  }'
```

Expected:

```json
{
  "success": true,
  "lead": { "id": "..." }
}
```

Then check Supabase table:

```text
leads
```

## 3. Signup lead creation

```bash
curl -X POST https://www.assistantai.com.au/api/leads-create \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Starter Signup Test",
    "business_name": "Starter Test Co",
    "email": "starter.signup@example.com",
    "mobile_number": "0411111111",
    "industry": "Trades",
    "service_needed": "Missed call coverage",
    "current_call_handling": "Voicemail",
    "monthly_enquiry_volume": "20-50",
    "selected_plan": "Starter",
    "likely_plan_fit": "Starter",
    "buyer_intent": "ready_to_proceed"
  }'
```

Expected lead in Supabase with selected_plan Starter.

## 4. Manual onboarding start

```bash
curl -X POST https://www.assistantai.com.au/api/onboarding-start \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Onboarding Test",
    "business_name": "Onboarding Test Co",
    "email": "onboarding.test@example.com",
    "mobile_number": "0422222222",
    "industry": "Cleaning",
    "main_service": "Commercial cleaning",
    "plan": "Growth",
    "payment_status": "paid"
  }'
```

Expected:

```json
{
  "success": true,
  "lead": { "id": "..." },
  "client": { "id": "..." },
  "tasks_created": 14
}
```

Then check Supabase tables:

- leads
- clients
- billing_status
- intake_forms
- integration_status
- client_notes
- onboarding_tasks

## Current safety rule

Do not disable Base44 until all new Supabase routes pass production tests and Stripe webhook migration is complete.
