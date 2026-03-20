import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function buildEventPayload(entityName, eventType, data, oldData) {
  if (entityName === 'Lead') {
    const events = [];

    if (eventType === 'create') {
      events.push({
        event_type: 'new_lead_created',
        title: 'New lead created',
        message: `${data.business_name || data.full_name || 'A new lead'} was captured from ${data.source_page || 'an unknown source'}.`,
      });

      if (data.booking_intent) {
        events.push({
          event_type: 'strategy_call_requested',
          title: 'Strategy call requested',
          message: `${data.full_name || 'A lead'} requested a strategy call.`,
        });
      }

      if (data.status === 'Strategy Call Booked') {
        events.push({
          event_type: 'booking_confirmed',
          title: 'Booking confirmed',
          message: `${data.full_name || 'A lead'} is marked as Strategy Call Booked.`,
        });
      }
    }

    if (eventType === 'update') {
      if (!oldData?.booking_intent && data.booking_intent) {
        events.push({
          event_type: 'strategy_call_requested',
          title: 'Strategy call requested',
          message: `${data.full_name || 'A lead'} requested a strategy call.`,
        });
      }

      if (oldData?.status !== data.status) {
        events.push({
          event_type: data.status === 'Won' ? 'lead_marked_won' : data.status === 'Strategy Call Booked' ? 'booking_confirmed' : 'status_changed',
          title: `Lead status changed to ${data.status}`,
          message: `${data.business_name || data.full_name || 'Lead'} moved from ${oldData?.status || 'Unknown'} to ${data.status}.`,
        });
      }

      if (!oldData?.notes && data.notes) {
        events.push({
          event_type: 'note_added',
          title: 'Lead note added',
          message: `A new note was added to ${data.business_name || data.full_name || 'this lead'}.`,
        });
      }
    }

    return events;
  }

  if (entityName === 'Onboarding' && eventType === 'update') {
    const events = [];

    if (oldData?.intake_form_status !== 'completed' && data.intake_form_status === 'completed') {
      events.push({
        event_type: 'onboarding_intake_submitted',
        title: 'Onboarding intake submitted',
        message: `${data.client_name || 'A client'} completed the onboarding intake form.`,
      });
    }

    if (!oldData && data.client_account_id) {
      events.push({
        event_type: 'onboarding_created',
        title: 'Onboarding created',
        message: `${data.client_name || 'A client'} entered the onboarding workflow.`,
      });
    }

    return events;
  }

  if (entityName === 'BillingRecord' && eventType === 'update' && oldData?.billing_status !== data.billing_status) {
    return [{
      event_type: 'billing_status_changed',
      title: 'Billing status changed',
      message: `${data.plan_name || 'Billing record'} moved from ${oldData?.billing_status || 'Unknown'} to ${data.billing_status}.`,
    }];
  }

  if (entityName === 'IntegrationConnection' && eventType === 'update' && oldData?.connection_status !== data.connection_status) {
    return [{
      event_type: 'integration_status_changed',
      title: 'Integration status changed',
      message: `${data.app_name || 'Integration'} moved from ${oldData?.connection_status || 'Unknown'} to ${data.connection_status}.`,
    }];
  }

  return [];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const entityName = payload?.event?.entity_name;
    const eventType = payload?.event?.type;
    const data = payload?.data;
    const oldData = payload?.old_data;

    if (!entityName || !eventType || !data?.id) {
      return Response.json({ ignored: true, reason: 'Missing event payload' });
    }

    const user = await base44.auth.me().catch(() => null);
    const actorEmail = user?.email || null;
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' }, '-created_date', 100);
    const eventDefs = buildEventPayload(entityName, eventType, data, oldData);

    if (eventDefs.length === 0) {
      return Response.json({ ignored: true, reason: 'No notification events matched' });
    }

    const created = [];

    for (const def of eventDefs) {
      if (admins.length === 0) {
        const log = await base44.asServiceRole.entities.NotificationLog.create({
          event_type: def.event_type,
          entity_name: entityName,
          entity_id: data.id,
          client_account_id: data.client_account_id || null,
          recipient_role: 'admin',
          recipient_email: null,
          channel: 'in_app',
          delivery_status: 'stored',
          provider_name: null,
          provider_message: 'No admin users available yet; event stored only.',
          title: def.title,
          message: def.message,
          triggered_at: new Date().toISOString(),
          actor_email: actorEmail,
          metadata: {
            entity_event_type: eventType,
          },
        });
        created.push(log.id);
        continue;
      }

      for (const admin of admins) {
        const log = await base44.asServiceRole.entities.NotificationLog.create({
          event_type: def.event_type,
          entity_name: entityName,
          entity_id: data.id,
          client_account_id: data.client_account_id || null,
          recipient_role: 'admin',
          recipient_email: admin.email || null,
          channel: 'in_app',
          delivery_status: 'stored',
          provider_name: null,
          provider_message: 'Stored internally. Email/SMS provider not connected yet.',
          title: def.title,
          message: def.message,
          triggered_at: new Date().toISOString(),
          actor_email: actorEmail,
          metadata: {
            entity_event_type: eventType,
            intended_channels: ['email', 'sms'],
          },
        });
        created.push(log.id);
      }
    }

    return Response.json({ success: true, notification_log_ids: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});