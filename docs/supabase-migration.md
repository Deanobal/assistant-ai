# AssistantAI Supabase Migration

This document tracks the controlled migration away from Base44.

## Target architecture

- Vercel: public frontend and API routes
- Supabase: database, auth, storage, realtime
- Stripe: checkout and billing
- Vapi: voice assistant tool calls
- GoHighLevel: CRM/follow-up
- Resend/Twilio: notifications

## Supabase project

Project URL: https://rygyswsngskbdpgeqloy.supabase.co
Project ref: rygyswsngskbdpgeqloy

## Security

Do not commit service-role keys, database passwords, Stripe secrets, Vapi secrets, GoHighLevel secrets, Twilio secrets, or Resend keys.

## Cutover rule

Base44 must remain as fallback until the following pass on the new backend:

1. Contact form
2. Starter checkout
3. Growth checkout
4. Stripe webhook
5. Onboarding record creation
6. Admin notification
7. Vapi tool-call checkout
8. Client portal login
