import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import Stripe from 'stripe';

import {
  createAdminSessionCookie,
  isAdminRequest,
  requireAdmin,
} from '../api/_native-auth.js';
import adminAiChat from '../api/admin-ai-chat.js';
import adminAiMetrics from '../api/admin-ai-metrics.js';
import adminClientSafeUpdate from '../api/admin-client-safe-update.js';
import analyticsSummary from '../api/analytics-summary.js';
import clientPortalResolve from '../api/client-portal-resolve.js';
import clientCallRecordings from '../api/client-call-recordings.js';
import clientWorkspace from '../api/client-workspace.js';
import cms from '../api/cms.js';
import configStatus from '../api/config-status.js';
import ghlSync from '../api/ghl-sync.js';
import googleAcquisitionSummary from '../api/google-acquisition-summary.js';
import intakeSave from '../api/intake-save.js';
import launchReadiness from '../api/launch-readiness.js';
import nativeBillingActions from '../api/native-billing-actions.js';
import nativeCampaigns from '../api/native-campaigns.js';
import nativeConfig from '../api/native-config.js';
import nativeEntity from '../api/native-entity.js';
import nativeFunction from '../api/native-function.js';
import nativeLeadActions from '../api/native-lead-actions.js';
import nativeSupport from '../api/native-support.js';
import notificationsSend from '../api/notifications-send.js';
import onboardingCreate from '../api/onboarding-create.js';
import onboardingStart from '../api/onboarding-start.js';
import secureSetupCreate from '../api/secure-setup-create.js';
import { integrationIdentifier, PLAN_CONFIG } from '../api/stripe-checkout.js';
import { constructStripeWebhookEvent } from '../api/stripe-webhook.js';
import voiceProviderStatus from '../api/voice-provider-status.js';

const ORIGINAL_ENV = { ...process.env };

function responseRecorder() {
  return {
    headers: {},
    statusCode: 200,
    body: undefined,
    setHeader(name, value) {
      this.headers[String(name).toLowerCase()] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

beforeEach(() => {
  process.env.ADMIN_SESSION_SECRET = 'test-session-secret-with-sufficient-entropy';
  process.env.NODE_ENV = 'production';
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

test('admin session cookies are signed, HttpOnly and reject tampering', () => {
  const cookie = createAdminSessionCookie();
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);

  const pair = cookie.split(';')[0];
  assert.equal(isAdminRequest({ headers: { cookie: pair } }), true);

  const [name, value] = pair.split('=');
  const tampered = `${name}=${value.slice(0, -1)}${value.endsWith('a') ? 'b' : 'a'}`;
  assert.equal(isAdminRequest({ headers: { cookie: tampered } }), false);
});

test('missing session configuration fails closed without breaking anonymous requests', () => {
  delete process.env.ADMIN_SESSION_SECRET;
  delete process.env.ADMIN_ACCESS_PASSWORD;

  assert.equal(isAdminRequest({ headers: {} }), false);
  assert.throws(() => createAdminSessionCookie(), /ADMIN_SESSION_SECRET/);

  const res = responseRecorder();
  assert.equal(requireAdmin({ headers: {} }, res), false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.headers['cache-control'], 'private, no-store');
});

test('privileged leaf routes reject unauthenticated direct requests', async () => {
  const cases = [
    ['admin AI chat', adminAiChat, { method: 'POST', headers: {}, body: {} }],
    ['admin AI metrics', adminAiMetrics, { method: 'GET', headers: {}, query: {} }],
    ['admin safe update', adminClientSafeUpdate, { method: 'POST', headers: {}, body: {} }],
    ['analytics summary', analyticsSummary, { method: 'GET', headers: {}, query: {} }],
    ['client call recordings', clientCallRecordings, { method: 'POST', headers: {}, body: {} }],
    ['configuration status', configStatus, { method: 'GET', headers: {}, query: {} }],
    ['CMS mutation', cms, { method: 'POST', headers: {}, query: { resource: 'content-blocks' }, body: {} }],
    ['CRM sync', ghlSync, { method: 'POST', headers: {}, body: {} }],
    ['Google acquisition summary', googleAcquisitionSummary, { method: 'GET', headers: {}, query: {} }],
    ['intake save', intakeSave, { method: 'POST', headers: {}, body: {} }],
    ['launch readiness', launchReadiness, { method: 'GET', headers: {}, query: {} }],
    ['client workspace', clientWorkspace, { method: 'GET', headers: {}, query: {} }],
    ['legacy client resolver', clientPortalResolve, { method: 'POST', headers: {}, body: {} }],
    ['native billing', nativeBillingActions, { method: 'POST', headers: {}, body: {} }],
    ['native campaigns', nativeCampaigns, { method: 'POST', headers: {}, body: {} }],
    ['native config', nativeConfig, { method: 'POST', headers: {}, body: {} }],
    ['native entity gateway', nativeEntity, { method: 'GET', headers: {}, query: {} }],
    ['native function gateway', nativeFunction, { method: 'POST', headers: {}, body: {} }],
    ['native lead actions', nativeLeadActions, { method: 'POST', headers: {}, body: {} }],
    ['native support', nativeSupport, { method: 'POST', headers: {}, body: {} }],
    ['notification sender', notificationsSend, { method: 'POST', headers: {}, body: {} }],
    ['onboarding create', onboardingCreate, { method: 'POST', headers: {}, body: {} }],
    ['onboarding start', onboardingStart, { method: 'POST', headers: {}, body: {} }],
    ['secure setup diagnostics', secureSetupCreate, { method: 'GET', headers: {}, query: {} }],
    ['voice provider status', voiceProviderStatus, { method: 'GET', headers: {}, query: {} }],
  ];

  for (const [name, handler, req] of cases) {
    const res = responseRecorder();
    await handler(req, res);
    assert.equal(res.statusCode, 401, `${name} should require an admin session`);
    assert.equal(res.body?.error, 'Admin authentication required');
  }
});

test('public checkout accepts only server-owned Stripe price mappings', () => {
  assert.deepEqual(Object.keys(PLAN_CONFIG).sort(), ['growth', 'starter']);
  assert.equal(PLAN_CONFIG.starter.setup_price_env, 'STRIPE_STARTER_SETUP_PRICE_ID');
  assert.equal(PLAN_CONFIG.growth.monthly_price_env, 'STRIPE_GROWTH_PRICE_ID');
  assert.match(integrationIdentifier(), /^assistantai_[a-z]{8}$/);
});

test('Stripe webhook verification rejects tampering and replayed signatures', () => {
  const webhookSecret = 'whsec_test_secret';
  const payload = JSON.stringify({ id: 'evt_test', type: 'checkout.session.completed', data: { object: {} } });
  const stripe = new Stripe('webhook-test-header-generator', { apiVersion: '2026-06-24.dahlia' });
  const currentHeader = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });

  const event = constructStripeWebhookEvent(Buffer.from(payload), currentHeader, webhookSecret);
  assert.equal(event.id, 'evt_test');
  assert.throws(
    () => constructStripeWebhookEvent(Buffer.from(`${payload} `), currentHeader, webhookSecret),
    /signature/i,
  );

  const staleHeader = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: webhookSecret,
    timestamp: Math.floor(Date.now() / 1000) - 600,
  });
  assert.throws(
    () => constructStripeWebhookEvent(Buffer.from(payload), staleHeader, webhookSecret),
    /timestamp/i,
  );
});
