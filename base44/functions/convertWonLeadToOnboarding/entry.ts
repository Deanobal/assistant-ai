import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const lead = payload?.data;
    const oldLead = payload?.old_data;

    if (payload?.event?.entity_name !== 'Lead') {
      return Response.json({ ignored: true, reason: 'Not a Lead event' });
    }

    if (!lead || lead.status !== 'Won') {
      return Response.json({ ignored: true, reason: 'Lead is not in Won status' });
    }

    if (oldLead?.status === 'Won' || oldLead?.status === 'Onboarding') {
      return Response.json({ ignored: true, reason: 'Lead was already processed' });
    }

    const now = new Date().toISOString();

    const existingOnboardingByLead = await base44.asServiceRole.entities.Onboarding.filter({ lead_id: lead.id }, '-updated_date', 1);
    const existingOnboardingByEmail = lead.email
      ? await base44.asServiceRole.entities.Onboarding.filter({ email: lead.email }, '-updated_date', 1)
      : [];
    const existingOnboarding = existingOnboardingByLead[0] || existingOnboardingByEmail[0] || null;

    const existingClientByLead = lead.client_account_id
      ? await base44.asServiceRole.entities.ClientAccount.filter({ id: lead.client_account_id }, '-updated_date', 1)
      : [];
    const existingClientByEmail = lead.email
      ? await base44.asServiceRole.entities.ClientAccount.filter({ email: lead.email }, '-updated_date', 1)
      : [];

    let clientAccount = existingClientByLead[0] || existingClientByEmail[0] || null;

    if (!clientAccount) {
      clientAccount = await base44.asServiceRole.entities.ClientAccount.create({
        business_name: lead.business_name || lead.full_name || 'New Client',
        contact_name: lead.full_name || 'Primary Contact',
        email: lead.email || '',
        phone: lead.mobile_number || '',
        website: '',
        address: '',
        industry: lead.industry || 'other',
        timezone: 'Australia/Sydney',
        plan_name: '',
        status: 'Onboarding',
        monthly_fee: 0,
        setup_fee_status: 'pending',
        billing_status: 'active',
        renewal_date: '',
        included_calls: 0,
        used_calls: 0,
        extra_call_packs: 0,
        overage_usage: 0,
        premium_support_add_on: false,
        monthly_revenue: 0,
        total_calls_month: 0,
        leads_captured: 0,
        appointments_booked: 0,
        last_activity: 'Converted from won lead',
        portal_access: true,
        notification_setting: 'standard',
        client_permissions: ['Overview', 'Calls', 'Analytics', 'Billing', 'Integrations', 'Support'],
        payment_method_label: '',
        requires_follow_up: false,
        active_services: [],
        lead_id: lead.id,
        services: [],
        notes_entries: [],
        integrations: [],
        recent_calls: [],
        invoices: [],
        analytics: {
          lead_conversion: 0,
          average_call_duration: '',
          peak_call_times: '',
          follow_up_metrics: '',
          trend: [],
          categories: [],
        },
        is_archived: false,
      });
    }

    let onboardingRecord = existingOnboarding;

    if (!onboardingRecord) {
      onboardingRecord = await base44.asServiceRole.entities.Onboarding.create({
        client_name: lead.business_name || lead.full_name || 'New Client',
        contact_name: lead.full_name || 'Primary Contact',
        email: lead.email || '',
        mobile: lead.mobile_number || '',
        industry: lead.industry || 'other',
        plan: '',
        payment_status: 'paid',
        intake_form_status: 'not_sent',
        assets_received: false,
        workflow_mapped: false,
        ai_agent_built: false,
        integrations_connected: false,
        testing_status: 'not_started',
        go_live_status: 'not_ready',
        onboarding_stage: 'Payment Received',
        services_offered: '',
        service_areas: '',
        operating_hours: '',
        booking_rules: '',
        common_faqs: '',
        emergency_calls: false,
        preferred_tone_of_voice: '',
        escalation_contact_numbers: '',
        crm_used: '',
        calendar_used: '',
        sms_system_used: '',
        email_domain: '',
        logo_upload: '',
        additional_notes: '',
        lead_id: lead.id,
        client_account_id: clientAccount.id,
        onboarding_notes: lead.notes || '',
      });
    }

    const conversionNote = `[${now}] Lead converted to onboarding and linked to client account ${clientAccount.business_name || clientAccount.id}.`;
    const nextNotes = lead.notes ? `${lead.notes}\n\n${conversionNote}` : conversionNote;

    await base44.asServiceRole.entities.Lead.update(lead.id, {
      ...lead,
      status: 'Onboarding',
      client_account_id: clientAccount.id,
      last_activity_at: now,
      next_action: 'Send onboarding intake form',
      notes: nextNotes,
    });

    return Response.json({
      success: true,
      onboarding_id: onboardingRecord.id,
      client_account_id: clientAccount.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});