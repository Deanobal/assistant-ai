import React, { useState } from 'react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const views = ['daily', 'weekly', 'monthly'];

export default function TrendPanel({ trendData }) {
  const [activeView, setActiveView] = useState('daily');

  return (
    <Card className="bg-[#12121a] border-white/5 h-full">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-white text-xl">Call Volume Trend</CardTitle>
          <p className="text-sm text-gray-400 mt-2">Track answered and missed calls across the selected reporting view.</p>
        </div>
        <div className="flex gap-2">
          {views.map((view) => (
            <Button
              key={view}
              size="sm"
              variant={activeView === view ? 'default' : 'outline'}
              onClick={() => setActiveView(view)}
              className={activeView === view ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'border-white/10 text-gray-300 hover:bg-white/5'}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[320px] pr-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData[activeView]} margin={{ top: 8, right: 8, left: -12, bottom: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" stroke="#6b7280" tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7280" tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}
              labelStyle={{ color: '#f8fafc' }}
              itemStyle={{ color: '#cbd5e1' }}
            />
            <Line type="monotone" dataKey="answered" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4' }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="missed" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}