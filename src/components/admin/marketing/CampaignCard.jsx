import { Mail, MessageSquare, BarChart3 } from 'lucide-react';

export default function CampaignCard({ campaign, onView }) {
  const getTypeIcon = () => {
    if (campaign.type === 'email') return <Mail className="h-4 w-4" />;
    if (campaign.type === 'sms') return <MessageSquare className="h-4 w-4" />;
    return <Mail className="h-4 w-4 mr-1" />;
  };

  const getStatusColor = () => {
    switch (campaign.status) {
      case 'sent':
        return 'bg-green-400/10 text-green-400';
      case 'scheduled':
        return 'bg-blue-400/10 text-blue-400';
      case 'draft':
        return 'bg-slate-400/10 text-slate-400';
      case 'paused':
        return 'bg-red-400/10 text-red-400';
      default:
        return 'bg-slate-400/10 text-slate-400';
    }
  };

  const campaignScore = Math.round(
    (campaign.open_rate * 0.4 + campaign.click_rate * 0.4 + campaign.reply_rate * 0.2)
  );

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 hover:border-cyan-400/20 transition-colors cursor-pointer" onClick={() => onView(campaign)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getTypeIcon()}
            <h3 className="text-sm font-semibold text-white">{campaign.name}</h3>
          </div>
          <p className="text-xs text-slate-500">{campaign.subject}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor()}`}>
          {campaign.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Recipients</span>
          <span className="text-white font-semibold">{campaign.total_recipients || campaign.total_sent || 0}</span>
        </div>

        {campaign.status === 'sent' && (
          <>
            <div className="h-px bg-white/5" />
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-slate-500 mb-1">Opens</p>
                <p className="text-cyan-400 font-semibold">{campaign.open_rate?.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Clicks</p>
                <p className="text-cyan-400 font-semibold">{campaign.click_rate?.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Score</p>
                <p className="text-cyan-400 font-semibold">{campaignScore}/100</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}