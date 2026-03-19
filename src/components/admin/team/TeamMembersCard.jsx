import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const roleBadgeStyles = {
  admin: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  user: 'bg-white/5 text-gray-300 border-white/10',
};

export default function TeamMembersCard({ members, currentUserEmail, onChangeRole, isLoading }) {
  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-white font-semibold text-lg">Team Access</h3>
          <p className="text-sm text-gray-400 mt-1">Only admin users can reach the internal admin area and manage other users.</p>
        </div>

        <div className="space-y-3">
          {members.map((member) => {
            const isCurrentUser = member.email === currentUserEmail;
            return (
              <div key={member.id} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-white font-medium break-all">{member.full_name || member.email}</p>
                    <Badge className={roleBadgeStyles[member.role || 'user']}>{member.role || 'user'}</Badge>
                    {isCurrentUser && <Badge className="bg-white/5 text-gray-300 border-white/10">You</Badge>}
                  </div>
                  <p className="text-sm text-gray-400 break-all">{member.email}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    disabled={isCurrentUser || isLoading || member.role === 'user'}
                    onClick={() => onChangeRole(member.id, 'user')}
                    className="border-white/10 bg-transparent text-white hover:bg-white/5 disabled:opacity-50"
                  >
                    Set as User
                  </Button>
                  <Button
                    disabled={isCurrentUser || isLoading || member.role === 'admin'}
                    onClick={() => onChangeRole(member.id, 'admin')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50"
                  >
                    Make Admin
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}