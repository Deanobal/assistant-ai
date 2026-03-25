import React from 'react';
import { LineChart, Line, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WorkspaceAnalyticsTab({ client }) {
  const analytics = client.analytics || { trend: [], categories: [] };
  const hasAnalytics = analytics.trend.length > 0 || analytics.categories.length > 0 || analytics.lead_conversion;

  if (!hasAnalytics) {
    return (
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-10 text-center space-y-3">
          <h3 className="text-xl font-semibold text-white">No Client Analytics Yet</h3>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">Analytics will appear here once live call activity, enquiries, and client records start accumulating in the system.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ['Lead Conversion', `${analytics.lead_conversion || 0}%`],
          ['Peak Call Times', analytics.peak_call_times || 'No data yet'],
          ['Average Call Duration', analytics.average_call_duration || 'No data yet'],
          ['Follow-Up Metrics', analytics.follow_up_metrics || 'No data yet'],
        ].map(([label, value]) => (
          <Card key={label} className="bg-[#12121a] border-white/5">
            <CardContent className="p-5">
              <p className="text-sm text-gray-400">{label}</p>
              <p className="text-2xl font-semibold text-white mt-2">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1.3fr_0.9fr] gap-6">
        <Card className="bg-[#12121a] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Call Volume Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.trend} margin={{ top: 8, right: 8, left: -12, bottom: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="#6b7280" tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }} />
                <Line type="monotone" dataKey="calls" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="leads" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#12121a] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Enquiry Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.categories} dataKey="value" innerRadius={58} outerRadius={86} stroke="transparent">
                    {analytics.categories.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {analytics.categories.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-white font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}