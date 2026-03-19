export const integrationDefinitions = [
  {
    title: 'CRM Integrations',
    category: 'crm',
    description: 'Keep leads, customer records, and follow-up actions aligned inside your business systems.',
    features: [
      'Create new leads',
      'Update contact records',
      'Track call outcomes',
      'Support cleaner pipeline follow-up',
    ],
    items: [
      {
        appName: 'GoHighLevel',
        appCode: 'GHL',
        description: 'Keep lead details, notes, and workflow actions aligned inside GoHighLevel.',
      },
    ],
  },
  {
    title: 'Calendar Integrations',
    category: 'calendar',
    description: 'Sync live availability so bookings stay accurate and easier to manage.',
    features: [
      'Sync availability',
      'Support appointment booking',
      'Reduce admin work',
      'Keep bookings aligned with the real schedule',
    ],
    items: [
      {
        appName: 'Google Calendar',
        appCode: 'GC',
        description: 'Connect Google Calendar so AssistantAI can work with real availability and booking workflows.',
      },
      {
        appName: 'Outlook Calendar',
        appCode: 'OC',
        description: 'Connect Outlook Calendar to keep Microsoft-based schedules and appointments aligned.',
      },
    ],
  },
  {
    title: 'Messaging Integrations',
    category: 'messaging',
    description: 'Send confirmations, follow-up messages, and notifications with less manual work.',
    features: [
      'Send confirmations',
      'Trigger missed-call follow-up',
      'Notify staff',
      'Support nurture flows',
    ],
    items: [
      {
        appName: 'Twilio',
        appCode: 'TW',
        description: 'Use Twilio for confirmations, reminders, and SMS follow-up after calls or bookings.',
      },
    ],
  },
  {
    title: 'Payments',
    category: 'payments',
    description: 'Keep billing and payment workflows visible and easier to manage.',
    features: [
      'Manage secure payments',
      'Store billing methods',
      'Support subscription management',
      'Keep invoices in one place',
    ],
    items: [
      {
        appName: 'Stripe',
        appCode: 'ST',
        description: 'Use Stripe for subscription billing, saved methods, and invoice visibility.',
      },
    ],
  },
  {
    title: 'Future Integrations',
    category: 'future',
    description: 'Prepare for future workflow expansion without implying anything is live before it is connected.',
    features: [
      'Extend automation coverage',
      'Support cross-system workflows',
      'Prepare for future growth',
      'Keep visibility clean and safe',
    ],
    items: [
      {
        appName: 'Zapier',
        appCode: 'ZA',
        description: 'Use Zapier later to connect AssistantAI with broader workflow tools and automations.',
      },
    ],
  },
];

export function mergeIntegrationState(records = []) {
  return integrationDefinitions.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      const record = records.find((entry) => entry.app_name === item.appName);
      return {
        ...item,
        id: record?.id,
        status: record?.connection_status || 'not_connected',
        connectedAccountIdentifier: record?.connected_account_identifier || '',
        lastSyncTime: record?.last_sync_time || '',
        lastErrorMessage: record?.last_error_message || '',
        managedBy: record?.managed_by || 'admin',
        clientAccountId: record?.client_account_id || null,
      };
    }),
  }));
}

export function buildIntegrationSummary(records = []) {
  const connected = records.filter((item) => item.connection_status === 'connected').length;
  const lastSyncRecord = records
    .filter((item) => item.last_sync_time)
    .sort((a, b) => new Date(b.last_sync_time).getTime() - new Date(a.last_sync_time).getTime())[0];
  const pending = records.filter((item) => item.connection_status === 'pending').length;
  const errors = records.filter((item) => item.connection_status === 'error').length;

  return [
    {
      label: 'Connected Apps',
      value: connected,
      helper: connected > 0 ? 'Apps currently connected' : 'No live connections yet',
    },
    {
      label: 'Last Successful Sync',
      value: lastSyncRecord?.last_sync_time ? new Date(lastSyncRecord.last_sync_time).toLocaleString() : 'No sync yet',
      helper: 'Most recent stored sync timestamp',
    },
    {
      label: 'Pending Connections',
      value: pending,
      helper: pending > 0 ? 'Waiting for setup or verification' : 'No pending connection requests',
    },
    {
      label: 'Sync Health',
      value: errors > 0 ? 'Needs Attention' : connected > 0 ? 'Healthy' : 'Not connected',
      helper: errors > 0 ? `${errors} integration issue${errors > 1 ? 's' : ''} stored` : 'Based on current saved state',
    },
  ];
}

export function getPrimaryAction(status) {
  if (status === 'connected' || status === 'pending') return 'manage';
  if (status === 'error') return 'reconnect';
  return 'connect';
}

export function getSecondaryAction(status) {
  if (status === 'connected' || status === 'pending' || status === 'error') return 'disconnect';
  return null;
}