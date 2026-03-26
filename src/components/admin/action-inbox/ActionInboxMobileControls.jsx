import React from 'react';
import { Bell, CheckCircle2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ActionInboxMobileControls({ canInstall, isStandalone, onInstall, notificationsSupported, notificationPermission, onEnableNotifications }) {
  const alertsLabel = notificationPermission === 'granted' ? 'Alerts On' : notificationPermission === 'denied' ? 'Alerts Blocked' : 'Enable Alerts';

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-3xl border border-white/5 bg-[#0f172a] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-white">Mobile response mode</p>
        <p className="mt-1 text-sm text-slate-400">Install the inbox and keep deep-linked alerts one tap away. If install is unavailable, use your browser’s Add to Home Screen option.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onInstall}
          disabled={!canInstall || isStandalone}
          className="h-11 rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/5 disabled:opacity-50"
        >
          {isStandalone ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          {isStandalone ? 'Installed' : 'Install App'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onEnableNotifications}
          disabled={!notificationsSupported || notificationPermission === 'granted'}
          className="h-11 rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/5 disabled:opacity-50"
        >
          <Bell className="h-4 w-4" />
          {alertsLabel}
        </Button>
      </div>
    </div>
  );
}