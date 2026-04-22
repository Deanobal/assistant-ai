export const CORE_ONBOARDING_TASKS = [
  { task_name: 'Collect intake details', task_phase: 'Kickoff', required: true },
  { task_name: 'Connect phone system', task_phase: 'Integrations', required: true },
  { task_name: 'Set up CRM', task_phase: 'Integrations', required: true },
  { task_name: 'Configure booking logic', task_phase: 'Workflow Mapping', required: true },
  { task_name: 'Set up notifications', task_phase: 'Integrations', required: true },
  { task_name: 'Test system', task_phase: 'Testing', required: true },
  { task_name: 'Go live', task_phase: 'Go Live', required: true },
];

export function buildCoreOnboardingTasks(clientId, assignedTo = '', plan = 'Starter') {
  return CORE_ONBOARDING_TASKS.map((task) => ({
    client_id: clientId,
    task_name: task.task_name,
    task_phase: task.task_phase,
    required: task.required,
    completed: false,
    blocked: false,
    plan_scope: plan,
    due_date: null,
    assigned_to: assignedTo,
    notes: '',
    is_archived: false,
  }));
}