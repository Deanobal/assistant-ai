import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@18.4.0';

function clean(value) {
  return String(value || '').trim();
}

function getStripeMode() {
  const mode = clean(Deno.env.get('STRIPE_MODE')).toLowerCase();
  return mode === 'live' ? 'live' : 'test';
}

function getStripeSecret(mode) {
  const secret = mode === 'test'
    ? clean(Deno.env.get('STRIPE_TEST_SECRET_KEY'))
    : clean(Deno.env.get('STRIPE_SECRET_KEY'));
  if (!secret) throw new Error(`Missing Stripe ${mode} secret key`);
  if (mode === 'test' && secret.startsWith('sk_live_')) throw new Error('STRIPE_MODE=test cannot use a live Stripe key');
  if (mode === 'live' && secret.startsWith('sk_test_')) throw new Error('STRIPE_MODE=live cannot use a test Stripe key');
  return secret;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const sessionId = clean(payload.session_id || payload.sessionId);
    if (!sessionId) return Response.json({ error: 'session_id is required' }, { status: 400 });
    if (!sessionId.startsWith('cs_test_')) return Response.json({ error: 'Only cs_test sessions can be manually reprocessed here' }, { status: 400 });

    const stripeMode = getStripeMode();
    const stripe = new Stripe(getStripeSecret(stripeMode), { apiVersion: '2025-02-24.acacia' });
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });

    if (session.status !== 'complete' || session.payment_status !== 'paid') {
      return Response.json({ error: 'Checkout session is not complete and paid', status: session.status, payment_status: session.payment_status }, { status: 400 });
    }

    const metadata = session.metadata || {};
    const leadId = clean(metadata.lead_id || metadata.leadId) || (await base44.asServiceRole.entities.Lead.filter({ checkout_session_id: session.id }, '-updated_date', 1))[0]?.id;
    if (!leadId) return Response.json({ error: 'Lead not found for checkout session' }, { status: 404 });

    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || '';
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || '';
    const subscription = subscriptionId ? (typeof session.subscription === 'string' ? await stripe.subscriptions.retrieve(subscriptionId) : session.subscription) : null;
    const renewalDate = subscription?.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString().slice(0, 10) : null;
    const subscriptionConfigured = !!subscriptionId;

    const leads = await base44.asServiceRole.entities.Lead.filter({ id: leadId }, '-updated_date', 1);
    const lead = leads[0];
    if (!lead) return Response.json({ error: 'Lead not found' }, { status: 404 });

    const plan = clean(metadata.plan || payload.selected_plan || lead.selected_plan || 'Growth');
    const pricing = plan === 'Growth' ? { setup_fee: 3000, monthly_fee: 1500 } : plan === 'Enterprise' ? { setup_fee: 7500, monthly_fee: 3000 } : { setup_fee: 1500, monthly_fee: 497 };
    const now = new Date().toISOString();

    const existingClients = await base44.asServiceRole.entities.Client.filter({ source_lead_id: lead.id }, '-updated_date', 1);
    const clientPayload = {
      ...(existingClients[0] || {}),
      full_name: lead.full_name || 'Primary Contact',
      business_name: lead.business_name || lead.full_name || 'New Client',
      email: lead.email,
      mobile_number: lead.mobile_number || '',
      industry: lead.industry || 'other',
      website: lead.website || '',
      main_service: lead.service_needed || '',
      monthly_enquiry_volume: lead.monthly_enquiry_volume || '0_20',
      biggest_problem: lead.current_call_handling || lead.conversation_summary || '',
      current_missed_call_handling: lead.current_call_handling || '',
      ai_first_goal: lead.service_needed || '',
      plan,
      status: 'Onboarding',
      lifecycle_state: 'pre_live',
      progress_percentage: existingClients[0]?.progress_percentage || 0,
      assigned_owner: lead.assigned_owner || '',
      target_go_live_date: existingClients[0]?.target_go_live_date || null,
      source_lead_id: lead.id,
      last_activity: 'Stripe payment confirmed. Onboarding started automatically.',
      blockers: (existingClients[0]?.blockers || ['Missing intake details', 'Missing integrations']).filter((item) => item !== 'Unpaid billing'),
      next_action: 'Complete onboarding intake form',
      workflow_phase: 'Kickoff',
      assets_status: existingClients[0]?.assets_status || 'not_started',
      onboarding_archived: false,
      go_live_ready: false,
      go_live_date: existingClients[0]?.go_live_date || null,
      shared_files: existingClients[0]?.shared_files || [],
    };
    const client = existingClients[0]
      ? await base44.asServiceRole.entities.Client.update(existingClients[0].id, clientPayload)
      : await base44.asServiceRole.entities.Client.create(clientPayload);

    const intake = await base44.asServiceRole.entities.IntakeForm.filter({ client_id: client.id }, '-updated_date', 1);
    if (!intake[0]) {
      await base44.asServiceRole.entities.IntakeForm.create({
        client_id: client.id,
        business_name: client.business_name,
        contact_name: client.full_name,
        phone: client.mobile_number || lead.mobile_number || '',
        email: client.email,
        website: client.website || '',
        industry: client.industry || 'other',
        service_areas: '',
        crm_used_now: lead.crm_used_now || '',
        calendar_used_now: lead.calendar_used_now || '',
        messaging_sms_tool: lead.wants_sms_followup ? 'SMS follow-up requested' : '',
        payment_billing_method: 'Stripe',
        main_business_phone: '',
        business_hours: '',
        after_hours_rules: '',
        hot_lead_definition: '',
        urgent_job_definition: '',
        escalation_rules: '',
        ai_never_say_rules: '',
        booking_rules: lead.wants_booking ? 'Booking requested during qualification.' : '',
        required_capture_before_handoff: '',
        escalation_contacts: '',
        scripts_assets: '',
        faq_list: '',
        pricing_guidance: '',
        objection_handling: '',
        sensitive_data_limits: '',
        recordings_allowed: false,
        sms_followup_approved: !!lead.wants_sms_followup,
        outbound_calling_approved: false,
        final_approver: '',
        approval_status: 'draft',
        last_updated: now,
        is_archived: false,
      });
    }

    const billing = await base44.asServiceRole.entities.BillingStatus.filter({ client_id: client.id }, '-updated_date', 1);
    const billingPayload = {
      ...(billing[0] || {}),
      client_id: client.id,
      plan,
      setup_fee: pricing.setup_fee,
      monthly_fee: pricing.monthly_fee,
      billing_status: subscriptionConfigured ? 'active' : 'setup_paid_subscription_pending',
      setup_fee_paid: true,
      subscription_status: subscriptionConfigured ? 'active' : 'pending',
      payment_method: customerId,
      invoice_reference: session.id,
      renewal_date: renewalDate,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId || null,
      stripe_checkout_session_id: session.id,
      admin_override: false,
      notes: subscriptionConfigured ? 'Stripe payment and subscription confirmed.' : 'Setup fee paid. Subscription setup requires admin follow-up.',
    };
    await (billing[0]
      ? base44.asServiceRole.entities.BillingStatus.update(billing[0].id, billingPayload)
      : base44.asServiceRole.entities.BillingStatus.create(billingPayload));

    const existingTasks = await base44.asServiceRole.entities.OnboardingTask.filter({ client_id: client.id }, '-updated_date', 100);
    if (!existingTasks.length) {
      await base44.asServiceRole.entities.OnboardingTask.bulkCreate([
        'confirm setup payment received',
        'collect business details',
        'collect service list and service areas',
        'collect hours, escalation rules, and FAQs',
        'build AI receptionist call flow',
        'test lead capture scenarios',
        'client approval and go live',
        'CRM access received',
        'calendar booking rules confirmed',
        'SMS/email follow-up configured',
        'portal reporting visibility enabled',
      ].map((taskName) => ({
        client_id: client.id,
        task_name: taskName,
        task_phase: taskName.includes('CRM') || taskName.includes('SMS') ? 'Integrations' : taskName.includes('calendar') ? 'Workflow Mapping' : taskName.includes('test') ? 'Testing' : taskName.includes('go live') || taskName.includes('portal') ? 'Go Live' : taskName.includes('collect') ? 'Asset Collection' : taskName.includes('build') ? 'Build' : 'Payment',
        required: true,
        completed: taskName === 'confirm setup payment received',
        blocked: false,
        plan_scope: ['CRM access received', 'calendar booking rules confirmed', 'SMS/email follow-up configured', 'portal reporting visibility enabled'].includes(taskName) ? 'Growth' : 'Starter',
        due_date: null,
        assigned_to: client.assigned_owner || '',
        notes: '',
        is_archived: false,
      })));
    }

    const existingIntegrations = await base44.asServiceRole.entities.IntegrationStatus.filter({ client_id: client.id }, '-updated_date', 50);
    if (!existingIntegrations.length) {
      await base44.asServiceRole.entities.IntegrationStatus.bulkCreate([
        { client_id: client.id, integration_type: 'crm', integration_name: 'GoHighLevel', connection_status: 'pending', last_sync: null, notes: '' },
        { client_id: client.id, integration_type: 'calendar', integration_name: 'Google Calendar', connection_status: 'pending', last_sync: null, notes: '' },
        { client_id: client.id, integration_type: 'sms', integration_name: 'Twilio', connection_status: 'planned', last_sync: null, notes: '' },
        { client_id: client.id, integration_type: 'payments', integration_name: 'Stripe', connection_status: 'connected', last_sync: now, notes: 'Payment confirmed by Stripe.' },
      ]);
    }

    const notes = await base44.asServiceRole.entities.ClientNote.filter({ client_id: client.id }, '-updated_date', 50);
    if (!notes.some((note) => String(note.content || '').includes(session.id))) {
      await base44.asServiceRole.entities.ClientNote.create({
        client_id: client.id,
        note_type: 'onboarding_note',
        content: `Stripe payment confirmed and onboarding created. Session: ${session.id}. Plan: ${plan}.`,
        created_by: 'system',
        created_at: now,
        is_archived: false,
      });
    }

    await base44.asServiceRole.entities.Lead.update(lead.id, {
      ...lead,
      status: 'Won',
      payment_status: 'paid',
      selected_plan: plan,
      checkout_session_id: session.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId || null,
      payment_confirmed_at: now,
      client_account_id: client.id,
      last_activity_at: now,
      next_action: 'Complete onboarding intake form',
      notes: [lead.notes, `[${now}] Stripe payment confirmed. Client onboarding started automatically.`].filter(Boolean).join('\n\n'),
    });

    const logs = await base44.asServiceRole.entities.StripeEventLog.filter({ checkout_session_id: session.id }, '-updated_date', 10);
    const checkoutLog = logs.find((log) => log.event_type === 'checkout.session.completed') || null;
    const businessResult = { manual_reprocess: true, client_id: client.id, lead_id: lead.id, plan };

    if (checkoutLog) {
      await base44.asServiceRole.entities.StripeEventLog.update(checkoutLog.id, {
        ...checkoutLog,
        lead_id: leadId,
        processing_status: 'event_processed_successfully',
        processing_completed_at: now,
        processed_at: now,
        status: 'processed',
        related_client_id: client.id,
        business_result: businessResult,
        error_message: null,
      });
    } else {
      await base44.asServiceRole.entities.StripeEventLog.create({
        stripe_event_id: `manual_${session.id}`,
        event_type: 'checkout.session.completed',
        checkout_session_id: session.id,
        lead_id: leadId,
        processing_status: 'event_processed_successfully',
        processing_started_at: now,
        processing_completed_at: now,
        business_result: businessResult,
        error_message: null,
        retry_count: 0,
        processed_at: now,
        status: 'processed',
        related_client_id: client.id,
      });
    }

    return Response.json({
      success: true,
      session_id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      customer_id: customerId,
      subscription_id: subscriptionId,
      result: businessResult,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});