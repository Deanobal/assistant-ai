import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function OnboardingStatusView({ onboardings }) {
  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-white font-semibold text-lg">Onboarding Status View</h3>
          <p className="text-sm text-gray-400 mt-1">Track which won leads are already moving through onboarding.</p>
        </div>

        {onboardings.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-6 text-gray-400">
            No onboarding records yet.
          </div>
        ) : (
          <div className="space-y-3">
            {onboardings.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <p className="text-white font-medium">{item.client_name}</p>
                  <p className="text-sm text-gray-400">{item.contact_name} • {item.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 w-fit">{item.status || item.onboarding_stage}</Badge>
                  {item.client_id && (
                    <Link to={`/ClientWorkspace?id=${item.client_id}`}>
                      <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">Continue Onboarding</Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}