import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TASK_PHASES, getProgressFromTasks } from './onboardingConfig';

function isOverdue(task) {
  return !!task.due_date && !task.completed && new Date(task.due_date) < new Date();
}

export default function ChecklistTab({ tasks, onToggleTask, onToggleBlocked }) {
  const progress = getProgressFromTasks(tasks);

  return (
    <div className="space-y-6">
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-semibold">Checklist Progress</h3>
              <p className="text-sm text-gray-400 mt-1">Grouped by phase with required, blocked, and overdue visibility.</p>
            </div>
            <p className="text-2xl font-semibold text-white">{progress}%</p>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${progress}%` }} />
          </div>
        </CardContent>
      </Card>

      {TASK_PHASES.map((phase) => {
        const phaseTasks = tasks.filter((task) => task.task_phase === phase);
        if (!phaseTasks.length) return null;

        return (
          <Card key={phase} className="bg-[#12121a] border-white/5">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-white font-semibold">{phase}</h3>
              <div className="space-y-3">
                {phaseTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-white font-medium">{task.task_name}</p>
                        <Badge className={task.required ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-white/5 text-gray-300 border-white/10'}>{task.required ? 'Required' : 'Optional'}</Badge>
                        {task.blocked && <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Blocked</Badge>}
                        {isOverdue(task) && <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20">Overdue</Badge>}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">Owner: {task.assigned_to || 'Unassigned'}{task.due_date ? ` • Due ${task.due_date}` : ''}</p>
                      {task.notes && <p className="text-sm text-gray-500 mt-2">{task.notes}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant={task.completed ? 'secondary' : 'outline'} onClick={() => onToggleTask(task)} className="border-white/10 bg-transparent text-white hover:bg-white/5">
                        {task.completed ? 'Completed' : 'Mark Complete'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onToggleBlocked(task)} className="border-white/10 bg-transparent text-white hover:bg-white/5">
                        {task.blocked ? 'Unblock' : 'Mark Blocked'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}