import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import OnboardingIntakeForm from '@/components/admin/onboarding/OnboardingIntakeForm';
import AIAdvisorPanel from '@/components/admin/onboarding/AIAdvisorPanel';

async function loadWorkspace(clientId) {
  if (!clientId) throw new Error('Client id is required');
  const response = await fetch(`/api/client-workspace?id=${encodeURIComponent(clientId)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(data.details || data.error || 'Client workspace could not be loaded');
  return data;
}

function fallbackIntakeFromClient(client, clientId) {
  if (!client) return null;
  return {
    client_id: clientId,
    contact_name: client.full_name || '',
    business_name: client.business_name || client.full_name || '',
    email: client.email || '',
    phone: client.mobile_number || client.phone || '',
    website: client.website || '',
    industry: client.industry || 'other',
    approval_status: 'draft',
    service_areas: '',
    business_hours: '',
    faq_list: '',
    pricing_guidance: '',
    is_archived: false,
    last_updated: new Date().toISOString(),
    _temporary: true,
  };
}

export default function OnboardingIntake() {
  const clientId = new URLSearchParams(window.location.search).get('id');
  const [clientDraft, setClientDraft] = useState(null);
  const [intakeDraft, setIntakeDraft] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingAccess, setIsLoadingAccess] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [saveNotice, setSaveNotice] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const user = await base44.auth.me();
        setCurrentUser(user);
      }
      setIsLoadingAccess(false);
    };
    checkAccess();
  }, []);

  const { data: workspace = null, isLoading } = useQuery({
    queryKey: ['onboarding-intake-workspace', clientId],
    queryFn: () => loadWorkspace(clientId),
    enabled: !!clientId && isAuthenticated,
    retry: 1,
  });

  useEffect(() => {
    if (workspace?.client) {
      setClientDraft(workspace.client);
      setIntakeDraft(workspace.intake || fallbackIntakeFromClient(workspace.client, clientId));
    }
  }, [workspace, clientId]);

  const insightsMutation = useMutation({
    mutationFn: async () => ({
      summary: 'Native AI onboarding insights are not connected yet.',
      blockers: [],
      next_actions: ['Complete the native authenticated write endpoint before enabling AI intake recommendations.'],
    }),
    onSuccess: (data) => setAiInsights(data),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      setSaveNotice('Saving is disabled until the native authenticated onboarding write endpoint is connected. Your visible edits are local only.');
      return null;
    },
  });

  if (isLoadingAccess || isLoading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/ClientLogin" replace />;
  if (!clientDraft || !intakeDraft) return <div className="text-gray-400">Intake record not found.</div>;

  const hasAccess = currentUser?.role === 'admin' || currentUser?.client_record_id === clientId;
  if (!hasAccess) {
    return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 py-24"><Card className="bg-[#12121a] border-white/5 max-w-md w-full"><CardContent className="p-8 text-center space-y-4"><div className="w-14 h-14 rounded-2xl mx-auto bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center"><Lock className="w-7 h-7 text-cyan-400" /></div><div><h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1><p className="text-gray-400">This intake form is only available to the linked client account and AssistantAI admins.</p></div><Button variant="outline" onClick={() => base44.auth.logout('/')} className="w-full border-white/10 bg-transparent text-white hover:bg-white/5">Return to Website</Button></CardContent></Card></div>;
  }

  const isReadOnly = true;
  const backHref = currentUser?.role === 'admin' ? `/ClientWorkspace?id=${clientId}` : '/ClientPortal';

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <Link to={backHref} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4"><ArrowLeft className="w-4 h-4" />Back to workspace</Link>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Structured Intake</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">{clientDraft.business_name}</Badge>
            <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20">Native read-only</Badge>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Client onboarding intake</h2>
          <p className="text-gray-400 max-w-3xl">Structured onboarding answers are displayed from the native client workspace endpoint. Editing is disabled until authenticated native writes are connected.</p>
        </div>
      </div>

      {saveNotice && <Card className="bg-amber-500/10 border-amber-500/20"><CardContent className="p-4 text-sm text-amber-100">{saveNotice}</CardContent></Card>}

      {currentUser?.role === 'admin' && (
        <AIAdvisorPanel
          insights={aiInsights}
          isLoading={insightsMutation.isPending}
          onRefresh={() => insightsMutation.mutate()}
        />
      )}

      <OnboardingIntakeForm
        value={intakeDraft}
        client={clientDraft}
        isSaving={saveMutation.isPending}
        isReadOnly={isReadOnly}
        onChange={(key, value) => setIntakeDraft((prev) => ({ ...prev, [key]: value }))}
        onClientChange={(key, value) => setClientDraft((prev) => ({ ...prev, [key]: value }))}
        onSave={() => saveMutation.mutate()}
      />
    </div>
  );
}
