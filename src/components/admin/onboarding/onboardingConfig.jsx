export const CLIENT_STATUSES = ['New', 'Awaiting Payment', 'Awaiting Assets', 'Onboarding', 'Build', 'Testing', 'Ready for Go Live', 'Live', 'Paused'];

export const PLAN_OPTIONS = ['Starter', 'Growth', 'Enterprise'];
export const OWNER_OPTIONS = ['Unassigned', 'Sales', 'Onboarding', 'Build Team', 'Support'];

export const INTEGRATION_LIBRARY = {
  CRM: ['GoHighLevel', 'HubSpot', 'Salesforce', 'Pipedrive', 'Zoho'],
  Calendar: ['Google Calendar', 'Outlook Calendar'],
  SMS: ['Twilio', 'GoHighLevel SMS'],
  Payments: ['Stripe'],
  Optional: ['Zapier', 'Slack', 'Microsoft Teams', 'Email platform'],
};

export const PLAN_PRICING = {
  Starter: { setup_fee: 1500, monthly_fee: 497 },
  Growth: { setup_fee: 3000, monthly_fee: 1500 },
  Enterprise: { setup_fee: 7500, monthly_fee: 3000 },
};

export const TASK_PHASES = ['Lead / Qualification', 'Payment', 'Kickoff', 'Asset Collection', 'Workflow Mapping', 'Integrations', 'Build', 'Testing', 'Approval', 'Go Live', 'Optimisation'];

export const TASK_LIBRARY = [
  { task_name: 'confirm signed approval', task_phase: 'Lead / Qualification', plan_scope: 'Starter', required: true },
  { task_name: 'confirm setup payment received', task_phase: 'Payment', plan_scope: 'Starter', required: true },
  { task_name: 'collect business description', task_phase: 'Kickoff', plan_scope: 'Starter', required: true },
  { task_name: 'collect services list', task_phase: 'Kickoff', plan_scope: 'Starter', required: true },
  { task_name: 'collect service areas', task_phase: 'Asset Collection', plan_scope: 'Starter', required: true },
  { task_name: 'collect hours', task_phase: 'Asset Collection', plan_scope: 'Starter', required: true },
  { task_name: 'collect emergency rules', task_phase: 'Asset Collection', plan_scope: 'Starter', required: true },
  { task_name: 'collect FAQ list', task_phase: 'Asset Collection', plan_scope: 'Starter', required: true },
  { task_name: 'collect pricing guidance', task_phase: 'Asset Collection', plan_scope: 'Starter', required: true },
  { task_name: 'collect escalation contact', task_phase: 'Asset Collection', plan_scope: 'Starter', required: true },
  { task_name: 'choose channel', task_phase: 'Workflow Mapping', plan_scope: 'Starter', required: true },
  { task_name: 'build basic agent', task_phase: 'Build', plan_scope: 'Starter', required: true },
  { task_name: 'test real scenarios', task_phase: 'Testing', plan_scope: 'Starter', required: true },
  { task_name: 'client approval', task_phase: 'Approval', plan_scope: 'Starter', required: true },
  { task_name: 'go live', task_phase: 'Go Live', plan_scope: 'Starter', required: true },
  { task_name: '7-day review', task_phase: 'Optimisation', plan_scope: 'Starter', required: true },
  { task_name: 'CRM access received', task_phase: 'Integrations', plan_scope: 'Growth', required: true },
  { task_name: 'calendar access received', task_phase: 'Integrations', plan_scope: 'Growth', required: true },
  { task_name: 'SMS platform access received', task_phase: 'Integrations', plan_scope: 'Growth', required: true },
  { task_name: 'email automation requirements confirmed', task_phase: 'Workflow Mapping', plan_scope: 'Growth', required: true },
  { task_name: 'workflow mapping completed', task_phase: 'Workflow Mapping', plan_scope: 'Growth', required: true },
  { task_name: 'CRM sync configured', task_phase: 'Integrations', plan_scope: 'Growth', required: true },
  { task_name: 'calendar logic configured', task_phase: 'Integrations', plan_scope: 'Growth', required: true },
  { task_name: 'SMS follow-up configured', task_phase: 'Integrations', plan_scope: 'Growth', required: true },
  { task_name: 'analytics categories configured', task_phase: 'Build', plan_scope: 'Growth', required: false },
  { task_name: 'portal visibility enabled', task_phase: 'Go Live', plan_scope: 'Growth', required: true },
  { task_name: '14-day optimisation review', task_phase: 'Optimisation', plan_scope: 'Growth', required: true },
  { task_name: 'technical discovery complete', task_phase: 'Kickoff', plan_scope: 'Enterprise', required: true },
  { task_name: 'deployment model decided', task_phase: 'Kickoff', plan_scope: 'Enterprise', required: true },
  { task_name: 'workspace/access model defined', task_phase: 'Kickoff', plan_scope: 'Enterprise', required: true },
  { task_name: 'workflow modules approved', task_phase: 'Workflow Mapping', plan_scope: 'Enterprise', required: true },
  { task_name: 'custom integration scope confirmed', task_phase: 'Integrations', plan_scope: 'Enterprise', required: true },
  { task_name: 'webhook requirements confirmed', task_phase: 'Integrations', plan_scope: 'Enterprise', required: true },
  { task_name: 'monitoring rules defined', task_phase: 'Testing', plan_scope: 'Enterprise', required: true },
  { task_name: 'staged rollout approved', task_phase: 'Approval', plan_scope: 'Enterprise', required: true },
  { task_name: 'security/compliance review complete', task_phase: 'Approval', plan_scope: 'Enterprise', required: true },
  { task_name: 'executive go-live pack delivered', task_phase: 'Go Live', plan_scope: 'Enterprise', required: true },
  { task_name: '30-day executive review booked', task_phase: 'Optimisation', plan_scope: 'Enterprise', required: true },
];

