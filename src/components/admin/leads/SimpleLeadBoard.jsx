import React from 'react';
import { CheckCircle2, ClipboardCheck, Phone, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

const columns = [
  { key: 'new', title: 'New', match: (lead) => lead.status === 'New Lead' },
  { key: 'in_progress', title: 'In Progress', match: (lead) => ['Contacted', 'Strategy Call Requested', 'Strategy Call Booked', 'Proposal Sent', 'Follow-Up'].includes(lead.status) },
  { key: 'converted', title: 'Converted', match: (lead) => ['Won', 'Onboarding'].includes(lead.status) },
];

function formatJobType(lead) {
  return String(lead.enquiry_type || lead.industry || 'General enquiry').replace(/_/g, ' ');
}

function LeadCard({ lead, isSaving, onAccept, onConvert, onComment }) {
  const [comment, setComment] = React.useState('');

  const saveComment = () => {
    const trimmed = comment.trim();
    if (!trimmed) return;
    onComment(lead, trimmed);
    setComment('');
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{lead.full_name || 'Unknown caller'}</p>
          <p className="mt-1 text-xs capitalize text-slate-500">{formatJobType(lead)}</p>
        </div>
        <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300">{lead.status}</Badge>
      </div>

      <div className="space-y-2 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-cyan-300" />
          <span>{lead.mobile_number || 'No contact number'}</span>
        </div>
        <div className="flex items-start gap-2">
          <ClipboardCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
          <span>{lead.next_action || 'Review and follow up'}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Add follow-up comment..."
          className="min-h-[76px] border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600"
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button disabled={isSaving} onClick={() => onAccept(lead)} className="bg-slate-700 text-white hover:bg-slate-600">
            <UserRound className="mr-2 h-4 w-4" />
            Accept
          </Button>
          <Button disabled={isSaving} onClick={() => onConvert(lead)} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Converted
          </Button>
          <Button disabled={isSaving || !comment.trim()} onClick={saveComment} variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/5">
            Save comment
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SimpleLeadBoard({ leads, isSaving, onAccept, onConvert, onComment }) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {columns.map((column) => {
        const columnLeads = leads.filter(column.match);
        return (
          <section key={column.key} className="rounded-[24px] border border-white/10 bg-[#0b0f18]/80 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{column.title}</h3>
              <Badge className="border-white/10 bg-white/5 text-slate-300">{columnLeads.length}</Badge>
            </div>
            <div className="space-y-3">
              {columnLeads.length ? columnLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  isSaving={isSaving}
                  onAccept={onAccept}
                  onConvert={onConvert}
                  onComment={onComment}
                />
              )) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
                  No leads in this column.
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}