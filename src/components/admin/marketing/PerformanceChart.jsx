import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function PerformanceChart({ data, type = 'line', title }) {
  if (!data || data.length === 0) {
    return <div className="text-slate-400 text-center py-8">No data available</div>;
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' ? (
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis dataKey="date" stroke="rgb(148, 163, 184)" style={{ fontSize: '12px' }} />
            <YAxis stroke="rgb(148, 163, 184)" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'rgb(226, 232, 240)' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="impressions"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ fill: '#06b6d4', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis dataKey="name" stroke="rgb(148, 163, 184)" style={{ fontSize: '12px' }} />
            <YAxis stroke="rgb(148, 163, 184)" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'rgb(226, 232, 240)' }}
            />
            <Legend />
            <Bar dataKey="clicks" fill="#06b6d4" radius={[8, 8, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}