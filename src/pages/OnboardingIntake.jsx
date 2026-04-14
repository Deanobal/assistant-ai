import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import OnboardingIntakeForm from '@/components/admin/onboarding/OnboardingIntakeForm';

export default function OnboardingIntake() {
  const queryClient = useQueryClient();
  const clientId = new URLSearchParams(window.location.search).get('id');
  const [clientDraft, setClientDraft] = useState(null);
  const [intakeDraft, setIntakeDraft] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingAccess, setIsLoadingAccess] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const { data: clients = [] } = useQuery({
    queryKey: ['onboarding-intake-client', clientId],
    queryFn: () => base44.entities.Client.filter({ id: clientId }, '-updated_date', 1),
    initialData: [],
    enabled: !!clientId && isAuthenticated,
  });

  const { data: intakeForms = [] } = useQuery({
    queryKey: ['onboarding-intake-form', clientId],
    queryFn: () => base44.entities.IntakeForm.filter({ client_id: clientId }, '-updated_date', 1),
    initialData: [],
    enabled: !!clientId && isAuthenticated,
  });

  const client = clients[0] || null;
  const intake = intakeForms[0] || null;

  useEffect(() => {
    if (client) setClientDraft(client);
    if (intake) setIntakeDraft(intake);
  }, [client, intake]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.IntakeForm.update(intakeDraft.id, { ...intakeDraft, last_updated: new Date().toISOString(), approval_status: 'submitted' });
      await base44.entities.Client.update(clientId, { ...clientDraft, updated_at: new Date().toISOString(), last_activity: 'Intake updated', status: clientDraft.onboarding_archived ? clientDraft.status : 'Onboarding' });
      await base44.entities.ClientNote.create({
        client_id: clientId,
        note_type: 'onboarding_note',
        content: 'Structured intake form updated.',
        created_by: currentUser?.email || 'system',
        created_at: new Date().toISOString(),
        is_archived: false,
      });
    },
    onSuccess: () => {
      ['onboarding-intake-client', 'onboarding-intake-form', 'onboarding-clients', 'onboarding-notes', 'client-workspace'].forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  });

  if (isLoadingAccess) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/ClientLogin" replace />;
  if (!clientDraft || !intakeDraft) return <div className="text-gray-400">Intake record not found.</div>;

  const hasAccess = currentUser?.role === 'admin' || currentUser?.client_record_id === clientId;
  if (!hasAccess) {
    return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 py-24"><Card className="bg-[#12121a] border-white/5 max-w-md w-full"><CardContent className="p-8 text-center space-y-4"><div className="w-14 h-14 rounded-2xl mx-auto bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center"><Lock className="w-7 h-7 text-cyan-400" /></div><div><h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1><p className="text-gray-400">This intake form is only available to the linked client account and AssistantAI admins.</p></div><Button variant="outline" onClick={() => base44.auth.logout('/')} className="w-full border-white/10 bg-transparent text-white hover:bg-white/5">Return to Website</Button></CardContent></Card></div>;
  }

  const isReadOnly = !!clientDraft.onboarding_archived;
  const backHref = currentUser?.role === 'admin' ? `/ClientWorkspace?id=${clientId}` : '/ClientPortal';

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <Link to={backHref} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4"><ArrowLeft className="w-4 h-4" />Back to workspace</Link>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Structured Intake</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">{clientDraft.business_name}</Badge>
            {isReadOnly && <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20">Archived / Read-only</Badge>}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Client onboarding intake</h2>
          <p className="text-gray-400 max-w-3xl">Structured onboarding answers synced to the shared client record for future automation and operational rollout.</p>
        </div>
      </div>

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