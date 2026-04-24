import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const fullName = payload.fullName?.trim();
    const businessName = payload.businessName?.trim() || fullName || 'New Client';
    const email = payload.email?.trim()?.toLowerCase();
    const mobileNumber = payload.mobileNumber?.trim() || '';
    const industry = payload.industry || 'other';
    const website = payload.website?.trim() || '';
    const plan = payload.plan || 'Starter';

    if (!fullName || !email) {
      return Response.json({ error: 'fullName and email are required' }, { status: 400 });
    }

    const byEmail = await base44.asServiceRole.entities.Client.filter({ email }, '-updated_date', 10);
    const byMobile = mobileNumber ? await base44.asServiceRole.entities.Client.filter({ mobile_number: mobileNumber }, '-updated_date', 10) : [];
    const existingClient = [...byEmail, ...byMobile][0] || null;

    const clientPayload = {
      full_name: fullName,
      business_name: businessName,
      email,
      mobile_number: mobileNumber,
      industry,
      website,
      main_service: existingClient?.main_service || '',
      monthly_enquiry_volume: payload.monthlyEnquiryVolume || existingClient?.monthly_enquiry_volume || '0_20',
      biggest_problem: payload.message || existingClient?.biggest_problem || '',
      current_missed_call_handling: existingClient?.current_missed_call_handling || '',
      ai_first_goal: existingClient?.ai_first_goal || '',
      plan,
      status: existingClient?.status || 'Awaiting Payment',
      lifecycle_state: existingClient?.lifecycle_state || 'pre_live',
      progress_percentage: existingClient?.progress_percentage || 0,
      assigned_owner: existingClient?.assigned_owner || '',
      target_go_live_date: existingClient?.target_go_live_date || null,
      source_lead_id: existingClient?.source_lead_id || null,
      last_activity: 'Public Stripe setup started',
      blockers: existingClient?.blockers || ['Unpaid billing'],
      next_action: 'Complete Stripe checkout to unlock onboarding.',
      workflow_phase: existingClient?.workflow_phase || 'Payment',
      assets_status: existingClient?.assets_status || 'not_started',
      onboarding_archived: existingClient?.onboarding_archived || false,
      go_live_ready: existingClient?.go_live_ready || false,
      go_live_date: existingClient?.go_live_date || null,
      shared_files: existingClient?.shared_files || [],
    };

    if (existingClient) {
      const updated = await base44.asServiceRole.entities.Client.update(existingClient.id, {
        ...existingClient,
        ...clientPayload,
      });
      return Response.json({ success: true, client: updated, updated: true });
    }

    const created = await base44.asServiceRole.entities.Client.create(clientPayload);
    return Response.json({ success: true, client: created, created: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});