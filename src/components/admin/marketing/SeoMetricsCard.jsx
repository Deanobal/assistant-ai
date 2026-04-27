import { TrendingUp, TrendingDown } from 'lucide-react';

export default function SeoMetricsCard({ title, value, change, unit = '', trend = 'up' }) {
  const isPositive = trend === 'up';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 hover:border-cyan-400/20 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-400">{title}</p>
        <TrendIcon className={`h-4 w-4 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
      </div>
      <div className="mb-2">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-500">{unit}</p>
      </div>
      <div className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{change}% {isPositive ? 'increase' : 'decrease'}
      </div>
    </div>
  );
}