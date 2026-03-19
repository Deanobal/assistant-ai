import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const stages = ['New Lead', 'Contacted', 'Strategy Call Booked', 'Proposal Sent', 'Follow-Up', 'Won', 'Lost', 'Onboarding'];

export default function LeadDetail() {
  const queryClient = useQueryClient();
  const leadId = new URLSearchParams(window.location.search).get('id');
  const [draft, setDraft] = useState(null);

  const { data: leads = [] } = useQuery({
    queryKey: ['lead-detail', leadId],
    queryFn: () => base44.entities.Lead.filter({ id: leadId }, '-updated_date', 1),
    initialData: [],
  });

  const lead = leads[0] || null;

  useEffect(() => {
    if (lead) {
      setDraft(lead);
    }
  }, [lead]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Lead.update(leadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-detail', leadId] });
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
    },
  });

  if (!lead || !draft) {
    return <div className="text-gray-400">Lead not found.</div>;
  }

  const timeline = [
    { label: 'Lead captured', value: draft.created_at || draft.created_date || 'Unknown' },
    { label: 'Source page', value: draft.source_page || 'Unknown' },
    { label: 'Current status', value: draft.status },
    { label: 'Next action', value: draft.next_action || 'Not set' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <Link to="/LeadDashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Lead Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">{draft.status}</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">Lead Detail</Badge>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{draft.business_name || draft.full_name}</h2>
          <p className="text-gray-400 max-w-3xl">View contact details, enquiry context, notes, source tracking, and next actions for this lead.</p>
        </div>
        <Button
          onClick={() => updateMutation.mutate(draft)}
          disabled={updateMutation.isPending}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50"
        >
          Save Lead
        </Button>
      </div>

      <div className="grid xl:grid-cols-[1.05fr_0.95fr] gap-6">
        <Card className="bg-[#12121a] border-white/5">
          <CardContent className="p-6 grid md:grid-cols-2 gap-4">
            {[
              ['Full Name', 'full_name'],
              ['Business Name', 'business_name'],
              ['Email', 'email'],
              ['Mobile Number', 'mobile_number'],
              ['Industry', 'industry'],
              ['Enquiry Type', 'enquiry_type'],
              ['Monthly Enquiry Volume', 'monthly_enquiry_volume'],
              ['Source Page', 'source_page'],
              ['Assigned Owner', 'assigned_owner'],
              ['Next Action', 'next_action'],
            ].map(([label, key]) => (
              <div key={key} className="space-y-2">
                <Label className="text-gray-400">{label}</Label>
                <Input
                  value={draft[key] || ''}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  className="bg-white/[0.03] border-white/10 text-white"
                />
              </div>
            ))}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-gray-400">Status</Label>
              <Select value={draft.status} onValueChange={(value) => setDraft({ ...draft, status: value })}>
                <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => <SelectItem key={stage} value={stage}>{stage}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-gray-400">Message</Label>
              <Textarea
                value={draft.message || ''}
                onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                className="bg-white/[0.03] border-white/10 text-white min-h-[120px]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-gray-400">Notes</Label>
              <Textarea
                value={draft.notes || ''}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                className="bg-white/[0.03] border-white/10 text-white min-h-[120px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#12121a] border-white/5">
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="text-white font-semibold text-lg">Lead Timeline</h3>
              <p className="text-sm text-gray-400 mt-1">A simple timeline view ready for future automation and activity logging.</p>
            </div>
            {timeline.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{item.label}</p>
                <p className="text-white mt-2 break-all">{item.value}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Lead Score</p>
              <p className="text-white mt-2">{draft.lead_score ?? 'Not scored yet'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}