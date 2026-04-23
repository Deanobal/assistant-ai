import { TASK_PHASES } from './onboardingConfig';

export function getTaskDaysOverdue(task) {
  if (!task?.due_date || task.completed) return 0;
  const today = new Date();
  const dueDate = new Date(task.due_date);
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  const diff = today.getTime() - dueDate.getTime();
  return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
}

export function getGoLiveBlockingTask(tasks = []) {
  return TASK_PHASES.flatMap((phase) => tasks.filter((task) => task.task_phase === phase && task.required && !task.completed))[0] || null;
}

export function getSmartPriorityTask(task, client, clientTasks = []) {
  const daysOverdue = getTaskDaysOverdue(task);
  const blockingTask = getGoLiveBlockingTask(clientTasks);
  const isBlockingGoLive = blockingTask?.id === task.id;
  const isOverdue = daysOverdue > 0;
  const smart_priority = !task.completed && isOverdue && isBlockingGoLive;
  const priority_score = (isBlockingGoLive ? 2 : 0) + (isOverdue ? 1 : 0);

  return {
    ...task,
    client_name: client?.business_name || client?.full_name || 'Unknown client',
    assigned_owner: task.assigned_to || client?.assigned_owner || 'Unassigned',
    days_overdue: daysOverdue,
    is_blocking_go_live: isBlockingGoLive,
    smart_priority,
    priority_score,
  };
}

export function getSmartPriorityQueue(clients = [], taskMap = {}) {
  return clients
    .flatMap((client) => {
      const clientTasks = (taskMap[client.id] || []).filter((task) => !task.is_archived);
      return clientTasks.map((task) => getSmartPriorityTask(task, client, clientTasks));
    })
    .filter((task) => task.priority_score >= 2)
    .sort((a, b) => {
      if (b.priority_score !== a.priority_score) return b.priority_score - a.priority_score;
      return b.days_overdue - a.days_overdue;
    });
}