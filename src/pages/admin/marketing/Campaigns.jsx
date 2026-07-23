import { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Send, X } from 'lucide-react';
import { assistantApi } from '@/api/nativeClient';
import { Button } from '@/components/ui/button';
import CampaignForm from '@/components/admin/marketing/CampaignForm';
import CampaignCard from '@/components/admin/marketing/CampaignCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function isMissingFunctionError(message = '') {
  return message.includes('404') || message.toLowerCase().includes('not found') || message.toLowerCase().includes('app not found');
}

function makeDraft(formData) {
  return {
    name: formData.name,
    type: formData.type,
    template: formData.template,
    segment: formData.segment,
    subject: formData.subject,
    body: formData.body,
    cta_text: formData.ctaText,
    cta_url: formData.ctaUrl,
    scheduled_date: formData.scheduledDate || null,
    status: 'draft',
    total_sent: 0,
    open_rate: 0,
    click_rate: 0,
    reply_rate: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await assistantApi.entities.Campaign.list('-created_date', 50);
        setCampaigns(data || []);
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
      setError(null);
      setWarning(null);
      try {
        const result = await assistantApi.functions.invoke('createCampaign', {
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

        const campaign = result?.data?.campaign;
        if (campaign) {
          setCampaigns((prev) => [campaign, ...prev]);
          setSelectedCampaign(campaign);
          setShowForm(false);
          return;
        }
      } catch (functionError) {
        if (!isMissingFunctionError(functionError?.message || '')) throw functionError;
        setWarning('Campaign function is not deployed yet. Saved as a database draft instead.');
      }

      const draft = await assistantApi.entities.Campaign.create(makeDraft(formData));
      setCampaigns((prev) => [draft, ...prev]);
      setSelectedCampaign(draft);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleMarkCampaignSent = async (campaignId) => {
    try {
      setIsSending(true);
      setError(null);
      setWarning(null);
      const result = await assistantApi.functions.invoke('sendCampaign', { campaignId });
      const campaign = result?.data?.campaign;
      if (campaign) {
        setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? campaign : c)));
        setSelectedCampaign(campaign);
        setWarning('Campaign record updated. Outbound email/SMS delivery is not connected from this button yet. Use this only after a manual or external send.');
      }
    } catch (err) {
      if (isMissingFunctionError(err?.message || '')) {
        setWarning('Campaign status action is not deployed yet. Campaign remains a draft until outbound sending is configured.');
      } else {
        setError(err.message);
      }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Marketing Campaigns</h2>
          <p className="text-slate-400">Create and manage campaign drafts and recorded campaign status</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-cyan-500 hover:bg-cyan-600">
          {showForm ? 'Cancel' : '+ New Campaign'}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {warning && (
        <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400" />
          <p className="text-amber-300">{warning}</p>
        </div>
      )}

      <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-4 text-sm leading-7 text-amber-100">
        Outbound email/SMS delivery is not connected in this admin screen yet. Campaign creation saves records. The status button only marks a campaign as sent in the database after a manual or external send.
      </div>

      {showForm && (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Campaign</h3>
          <CampaignForm onSubmit={handleCreateCampaign} isLoading={isCreating} />
        </div>
      )}

      {selectedCampaign && (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{selectedCampaign.name}</h3>
            <button onClick={() => setSelectedCampaign(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
          </div>

          {selectedCampaign.status !== 'sent' && (
            <div className="mb-6 space-y-3">
              <Button onClick={() => handleMarkCampaignSent(selectedCampaign.id)} disabled={isSending} className="flex items-center gap-2 bg-green-500 hover:bg-green-600">
                {isSending && <Loader2 className="h-4 w-4 animate-spin" />}
                <Send className="h-4 w-4" />
                Mark Sent in Records
              </Button>
              <p className="text-xs leading-6 text-slate-500">
                This updates the campaign record only. It does not deliver email or SMS until outbound campaign delivery is wired.
              </p>
            </div>
          )}

          {selectedCampaign.status === 'sent' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-100">
                This campaign is marked as sent in records. Delivery metrics only appear when they are recorded by a connected outbound provider.
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg bg-white/[0.02] p-4"><p className="text-xs text-slate-400 mb-1">Sent</p><p className="text-2xl font-bold text-cyan-400">{selectedCampaign.total_sent || 0}</p></div>
                <div className="rounded-lg bg-white/[0.02] p-4"><p className="text-xs text-slate-400 mb-1">Opened</p><p className="text-2xl font-bold text-cyan-400">{Number(selectedCampaign.open_rate || 0).toFixed(1)}%</p></div>
                <div className="rounded-lg bg-white/[0.02] p-4"><p className="text-xs text-slate-400 mb-1">Clicked</p><p className="text-2xl font-bold text-cyan-400">{Number(selectedCampaign.click_rate || 0).toFixed(1)}%</p></div>
                <div className="rounded-lg bg-white/[0.02] p-4"><p className="text-xs text-slate-400 mb-1">Campaign Score</p><p className="text-2xl font-bold text-cyan-400">{Math.round((Number(selectedCampaign.open_rate || 0)) * 0.4 + (Number(selectedCampaign.click_rate || 0)) * 0.4 + (Number(selectedCampaign.reply_rate || 0)) * 0.2)}/100</p></div>
              </div>

              {selectedCampaign.performanceTrend && (
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
                  <h4 className="text-sm font-semibold text-white mb-4">Performance Over Time</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={selectedCampaign.performanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                      <XAxis dataKey="day" stroke="rgb(148, 163, 184)" style={{ fontSize: '12px' }} />
                      <YAxis stroke="rgb(148, 163, 184)" style={{ fontSize: '12px' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.2)' }} />
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

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">{campaigns.length} Campaigns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} onView={setSelectedCampaign} />)}
        </div>
        {campaigns.length === 0 && <div className="text-center py-12"><p className="text-slate-400">No campaigns yet. Create your first one.</p></div>}
      </div>
    </div>
  );
}
