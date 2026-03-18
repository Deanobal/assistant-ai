import React from 'react';
import { Pie, PieChart, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CategoryPanel({ categoryData }) {
  return (
    <Card className="bg-[#12121a] border-white/5 h-full">
      <CardHeader>
        <CardTitle className="text-white text-xl">Enquiry Breakdown</CardTitle>
        <p className="text-sm text-gray-400 mt-2">See the most common reasons customers are contacting your AI receptionist.</p>
      </CardHeader>
      <CardContent className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-center">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="value" innerRadius={72} outerRadius={104} paddingAngle={3} stroke="transparent">
                {categoryData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {categoryData.map((item) => (
            <div key={item.key} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <p className="text-sm text-gray-200 truncate">{item.label}</p>
              </div>
              <p className="text-sm font-semibold text-white shrink-0">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}