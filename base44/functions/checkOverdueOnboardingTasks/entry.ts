import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function toDateOnly(value) {
  return String(value || '').trim().slice(0, 10);
}

function getTodaySydney() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const service = base44.asServiceRole;
    const today = getTodaySydney();
    const tasks = await service.entities.OnboardingTask.list('-updated_date', 500);

    const overdueTasks = tasks.filter((task) => {
      const dueDate = toDateOnly(task.due_date);
      return dueDate && dueDate < today && task.completed === false && task.is_archived !== true;
    });

    const results = [];

    for (const task of overdueTasks) {
      const response = await service.functions.invoke('notifyBusinessEvents', {
        event: {
          entity_name: 'OnboardingTask',
          type: 'scheduled_overdue_check',
        },
        data: task,
        old_data: null,
      });

      results.push({
        task_id: task.id,
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