import { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Send, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import CampaignForm from '@/components/admin/marketing/CampaignForm';
import CampaignCard from '@/components/admin/marketing/CampaignCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await base44.entities.Campaign.list('-created_date', 50);
        setCampaigns(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (formData) => {
    try {
      setIsCreating(true);
      const result = await base44.functions.invoke('createCampaign', {
        name: formData.name,
        type: formData.type,
        template: formData.template,
        segment: formData.segment,
        subject: formData.subject,
        body: formData.body,
        ctaText: formData.ctaText,
        ctaUrl: formData.ctaUrl,
        scheduledDate: formData.scheduledDate,
      });

      setCampaigns((prev) => [result.data.campaign, ...prev]);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendCampaign = async (campaignId) => {
    try {
      setIsSending(true);
      const result = await base44.functions.invoke('sendCampaign', {
        campaignId: campaignId,
      });

      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? result.data.campaign : c))
      );
      setSelectedCampaign(result.data.campaign);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Marketing Campaigns</h2>
          <p className="text-slate-400">Create and manage email and SMS campaigns</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-cyan-500 hover:bg-cyan-600"
        >
          {showForm ? 'Cancel' : '+ New Campaign'}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Campaign</h3>
          <CampaignForm onSubmit={handleCreateCampaign} isLoading={isCreating} />
        </div>
      )}

      {/* Selected Campaign Details */}
      {selectedCampaign && (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{selectedCampaign.name}</h3>
            <button onClick={() => setSelectedCampaign(null)} className="text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {selectedCampaign.status !== 'sent' && (
            <div className="mb-6">
              <Button
                onClick={() => handleSendCampaign(selectedCampaign.id)}
                disabled={isSending}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
              >
                {isSending && <Loader2 className="h-4 w-4 animate-spin" />}
                <Send className="h-4 w-4" />
                Send Campaign
              </Button>
            </div>
          )}

          {selectedCampaign.status === 'sent' && (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg bg-white/[0.02] p-4">
                  <p className="text-xs text-slate-400 mb-1">Sent</p>
                  <p className="text-2xl font-bold text-cyan-400">{selectedCampaign.total_sent}</p>
                </div>
                <div className="rounded-lg bg-white/[0.02] p-4">
                  <p className="text-xs text-slate-400 mb-1">Opened</p>
                  <p className="text-2xl font-bold text-cyan-400">{selectedCampaign.open_rate?.toFixed(1)}%</p>
                </div>
                <div className="rounded-lg bg-white/[0.02] p-4">
                  <p className="text-xs text-slate-400 mb-1">Clicked</p>
                  <p className="text-2xl font-bold text-cyan-400">{selectedCampaign.click_rate?.toFixed(1)}%</p>
                </div>
                <div className="rounded-lg bg-white/[0.02] p-4">
                  <p className="text-xs text-slate-400 mb-1">Campaign Score</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {Math.round(selectedCampaign.open_rate * 0.4 + selectedCampaign.click_rate * 0.4 + selectedCampaign.reply_rate * 0.2)}/100
                  </p>
                </div>
              </div>

              {/* Performance Chart */}
              {selectedCampaign.performanceTrend && (
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
                  <h4 className="text-sm font-semibold text-white mb-4">Performance Over Time</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={selectedCampaign.performanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                      <XAxis dataKey="day" stroke="rgb(148, 163, 184)" style={{ fontSize: '12px' }} />
                      <YAxis stroke="rgb(148, 163, 184)" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="opens" stroke="#06b6d4" strokeWidth={2} />
                      <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Campaigns Grid */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          {campaigns.length} Campaigns
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onView={setSelectedCampaign}
            />
          ))}
        </div>
        {campaigns.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No campaigns yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}