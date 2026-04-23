export const GO_LIVE_BLOCKING_PHASES = ['Payment', 'Asset Collection', 'Workflow Mapping', 'Integrations', 'Testing', 'Approval', 'Go Live'];

export function getTaskDaysOverdue(task) {
  if (!task?.due_date || task.completed) return 0;
  const today = new Date();
  const dueDate = new Date(task.due_date);
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  const diff = today.getTime() - dueDate.getTime();
  return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
}

export function isTaskBlockingGoLive(task, client) {
  if (!task || task.completed || !task.required) return false;
  if (!GO_LIVE_BLOCKING_PHASES.includes(task.task_phase)) return false;
  if (client?.lifecycle_state === 'live' || client?.status === 'Live') return false;
  if (client?.onboarding_archived) return false;
  return true;
}

export function getClientUrgencyScore(client) {
  if (client?.go_live_ready || client?.status === 'Ready for Go Live') return 3;
  if (client?.status === 'Testing' || client?.status === 'Build') return 2;
  if (client?.status === 'Onboarding' || client?.status === 'Awaiting Assets') return 1;
  return 0;
}

export function getSmartPriorityTask(task, client) {
  const daysOverdue = getTaskDaysOverdue(task);
  const isBlockingGoLive = isTaskBlockingGoLive(task, client);
  const isOverdue = daysOverdue > 0;
  const smart_priority = !task.completed && isOverdue && isBlockingGoLive;
  const priority_score = (isBlockingGoLive ? 2 : 0) + (isOverdue ? 1 : 0);
  const client_urgency = getClientUrgencyScore(client);

  return {
    ...task,
    client_name: client?.business_name || client?.full_name || 'Unknown client',
    assigned_owner: task.assigned_to || client?.assigned_owner || 'Unassigned',
    days_overdue: daysOverdue,
    is_blocking_go_live: isBlockingGoLive,
    smart_priority,
    priority_score,
    client_urgency,
  };
}

export function getSmartPriorityQueue(clients = [], taskMap = {}) {
  return clients
    .flatMap((client) => {
      const clientTasks = (taskMap[client.id] || []).filter((task) => !task.is_archived);
      return clientTasks.map((task) => getSmartPriorityTask(task, client));
    })
    .filter((task) => !task.completed && task.days_overdue > 0 && task.is_blocking_go_live)
    .sort((a, b) => {
      if (b.days_overdue !== a.days_overdue) return b.days_overdue - a.days_overdue;
      if (b.client_urgency !== a.client_urgency) return b.client_urgency - a.client_urgency;
      return b.priority_score - a.priority_score;
    });
}