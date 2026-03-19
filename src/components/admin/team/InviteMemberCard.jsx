import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InviteMemberCard({ email, role, setEmail, setRole, onInvite, isLoading, lastInvitedEmail }) {
  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-6 space-y-5">
        <div>
          <h3 className="text-white font-semibold text-lg">Invite Team Member</h3>
          <p className="text-sm text-gray-400 mt-1">Choose who should have access and whether they should be a regular user or an admin.</p>
        </div>

        <div className="grid md:grid-cols-[1fr_180px_auto] gap-4 items-end">
          <div className="space-y-2">
            <Label className="text-gray-400">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="team@business.com"
              className="bg-white/[0.03] border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400">Access Level</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={onInvite}
            disabled={!email || isLoading}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-60"
          >
            {isLoading ? 'Sending…' : 'Send Invite'}
          </Button>
        </div>

        {lastInvitedEmail && (
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
            Invite sent to {lastInvitedEmail}
          </div>
        )}
      </CardContent>
    </Card>
  );
}