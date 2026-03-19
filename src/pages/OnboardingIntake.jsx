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
  const onboardingId = new URLSearchParams(window.location.search).get('id');
  const [draft, setDraft] = useState(null);
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

  const { data: onboardings = [] } = useQuery({
    queryKey: ['onboarding-intake', onboardingId],
    queryFn: () => base44.entities.Onboarding.filter({ id: onboardingId }, '-updated_date', 1),
    initialData: [],
    enabled: !!onboardingId && isAuthenticated,
  });

  const onboarding = onboardings[0] || null;

  useEffect(() => {
    if (onboarding) {
      setDraft(onboarding);
    }
  }, [onboarding]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const hasLogo = !!data.logo_upload;
      const updatedOnboarding = await base44.entities.Onboarding.update(onboardingId, {
        ...data,
        intake_form_status: 'completed',
        onboarding_stage: 'Intake Form Completed',
        assets_received: hasLogo || data.assets_received,
      });

      if (data.client_account_id) {
        const existingClient = await base44.entities.ClientAccount.filter({ id: data.client_account_id }, '-updated_date', 1);
        const client = existingClient[0];

        if (client) {
          const nextNotesEntries = [
            {
              title: 'Intake Form Submitted',
              category: 'onboarding',
              content: data.additional_notes || data.onboarding_notes || 'Client onboarding intake form completed.',
              date: 'Today',
            },
            ...(client.notes_entries || []),
          ];

          await base44.entities.ClientAccount.update(data.client_account_id, {
            ...client,
            business_name: data.client_name,
            contact_name: data.contact_name,
            email: data.email,
            phone: data.mobile,
            industry: data.industry,
            last_activity: 'Onboarding intake form completed',
            notes_entries: nextNotesEntries,
          });
        }
      }

      return updatedOnboarding;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-intake', onboardingId] });
      queryClient.invalidateQueries({ queryKey: ['onboardings'] });
      queryClient.invalidateQueries({ queryKey: ['client-workspace-onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['client-workspace'] });
      queryClient.invalidateQueries({ queryKey: ['client-manager-clients'] });
    },
  });

  if (isLoadingAccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/ClientLogin" replace />;
  }

  if (!draft) {
    return <div className="text-gray-400">Onboarding record not found.</div>;
  }

  const hasAccess = currentUser?.role === 'admin' || currentUser?.client_account_id === draft.client_account_id;

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 py-24">
        <Card className="bg-[#12121a] border-white/5 max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl mx-auto bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
              <Lock className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
              <p className="text-gray-400">This intake form is only available to the linked client account and AssistantAI admins.</p>
            </div>
            <Button variant="outline" onClick={() => base44.auth.logout('/')} className="w-full border-white/10 bg-transparent text-white hover:bg-white/5">
              Return to Website
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const backHref = currentUser?.role === 'admin' ? '/Onboarding' : '/ClientPortal';
  const backLabel = currentUser?.role === 'admin' ? 'Back to Onboarding Dashboard' : 'Back to Client Portal';

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <Link to={backHref} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Client Intake Form</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">{draft.client_name}</Badge>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Capture Everything Needed for Setup</h2>
          <p className="text-gray-400 max-w-3xl">Collect business details, service rules, tone guidance, escalation numbers, FAQs, and connected systems in one premium intake workflow.</p>
        </div>
      </div>

      <OnboardingIntakeForm
        value={draft}
        isSaving={saveMutation.isPending}
        onChange={(key, value) => setDraft((prev) => ({ ...prev, [key]: value }))}
        onSave={() => saveMutation.mutate(draft)}
      />
    </div>
  );
}