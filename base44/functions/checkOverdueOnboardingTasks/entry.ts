import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function toDateOnly(value) {
  return String(value || '').trim().slice(0, 10);
}

function getTodayLocal() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Etc/GMT-10',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const service = base44.asServiceRole;
    const today = getTodayLocal();
    const tasks = await service.entities.OnboardingTask.list('-updated_date', 500);
    const clients = await service.entities.Client.list('-updated_date', 500);
    const clientMap = new Map(clients.map((client) => [client.id, client]));

    const overdueTasks = tasks.filter((task) => {
      const dueDate = toDateOnly(task.due_date);
      return dueDate && dueDate < today && task.completed === false && task.is_archived !== true;
    });

    const results = [];

    for (const task of overdueTasks) {
      const client = clientMap.get(task.client_id);
      const response = await service.functions.invoke('notifyBusinessEvents', {
        event: {
          entity_name: 'OnboardingTask',
          type: 'scheduled_overdue_check',
        },
        data: {
          ...task,
          business_name: client?.business_name || '',
          email: client?.email || '',
          mobile_number: client?.mobile_number || '',
          client_id: task.client_id,
        },
        old_data: null,
      });

      results.push({
        task_id: task.id,
        client_id: task.client_id,
        due_date: task.due_date,
        notified: !!response?.data?.success,
      });
    }

    return Response.json({
      success: true,
      today,
      overdue_count: overdueTasks.length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});