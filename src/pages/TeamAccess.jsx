import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import InviteMemberCard from '@/components/admin/team/InviteMemberCard';
import TeamMembersCard from '@/components/admin/team/TeamMembersCard';

export default function TeamAccess() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [lastInvitedEmail, setLastInvitedEmail] = useState('');
  const [lastResetEmail, setLastResetEmail] = useState('');

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => base44.entities.User.list('-created_date', 100),
    initialData: [],
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }) => base44.users.inviteUser(email, role),
    onSuccess: (_, variables) => {
      setLastInvitedEmail(variables.email);
      setEmail('');
      setRole('user');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }) => base44.entities.User.update(userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (targetEmail) => base44.auth.resetPasswordRequest(targetEmail),
    onSuccess: (_, targetEmail) => {
      setLastResetEmail(targetEmail);
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Team Access</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">Admin-only control</Badge>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Manage Admin and User Access</h2>
          <p className="text-gray-400 max-w-3xl">Invite people manually, control who is an admin, and send password reset emails when a team member needs to choose a new password.</p>
        </div>
      </div>

      <InviteMemberCard
        email={email}
        role={role}
        setEmail={setEmail}
        setRole={setRole}
        lastInvitedEmail={lastInvitedEmail}
        isLoading={inviteMutation.isPending}
        onInvite={() => inviteMutation.mutate({ email, role })}
      />

      <TeamMembersCard
        members={members}
        currentUserEmail={currentUser?.email}
        isLoading={roleMutation.isPending || resetPasswordMutation.isPending}
        lastResetEmail={lastResetEmail}
        onChangeRole={(userId, role) => roleMutation.mutate({ userId, role })}
        onResetPassword={(targetEmail) => resetPasswordMutation.mutate(targetEmail)}
      />
    </div>
  );
}