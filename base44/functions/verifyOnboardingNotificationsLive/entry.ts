import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getLogs(base44, entityId, eventType) {
  const logs = await base44.asServiceRole.entities.NotificationLog.filter({ entity_id: entityId, event_type: eventType }, '-created_date', 20);
  return logs;
}

function summarize(logs) {
  return {
    dashboard: logs.some((log) => log.channel === 'in_app'),
    email: logs.some((log) => log.channel === 'email'),
    sms: logs.some((log) => log.channel === 'sms'),
    details: logs.map((log) => ({ channel: log.channel, delivery_status: log.delivery_status, entity_name: log.entity_name, title: log.title })),
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const stamp = Date.now();
    const client = await base44.asServiceRole.entities.Client.create({
      full_name: `Notification Test ${stamp}`,
      business_name: `Notification Test ${stamp}`,
      email: `notification-test-${stamp}@example.com`,
      mobile_number: '+61420222793',
      industry: 'trades',
      website: '',
      main_service: 'Testing',
      monthly_enquiry_volume: '21_100',
      biggest_problem: 'Verification',
      current_missed_call_handling: '',
      ai_first_goal: '',
      plan: 'Starter',
      status: 'Onboarding',
      lifecycle_state: 'pre_live',
      progress_percentage: 0,
      assigned_owner: 'Support',
      target_go_live_date: null,
      source_lead_id: null,
      last_activity: 'Verification created',
      blockers: [],
      next_action: '',
      workflow_phase: 'Build',
      assets_status: 'not_started',
      onboarding_archived: false,
      go_live_ready: false,
      go_live_date: null,
      shared_files: []
    });

    const overdueTask = await base44.asServiceRole.entities.OnboardingTask.create({
      client_id: client.id,
      task_name: `Overdue task ${stamp}`,
      task_phase: 'Build',
      required: true,
      completed: false,
      blocked: false,
      plan_scope: 'Starter',
      due_date: '2026-04-01',
      assigned_to: 'Support',
      notes: '',
      is_archived: false
    });

    await base44.asServiceRole.functions.invoke('checkOverdueOnboardingTasks', {});
    await sleep(2500);
    const overdueLogs = await getLogs(base44, overdueTask.id, 'onboarding_task_overdue');

    await base44.asServiceRole.entities.Client.update(client.id, {
      ...client,
      blockers: ['Missing intake details'],
      updated_at: new Date().toISOString(),
    });
    await base44.asServiceRole.functions.invoke('notifyBusinessEvents', {
      event: { entity_name: 'Client', type: 'update' },
      data: { ...client, blockers: ['Missing intake details'], updated_at: new Date().toISOString() },
      old_data: client,
    });
    await sleep(2500);
    const blockerLogs = await getLogs(base44, client.id, 'onboarding_blocker_detected');

    const blockedClient = { ...client, blockers: ['Missing intake details'], updated_at: new Date().toISOString() };
    await base44.asServiceRole.entities.Client.update(client.id, {
      ...blockedClient,
      go_live_ready: true,
      updated_at: new Date().toISOString(),
    });
    await base44.asServiceRole.functions.invoke('notifyBusinessEvents', {
      event: { entity_name: 'Client', type: 'update' },
      data: { ...blockedClient, go_live_ready: true, updated_at: new Date().toISOString() },
      old_data: blockedClient,
    });
    await sleep(2500);
    const goLiveLogs = await getLogs(base44, client.id, 'client_ready_for_go_live');

    return Response.json({
      success: true,
      client_id: client.id,
      overdue: summarize(overdueLogs),
      blocker: summarize(blockerLogs),
      go_live: summarize(goLiveLogs),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});