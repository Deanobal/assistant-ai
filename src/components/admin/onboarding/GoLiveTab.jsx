import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function GoLiveTab({ client, tasks }) {
  const readiness = client.progress_percentage || 0;
  const approvalDone = tasks.some((task) => task.task_phase === 'Approval' && task.completed);
  const goLiveDone = tasks.some((task) => task.task_name === 'go live' && task.completed);

  return (
    <div className="space-y-6">
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-semibold">Go-Live Readiness Score</h3>
              <p className="text-sm text-gray-400 mt-1">Final pre-launch operational view for internal rollout.</p>
            </div>
            <p className="text-2xl font-semibold text-white">{readiness}%</p>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${readiness}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ['Approval State', approvalDone ? 'Approved' : 'Pending approval'],
          ['Launch Status', client.status],
          ['Post-Launch Monitoring', '7 / 14 / 30 day review ready'],
          ['Client Portal Access', client.lifecycle_state === 'live' ? 'Enabled for live ops' : 'Enable after go-live'],
        ].map(([label, value]) => (
          <Card key={label} className="bg-[#12121a] border-white/5">
            <CardContent className="p-5">
              <p className="text-sm text-gray-400">{label}</p>
              <p className="text-white font-semibold mt-2">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 space-y-3">
          <h3 className="text-white font-semibold">Final Pre-Launch Checklist</h3>
          {['Approval complete', 'Launch status confirmed', 'Monitoring tasks assigned', '7-day / 14-day / 30-day reviews planned'].map((item) => (
            <div key={item} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-gray-300">{item}</div>
          ))}
          {goLiveDone && <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-green-300">Launch task marked complete.</div>}
        </CardContent>
      </Card>
    </div>
  );
}