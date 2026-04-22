import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { clientStatusStyles } from '@/components/admin/client-manager/mockClients';

export default function OnboardingClientsTable({ clients }) {
  return (
    <Card className="bg-[#12121a] border-white/5 overflow-hidden">
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-white/[0.03] text-gray-400">
            <tr>
              {['Business Name', 'Contact Name', 'Industry', 'Plan', 'Status', 'Progress %', 'Assigned Owner', 'Last Activity', 'Actions'].map((label) => (
                <th key={label} className="text-left px-5 py-4 font-medium">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t border-white/5">
                <td className="px-5 py-4 text-white font-medium">{client.business_name}</td>
                <td className="px-5 py-4 text-gray-300">{client.full_name}</td>
                <td className="px-5 py-4 text-gray-300">{client.industry || '—'}</td>
                <td className="px-5 py-4 text-gray-300">{client.plan}</td>
                <td className="px-5 py-4"><Badge className={clientStatusStyles[client.status] || 'bg-white/5 text-gray-300 border-white/10'}>{client.status}</Badge></td>
                <td className="px-5 py-4 text-gray-300">{client.progress_percentage || 0}%</td>
                <td className="px-5 py-4 text-gray-300">{client.assigned_owner || 'Unassigned'}</td>
                <td className="px-5 py-4 text-gray-400">{client.last_activity || '—'}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/ClientWorkspace?id=${client.id}`}>
                      <Button size="sm" variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/5">View Client</Button>
                    </Link>
                    <Link to={`/ClientWorkspace?id=${client.id}`}>
                      <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">Continue Onboarding</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}