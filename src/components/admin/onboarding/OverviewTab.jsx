import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function OverviewTab({ client, intake, taskSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ['Assigned Owner', client.assigned_owner || 'Unassigned'],
          ['Target Go-Live Date', client.target_go_live_date || 'Not set'],
          ['Workflow Phase', client.workflow_phase || 'Not set'],
          ['Onboarding Summary', `${taskSummary.completed}/${taskSummary.total} tasks complete`],
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
        <CardContent className="p-6 grid md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-gray-300">Business summary: {client.biggest_problem || 'Not captured yet'}</div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-gray-300">Main service: {client.main_service || 'Not captured yet'}</div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-gray-300">Monthly enquiry volume: {client.monthly_enquiry_volume || 'Not set'}</div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-gray-300">What AI should do first: {client.ai_first_goal || 'Not captured yet'}</div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-gray-300">Service areas: {intake?.service_areas || 'Not captured yet'}</div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-gray-300">Business hours: {intake?.business_hours || 'Not captured yet'}</div>
        </CardContent>
      </Card>

      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 grid md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-gray-300">Active services prepared from plan: {client.plan}</div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-gray-300">Blockers: {client.blockers?.length ? client.blockers.join(', ') : 'None'}</div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-gray-300">Next steps: {client.next_action || 'None set'}</div>
        </CardContent>
      </Card>
    </div>
  );
}