# AssistantAI Supabase operations

Supabase is the production data, authentication and storage platform for AssistantAI.

## Target architecture

- Vercel: frontend and serverless API routes
- Supabase: Postgres, Auth, Storage and row-level security
- Stripe: checkout and billing
- Vapi: voice assistant tool calls
- GoHighLevel: CRM and follow-up
- Resend and Twilio: notifications

## Security

Do not commit service-role keys, database passwords, Stripe secrets, Vapi secrets, GoHighLevel secrets, Twilio secrets or Resend keys.

Client access requires the portal RLS migration. A confirmed Supabase user may claim only the client record matching their email, and authenticated browser roles receive read access only to rows owned by that client.

## Launch verification

Verify contact capture, Starter and Growth checkout, Stripe webhook idempotency, onboarding creation, admin notifications, Vapi tools and client portal isolation against the production deployment before paid acquisition.
