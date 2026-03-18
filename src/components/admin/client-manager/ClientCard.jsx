import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { clientStatusStyles } from './mockClients';

export default function ClientCard({ client }) {
  return (
    <Card className="bg-[#12121a] border-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] h-full">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">{client.business_name}</h3>
            <p className="text-sm text-gray-400">{client.contact_name}</p>
          </div>
          <Badge className={clientStatusStyles[client.status]}>{client.status}</Badge>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
            <p className="text-gray-500">Industry</p>
            <p className="text-white mt-1">{client.industry.replace('_', ' ')}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
            <p className="text-gray-500">Plan</p>
            <p className="text-white mt-1">{client.plan_name}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
            <p className="text-gray-500">Monthly Revenue</p>
            <p className="text-white mt-1">${client.monthly_revenue.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
            <p className="text-gray-500">Last Activity</p>
            <p className="text-white mt-1 line-clamp-2">{client.last_activity}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">Active Services</p>
          <div className="flex flex-wrap gap-2">
            {client.active_services.map((service) => (
              <Badge key={service} className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">{service}</Badge>
            ))}
          </div>
        </div>

        <Link to={`/ClientWorkspace?id=${client.id}`}>
          <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25">
            View Client
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}