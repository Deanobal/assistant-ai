import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, CheckCircle2, ClipboardList } from 'lucide-react';
import { assistantApi } from '@/api/nativeClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const columns = [
  { title: 'New', statuses: ['New Lead', 'Strategy Call Requested'] },
  { title: 'In Progress', statuses: ['Contacted', 'Strategy Call Booked', 'Proposal Sent', 'Follow-Up'] },
  { title: 'Converted', statuses: ['Won', 'Onboarding'] },
];

function serviceLabel(lead) {
  return String(lead.enquiry_type || lead.industry || 'General enquiry').replace(/_/g, ' ');
}

function dateLabel(lead) {
  const value = lead.created_at || lead.created_date || lead.last_activity_at;
  return value ? new Date(value).toLocaleString() : 'Not recorded';
}

function LeadActions({ lead, isSaving, onUpdate }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button size="sm" disabled={isSaving} onClick={() => onUpdate(lead, 'Contacted')} className="bg-slate-700 text-white hover:bg-slate-600">
        Mark progress
      </Button>
      <Button size="sm" disabled={isSaving} onClick={() => onUpdate(lead, 'Won')} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Converted
      </Button>
    </div>
  );
}

function LeadCard({ lead, isSaving, onUpdate }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{lead.full_name || 'Unknown lead'}</p>
          <p className="mt-1 text-xs capitalize text-slate-500">{serviceLabel(lead)}</p>
        </div>
        <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300">{lead.status}</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <CalendarClock className="h-4 w-4 text-cyan-300" />
        <span>{dateLabel(lead)}</span>
      </div>
      <LeadActions lead={lead} isSaving={isSaving} onUpdate={onUpdate} />
    </div>
  );
}

export default function ClientLeadsSection({ clientAccountId }) {
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['client-portal-leads', clientAccountId],
    queryFn: () => assistantApi.entities.Lead.filter({ client_account_id: clientAccountId }, '-created_date', 100),
    initialData: [],
    enabled: !!clientAccountId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ leadId, status }) => assistantApi.functions.invoke('updateClientPortalLeadStatus', { leadId, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-portal-leads', clientAccountId] }),
  });

  const updateStatus = (lead, status) => updateMutation.mutate({ leadId: lead.id, status });

  if (isLoading) {
    return <Card className="border-white/5 bg-[#12121a]"><CardContent className="p-8 text-center text-gray-400">Loading leads…</CardContent></Card>;
  }

  return (
    <div className="space-y-8">
      <Card className="border-white/5 bg-[#12121a]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ClipboardList className="h-5 w-5 text-cyan-400" />
            Leads Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-3">
            {columns.map((column) => {
              const columnLeads = leads.filter((lead) => column.statuses.includes(lead.status));
              return (
                <section key={column.title} className="rounded-2xl border border-white/10 bg-[#0a0a0f]/45 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-white">{column.title}</h3>
                    <Badge className="border-white/10 bg-white/5 text-slate-300">{columnLeads.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {columnLeads.length ? columnLeads.map((lead) => (
                      <LeadCard key={lead.id} lead={lead} isSaving={updateMutation.isPending} onUpdate={updateStatus} />
                    )) : <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">No leads here yet.</div>}
                  </div>
                </section>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-[#12121a]">
        <CardHeader>
          <CardTitle className="text-white">Leads Table</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4">Lead</th>
                <th className="py-3 pr-4">Service requested</th>
                <th className="py-3 pr-4">Call date/time</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-300">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="py-4 pr-4 font-medium text-white">{lead.full_name || 'Unknown lead'}</td>
                  <td className="py-4 pr-4 capitalize">{serviceLabel(lead)}</td>
                  <td className="py-4 pr-4">{dateLabel(lead)}</td>
                  <td className="py-4 pr-4"><Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300">{lead.status}</Badge></td>
                  <td className="py-4 pr-4"><LeadActions lead={lead} isSaving={updateMutation.isPending} onUpdate={updateStatus} /></td>
                </tr>
              ))}
              {!leads.length && (
                <tr><td colSpan="5" className="py-8 text-center text-slate-500">No leads have been linked to this portal yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}