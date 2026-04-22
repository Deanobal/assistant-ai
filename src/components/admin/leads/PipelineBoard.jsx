import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export default function PipelineBoard({ stages, groupedLeads, onStatusChange, onMarkWon, isSaving }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid grid-flow-col auto-cols-[320px] gap-4 min-w-max">
        {stages.map((stage) => (
          <Card key={stage} className="bg-[#12121a] border-white/5 h-full">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-white font-semibold">{stage}</h3>
                <Badge className="bg-white/5 text-gray-300 border-white/10">{groupedLeads[stage]?.length || 0}</Badge>
              </div>

              <div className="space-y-3">
                {(groupedLeads[stage] || []).map((lead) => (
                  <div key={lead.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 space-y-3">
                    <div>
                      <p className="text-white font-medium">{lead.business_name || lead.full_name}</p>
                      <p className="text-sm text-gray-400 mt-1">{lead.full_name}</p>
                    </div>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p className="break-all">{lead.email}</p>
                      <p>{lead.source_page || 'Unknown source'}</p>
                    </div>
                    <Select value={lead.status} onValueChange={(value) => onStatusChange(lead, value)}>
                      <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div className="grid gap-2">
                      {lead.status !== 'Won' && lead.status !== 'Onboarding' && (
                        <Button onClick={() => onMarkWon(lead)} disabled={isSaving} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                          Mark as WON
                        </Button>
                      )}
                      {lead.status === 'Won' && !lead.client_account_id && (
                        <Button onClick={() => onMarkWon(lead)} disabled={isSaving} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                          Start Onboarding
                        </Button>
                      )}
                      <Link to={`/LeadDetail?id=${lead.id}`}>
                        <Button variant="outline" disabled={isSaving} className="w-full border-white/10 bg-transparent text-white hover:bg-white/5">
                          View Lead
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}