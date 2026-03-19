export const availableServices = [
  'AI Receptionist',
  'CRM Integration',
  'Calendar Booking',
  'SMS Follow-Up',
  'Email Automation',
  'Workflow Automation',
  'Call Analytics',
  'Sentiment Analysis',
  'Billing Dashboard',
  'Support Access',
];

export const clientStatusStyles = {
  Active: 'bg-green-500/10 text-green-400 border-green-500/20',
  Onboarding: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Trial: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  Paused: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export const serviceStatusStyles = {
  Active: 'bg-green-500/10 text-green-400 border-green-500/20',
  Inactive: 'bg-white/5 text-gray-300 border-white/10',
  Trial: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  'Add-on': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

export function calculateManagerStats(clients) {
  const activeServices = clients.reduce((sum, client) => sum + (client.services || []).filter((service) => service.status !== 'Inactive').length, 0);
  return [
    { label: 'Total Clients', value: clients.length, helper: 'Across all managed accounts' },
    { label: 'Monthly Recurring Revenue', value: `$${clients.reduce((sum, client) => sum + (client.monthly_revenue || 0), 0).toLocaleString()}`, helper: 'Current contracted revenue' },
    { label: 'Active Services', value: activeServices, helper: 'Live and trial service lines' },
    { label: 'Calls This Month', value: clients.reduce((sum, client) => sum + (client.total_calls_month || 0), 0).toLocaleString(), helper: 'Combined client call volume' },
    { label: 'Clients Onboarding', value: clients.filter((client) => client.status === 'Onboarding').length, helper: 'Accounts still in rollout' },
    { label: 'Clients Requiring Follow-Up', value: clients.filter((client) => client.requires_follow_up).length, helper: 'Needs internal attention' },
  ];
}