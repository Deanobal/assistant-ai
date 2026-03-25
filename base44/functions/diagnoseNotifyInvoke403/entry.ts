import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const response = await base44.functions.invoke('sendAdminAlert', {
      eventType: 'new_lead_created',
      entityName: 'Lead',
      entityId: payload?.entityId || 'diagnose-notify-invoke-403',
      clientAccountId: null,
      title: 'Diagnose notify invoke',
      message: 'Diagnose nested invoke permissions.',
      actorEmail: 'audit@test.local',
      metadata: {
        full_name: 'Diagnose Lead',
        business_name: 'Diagnose Business',
        email: 'diagnose@example.com',
        mobile_number: '+61420222793',
        enquiry_type: 'strategy_call',
        admin_link: '/LeadDetail?id=diagnose-notify-invoke-403'
      },
      uniqueKey: payload?.uniqueKey || 'diagnose-notify-invoke-403',
      priority: 'high',
      smsMessage: 'HIGH: strategy_call | Diagnose Lead | audit'
    });

    return Response.json({ success: true, data: response?.data || response || null });
  } catch (error) {
    return Response.json({ error: error.message, status: error?.response?.status || null, data: error?.response?.data || null }, { status: 500 });
  }
});