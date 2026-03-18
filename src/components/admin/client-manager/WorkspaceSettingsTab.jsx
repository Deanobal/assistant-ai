import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function WorkspaceSettingsTab({ client, onUpdate }) {
  return (
    <div className="space-y-6">
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-gray-400">Account Status</Label>
              <Select value={client.status} onValueChange={(value) => onUpdate({ status: value })}>
                <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Active', 'Onboarding', 'Trial', 'Paused', 'Cancelled'].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400">Notification Settings</Label>
              <Select value={client.notification_setting} onValueChange={(value) => onUpdate({ notification_setting: value })}>
                <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['standard', 'priority', 'minimal'].map((setting) => <SelectItem key={setting} value={setting}>{setting}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4">
              <div>
                <p className="text-white font-medium">Portal Access</p>
                <p className="text-sm text-gray-500">Allow client access to their portal workspace</p>
              </div>
              <Switch checked={client.portal_access} onCheckedChange={(checked) => onUpdate({ portal_access: checked })} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4">
              <div>
                <p className="text-white font-medium">Premium Support Add-On</p>
                <p className="text-sm text-gray-500">Enable faster priority support coverage</p>
              </div>
              <Switch checked={client.premium_support_add_on} onCheckedChange={(checked) => onUpdate({ premium_support_add_on: checked })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-white font-semibold">Archive Client</h3>
            <p className="text-sm text-gray-500 mt-1">Use this when the account should be removed from the active management list.</p>
          </div>
          <Button variant="outline" onClick={() => onUpdate({ is_archived: true, status: 'Cancelled' })} className="border-white/10 text-white hover:bg-white/5">
            Archive Client
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}