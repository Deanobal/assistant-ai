import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import OnboardingIntakeForm from '@/components/admin/onboarding/OnboardingIntakeForm';

export default function OnboardingIntake() {
  const queryClient = useQueryClient();
  const onboardingId = new URLSearchParams(window.location.search).get('id');
  const [draft, setDraft] = useState(null);

  const { data: onboardings = [] } = useQuery({
    queryKey: ['onboarding-intake', onboardingId],
    queryFn: () => base44.entities.Onboarding.filter({ id: onboardingId }, '-updated_date', 1),
    initialData: [],
  });

  const onboarding = onboardings[0] || null;

  useEffect(() => {
    if (onboarding) {
      setDraft(onboarding);
    }
  }, [onboarding]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const updatedOnboarding = await base44.entities.Onboarding.update(onboardingId, {
        ...data,
        intake_form_status: 'completed',
      });

      if (data.client_account_id) {
        await base44.entities.ClientAccount.update(data.client_account_id, {
          business_name: data.client_name,
          contact_name: data.contact_name,
          email: data.email,
          phone: data.mobile,
          industry: data.industry,
          notes_entries: [{
            title: 'Intake Form Updated',
            category: 'onboarding',
            content: data.additional_notes || data.onboarding_notes || 'Client intake form completed.',
            date: 'Today',
          }],
        });
      }

      return updatedOnboarding;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-intake', onboardingId] });
      queryClient.invalidateQueries({ queryKey: ['onboardings'] });
    },
  });

  if (!draft) {
    return <div className="text-gray-400">Onboarding record not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <Link to="/Onboarding" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Onboarding Dashboard
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