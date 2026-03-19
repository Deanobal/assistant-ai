import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WonLeadConversionCard({ lead, onConvert, isSaving }) {
  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-white font-semibold">{lead.business_name || lead.full_name}</p>
          <p className="text-sm text-gray-400 mt-1">{lead.full_name} • {lead.email}</p>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{lead.message || 'Won lead ready for conversion into a client record.'}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to={`/LeadDetail?id=${lead.id}`}>
            <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/5">View Lead</Button>
          </Link>
          <Button disabled={isSaving} onClick={() => onConvert(lead)} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50">
            Convert to Client
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}