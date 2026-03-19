import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Phone, Calendar, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const statConfig = [
  { icon: Phone, label: 'Calls handled', key: 'total_calls_month', format: (value) => value || 0, note: 'Live call volume this month' },
  { icon: Users, label: 'Leads captured', key: 'leads_captured', format: (value) => value || 0, note: 'Live lead capture records' },
  { icon: Calendar, label: 'Appointments booked', key: 'appointments_booked', format: (value) => value || 0, note: 'Bookings currently tracked' },
  { icon: TrendingUp, label: 'Latest activity', key: 'last_activity', format: (value) => value || 'No live activity yet', note: 'Most recent recorded update' },
];

export default function ClientOverviewSection({ clientAccountId }) {
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['client-portal-overview', clientAccountId],
    queryFn: () => base44.entities.ClientAccount.filter({ id: clientAccountId }, '-updated_date', 1),
    initialData: [],
    enabled: !!clientAccountId,
  });

  const client = clients[0] || null;
  const hasOverviewData = client && (
    (client.total_calls_month || 0) > 0 ||
    (client.leads_captured || 0) > 0 ||
    (client.appointments_booked || 0) > 0 ||
    !!client.last_activity
  );

  if (isLoading) {
    return (
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-8 text-center text-gray-400">Loading overview…</CardContent>
      </Card>
    );
  }

  if (!client || !hasOverviewData) {
    return (
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-10 text-center space-y-3">
          <h2 className="text-2xl font-bold text-white">No Live Overview Data Yet</h2>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">Once calls, leads, and bookings begin flowing through your live setup, this overview will show the real activity for your business here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statConfig.map((stat) => (
          <Card key={stat.label} className="bg-[#12121a] border-white/5 h-full">
            <CardContent className="p-6">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                <stat.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1 break-words">{stat.format(client[stat.key])}</p>
              <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-gray-600 text-xs">{stat.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#12121a] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Business Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            {[
              ['Business Name', client.business_name],
              ['Contact', client.contact_name],
              ['Plan', client.plan_name || 'Not set'],
              ['Status', client.status],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4">
                <p className="text-gray-500">{label}</p>
                <p className="text-white mt-1">{value || 'Not set'}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white">Support Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {['Contact support', 'Onboarding help', 'Optimisation help'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-[#0a0a0f]/40 px-4 py-3 text-sm text-gray-300">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}