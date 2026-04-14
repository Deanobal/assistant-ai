import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function OnboardingSystemSettingsPage() {
  return (
    <div className="space-y-6">
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 space-y-3">
          <h2 className="text-2xl font-bold text-white">Onboarding Hub Settings</h2>
          <p className="text-gray-400">Operational settings area prepared for future workflow defaults, owner rules, automation triggers, and provider connections.</p>
        </CardContent>
      </Card>
    </div>
  );
}