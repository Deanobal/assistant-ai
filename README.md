# AssistantAI

AssistantAI is the Australian AI receptionist website, operations console and client portal.

## Architecture

- Vite + React frontend deployed on Vercel
- Vercel Functions in `api/`
- Supabase Postgres, Auth and Storage
- Stripe Checkout and signed webhooks
- Vapi voice-agent integrations
- Twilio, Resend, GoHighLevel, Crisp and Google integrations

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and replace every placeholder required for the flow you are testing.
3. Run `npm run dev`.

Useful checks:

```sh
npm test
npm run lint
npm run typecheck
npm run build
```

## Database migrations

Supabase migrations live in `supabase/migrations`. Apply them through the Supabase CLI for the intended project and verify row-level security before enabling client access.

## Production deployment

Vercel must contain all server-only environment variables. Never prefix a secret with `VITE_`; Vite exposes those values to the browser bundle. Set `ADMIN_SESSION_SECRET` to an independent, high-entropy value and keep it separate from `ADMIN_ACCESS_PASSWORD`.

Production changes should pass the test, lint, typecheck and build commands before deployment.