const PLAN_ORDER = { Starter: 1, Growth: 2, Enterprise: 3 };

export function isTaskVisibleForPlan(taskPlanScope, clientPlan) {
  return PLAN_ORDER[taskPlanScope] <= PLAN_ORDER[clientPlan];
}

export function getTasksForPlan(plan) {
  return TASK_LIBRARY.filter((task) => isTaskVisibleForPlan(task.plan_scope, plan));
}

export function getProgressFromTasks(tasks = []) {
  if (!tasks.length) return 0;
  const completed = tasks.filter((task) => task.completed).length;
  return Math.round((completed / tasks.length) * 100);
}

export function getDefaultIntegrationRecords(clientId, plan) {
  const base = [
    { client_id: clientId, integration_type: 'CRM', integration_name: 'GoHighLevel', connection_status: 'planned', last_sync: null, notes: '' },
    { client_id: clientId, integration_type: 'Calendar', integration_name: 'Google Calendar', connection_status: 'planned', last_sync: null, notes: '' },
    { client_id: clientId, integration_type: 'SMS', integration_name: 'Twilio', connection_status: 'planned', last_sync: null, notes: '' },
    { client_id: clientId, integration_type: 'Payments', integration_name: 'Stripe', connection_status: 'planned', last_sync: null, notes: '' },
  ];

  if (plan !== 'Starter') {
    base.push({ client_id: clientId, integration_type: 'Optional', integration_name: 'Zapier', connection_status: 'planned', last_sync: null, notes: '' });
  }

  if (plan === 'Enterprise') {
    base.push({ client_id: clientId, integration_type: 'Optional', integration_name: 'Slack', connection_status: 'planned', last_sync: null, notes: '' });
  }

  return base;
}

export function getClientLifecycleLabel(client) {
  return client?.lifecycle_state === 'live' ? 'Live = Client Manager' : 'Pre-Live = Onboarding Hub';
}