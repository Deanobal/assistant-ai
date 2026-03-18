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
  const activeServices = clients.reduce((sum, client) => sum + client.services.filter((service) => service.status !== 'Inactive').length, 0);
  return [
    { label: 'Total Clients', value: clients.length, helper: 'Across all managed accounts' },
    { label: 'Monthly Recurring Revenue', value: `$${clients.reduce((sum, client) => sum + client.monthly_revenue, 0).toLocaleString()}`, helper: 'Current contracted revenue' },
    { label: 'Active Services', value: activeServices, helper: 'Live and trial service lines' },
    { label: 'Calls This Month', value: clients.reduce((sum, client) => sum + client.total_calls_month, 0).toLocaleString(), helper: 'Combined client call volume' },
    { label: 'Clients Onboarding', value: clients.filter((client) => client.status === 'Onboarding').length, helper: 'Accounts still in rollout' },
    { label: 'Clients Requiring Follow-Up', value: clients.filter((client) => client.requires_follow_up).length, helper: 'Needs internal attention' },
  ];
}

export const mockClientAccounts = [
  {
    id: 'client-1',
    business_name: 'Harbour Plumbing Co',
    contact_name: 'Mia Thornton',
    email: 'mia@harbourplumbing.com.au',
    phone: '+61 412 554 210',
    website: 'https://harbourplumbing.com.au',
    address: '12 Kent Street, Sydney NSW',
    industry: 'trades',
    timezone: 'Australia/Sydney',
    plan_name: 'Growth',
    status: 'Active',
    monthly_fee: 2890,
    setup_fee_status: 'paid',
    billing_status: 'active',
    renewal_date: '2026-04-12',
    included_calls: 1500,
    used_calls: 1184,
    extra_call_packs: 1,
    overage_usage: 0,
    premium_support_add_on: true,
    monthly_revenue: 3290,
    total_calls_month: 1184,
    leads_captured: 142,
    appointments_booked: 61,
    last_activity: 'New same-day booking created 18 minutes ago',
    portal_access: true,
    notification_setting: 'priority',
    client_permissions: ['Overview', 'Calls', 'Analytics', 'Billing'],
    payment_method_label: 'Visa ending in 4242',
    requires_follow_up: false,
    active_services: ['AI Receptionist', 'CRM Integration', 'Calendar Booking', 'SMS Follow-Up', 'Call Analytics', 'Support Access'],
    services: [
      { name: 'AI Receptionist', status: 'Active', price: 1890 },
      { name: 'CRM Integration', status: 'Active', price: 350 },
      { name: 'Calendar Booking', status: 'Active', price: 220 },
      { name: 'SMS Follow-Up', status: 'Add-on', price: 190 },
      { name: 'Call Analytics', status: 'Active', price: 290 },
      { name: 'Support Access', status: 'Add-on', price: 350 }
    ],
    notes_entries: [
      { title: 'Upsell opportunity', category: 'upsell opportunities', content: 'Likely fit for Workflow Automation after current busy season.', date: '18 Mar 2026', next_action: 'Review in April strategy call' },
      { title: 'Onboarding note', category: 'onboarding notes', content: 'Calendar routing completed and emergency service prompts approved.', date: '11 Mar 2026', next_action: 'Monitor booking quality' }
    ],
    integrations: [
      { category: 'CRM', name: 'HubSpot', status: 'Connected', last_sync: '6 minutes ago' },
      { category: 'Calendar', name: 'Google Calendar', status: 'Connected', last_sync: '2 minutes ago' },
      { category: 'SMS', name: 'Twilio', status: 'Connected', last_sync: '9 minutes ago' },
      { category: 'Billing', name: 'Stripe', status: 'Connected', last_sync: '14 minutes ago' }
    ],
    recent_calls: [
      { caller_name: 'Sarah M.', timestamp: '18 Mar • 8:42am', outcome: 'Booked', sentiment: 'Positive', urgency: 'High', follow_up_required: false, summary: 'Burst pipe enquiry converted into same-day booking.' },
      { caller_name: 'Jason R.', timestamp: '17 Mar • 3:18pm', outcome: 'Follow-up', sentiment: 'Neutral', urgency: 'Medium', follow_up_required: true, summary: 'Pricing enquiry captured and quote follow-up requested.' },
      { caller_name: 'Olivia C.', timestamp: '17 Mar • 11:05am', outcome: 'Qualified', sentiment: 'Positive', urgency: 'Low', follow_up_required: false, summary: 'Preventative maintenance call qualified for next-week visit.' }
    ],
    invoices: [
      { number: 'INV-1042', amount: 3290, status: 'Paid', date: '01 Mar 2026' },
      { number: 'INV-0998', amount: 2890, status: 'Paid', date: '01 Feb 2026' }
    ],
    analytics: {
      lead_conversion: 38,
      average_call_duration: '3m 42s',
      peak_call_times: '7am – 10am',
      follow_up_metrics: '18 follow-up calls this month',
      trend: [
        { label: 'Week 1', calls: 260, leads: 30 },
        { label: 'Week 2', calls: 284, leads: 36 },
        { label: 'Week 3', calls: 302, leads: 38 },
        { label: 'Week 4', calls: 338, leads: 38 }
      ],
      categories: [
        { name: 'Urgent Service', value: 44, color: '#06b6d4' },
        { name: 'Booking', value: 28, color: '#3b82f6' },
        { name: 'Pricing', value: 18, color: '#8b5cf6' },
        { name: 'Support', value: 10, color: '#14b8a6' }
      ]
    },
    is_archived: false
  },
  {
    id: 'client-2',
    business_name: 'Northshore Dental Studio',
    contact_name: 'Dr Chloe Nguyen',
    email: 'hello@northshoredental.com.au',
    phone: '+61 433 661 904',
    website: 'https://northshoredental.com.au',
    address: '88 Pacific Highway, North Sydney NSW',
    industry: 'dental_clinic',
    timezone: 'Australia/Sydney',
    plan_name: 'Scale',
    status: 'Onboarding',
    monthly_fee: 3480,
    setup_fee_status: 'pending',
    billing_status: 'active',
    renewal_date: '2026-04-22',
    included_calls: 2200,
    used_calls: 642,
    extra_call_packs: 0,
    overage_usage: 0,
    premium_support_add_on: true,
    monthly_revenue: 3830,
    total_calls_month: 642,
    leads_captured: 96,
    appointments_booked: 54,
    last_activity: 'Onboarding checklist updated yesterday',
    portal_access: true,
    notification_setting: 'standard',
    client_permissions: ['Overview', 'Calls', 'Analytics'],
    payment_method_label: 'Mastercard ending in 8821',
    requires_follow_up: true,
    active_services: ['AI Receptionist', 'Calendar Booking', 'Call Analytics', 'Sentiment Analysis'],
    services: [
      { name: 'AI Receptionist', status: 'Trial', price: 2100 },
      { name: 'Calendar Booking', status: 'Active', price: 260 },
      { name: 'Call Analytics', status: 'Active', price: 290 },
      { name: 'Sentiment Analysis', status: 'Add-on', price: 180 },
      { name: 'Support Access', status: 'Active', price: 350 }
    ],
    notes_entries: [
      { title: 'Client request', category: 'client requests', content: 'Wants after-hours emergency screening rules before go-live.', date: '17 Mar 2026', next_action: 'Send revised call flow draft' },
      { title: 'Issue log', category: 'issues', content: 'Waiting on receptionist calendar access from clinic manager.', date: '15 Mar 2026', next_action: 'Follow up Friday' }
    ],
    integrations: [
      { category: 'CRM', name: 'Salesforce', status: 'Needs Attention', last_sync: '3 hours ago' },
      { category: 'Calendar', name: 'Google Calendar', status: 'Connected', last_sync: '8 minutes ago' },
      { category: 'SMS', name: 'Twilio', status: 'Not Connected', last_sync: 'No sync yet' },
      { category: 'Billing', name: 'Stripe', status: 'Connected', last_sync: '22 minutes ago' }
    ],
    recent_calls: [
      { caller_name: 'Emma B.', timestamp: '18 Mar • 9:20am', outcome: 'Booked', sentiment: 'Positive', urgency: 'Medium', follow_up_required: false, summary: 'New patient booked hygiene appointment.' },
      { caller_name: 'Michael T.', timestamp: '17 Mar • 1:40pm', outcome: 'Support', sentiment: 'Negative', urgency: 'Medium', follow_up_required: true, summary: 'Requested callback regarding post-treatment billing confusion.' },
      { caller_name: 'Ava L.', timestamp: '17 Mar • 10:02am', outcome: 'Qualified', sentiment: 'Positive', urgency: 'Low', follow_up_required: false, summary: 'Cosmetic dentistry enquiry captured for treatment consult.' }
    ],
    invoices: [
      { number: 'INV-1104', amount: 1750, status: 'Pending', date: '10 Mar 2026' },
      { number: 'INV-1039', amount: 0, status: 'Draft', date: '01 Mar 2026' }
    ],
    analytics: {
      lead_conversion: 42,
      average_call_duration: '4m 10s',
      peak_call_times: '10am – 1pm',
      follow_up_metrics: '12 support-related follow-ups',
      trend: [
        { label: 'Week 1', calls: 120, leads: 18 },
        { label: 'Week 2', calls: 148, leads: 22 },
        { label: 'Week 3', calls: 166, leads: 27 },
        { label: 'Week 4', calls: 208, leads: 29 }
      ],
      categories: [
        { name: 'Booking', value: 36, color: '#06b6d4' },
        { name: 'General Enquiry', value: 24, color: '#3b82f6' },
        { name: 'Support', value: 22, color: '#8b5cf6' },
        { name: 'Reschedule', value: 18, color: '#14b8a6' }
      ]
    },
    is_archived: false
  },
  {
    id: 'client-3',
    business_name: 'Harbourview Realty Group',
    contact_name: 'Ethan Walsh',
    email: 'ethan@harbourviewrealty.com.au',
    phone: '+61 401 882 119',
    website: 'https://harbourviewrealty.com.au',
    address: '25 George Street, Parramatta NSW',
    industry: 'real_estate',
    timezone: 'Australia/Sydney',
    plan_name: 'Starter',
    status: 'Trial',
    monthly_fee: 1890,
    setup_fee_status: 'waived',
    billing_status: 'trial',
    renewal_date: '2026-03-29',
    included_calls: 800,
    used_calls: 412,
    extra_call_packs: 0,
    overage_usage: 0,
    premium_support_add_on: false,
    monthly_revenue: 1890,
    total_calls_month: 412,
    leads_captured: 58,
    appointments_booked: 19,
    last_activity: 'Trial review booked for tomorrow',
    portal_access: true,
    notification_setting: 'standard',
    client_permissions: ['Overview', 'Calls'],
    payment_method_label: 'Awaiting card on file',
    requires_follow_up: true,
    active_services: ['AI Receptionist', 'Call Analytics'],
    services: [
      { name: 'AI Receptionist', status: 'Trial', price: 1490 },
      { name: 'Call Analytics', status: 'Active', price: 200 },
      { name: 'CRM Integration', status: 'Inactive', price: 0 }
    ],
    notes_entries: [
      { title: 'Next action', category: 'next actions', content: 'Needs decision on CRM integration before converting from trial.', date: '16 Mar 2026', next_action: 'Present Pipedrive setup option' }
    ],
    integrations: [
      { category: 'CRM', name: 'Pipedrive', status: 'Not Connected', last_sync: 'No sync yet' },
      { category: 'Calendar', name: 'Outlook Calendar', status: 'Connected', last_sync: '19 minutes ago' },
      { category: 'SMS', name: 'GoHighLevel SMS', status: 'Not Connected', last_sync: 'No sync yet' },
      { category: 'Billing', name: 'Stripe', status: 'Connected', last_sync: '31 minutes ago' }
    ],
    recent_calls: [
      { caller_name: 'Prospective Seller', timestamp: '18 Mar • 7:58am', outcome: 'Qualified', sentiment: 'Positive', urgency: 'Medium', follow_up_required: false, summary: 'Property appraisal enquiry qualified and routed to sales agent.' },
      { caller_name: 'Tenant Support', timestamp: '17 Mar • 5:12pm', outcome: 'Follow-up', sentiment: 'Neutral', urgency: 'High', follow_up_required: true, summary: 'Maintenance issue captured and queued for property manager callback.' }
    ],
    invoices: [
      { number: 'INV-1117', amount: 0, status: 'Trial', date: '01 Mar 2026' }
    ],
    analytics: {
      lead_conversion: 27,
      average_call_duration: '2m 58s',
      peak_call_times: '1pm – 4pm',
      follow_up_metrics: '9 open property follow-ups',
      trend: [
        { label: 'Week 1', calls: 80, leads: 9 },
        { label: 'Week 2', calls: 96, leads: 13 },
        { label: 'Week 3', calls: 108, leads: 17 },
        { label: 'Week 4', calls: 128, leads: 19 }
      ],
      categories: [
        { name: 'General Enquiry', value: 34, color: '#06b6d4' },
        { name: 'Booking', value: 20, color: '#3b82f6' },
        { name: 'Follow-Up', value: 28, color: '#8b5cf6' },
        { name: 'Pricing', value: 18, color: '#14b8a6' }
      ]
    },
    is_archived: false
  },
  {
    id: 'client-4',
    business_name: 'Precision Auto Service',
    contact_name: 'Luke Bennett',
    email: 'luke@precisionauto.com.au',
    phone: '+61 419 728 004',
    website: 'https://precisionauto.com.au',
    address: '54 Princes Highway, Wollongong NSW',
    industry: 'automotive',
    timezone: 'Australia/Sydney',
    plan_name: 'Growth',
    status: 'Paused',
    monthly_fee: 2490,
    setup_fee_status: 'paid',
    billing_status: 'paused',
    renewal_date: '2026-05-03',
    included_calls: 1200,
    used_calls: 276,
    extra_call_packs: 0,
    overage_usage: 0,
    premium_support_add_on: false,
    monthly_revenue: 2490,
    total_calls_month: 276,
    leads_captured: 34,
    appointments_booked: 11,
    last_activity: 'Service paused pending seasonal review',
    portal_access: false,
    notification_setting: 'minimal',
    client_permissions: ['Overview'],
    payment_method_label: 'Visa ending in 2301',
    requires_follow_up: true,
    active_services: ['AI Receptionist'],
    services: [
      { name: 'AI Receptionist', status: 'Inactive', price: 1790 },
      { name: 'SMS Follow-Up', status: 'Inactive', price: 180 },
      { name: 'Support Access', status: 'Inactive', price: 0 }
    ],
    notes_entries: [
      { title: 'Support note', category: 'support notes', content: 'Client requested temporary pause during workshop renovation.', date: '12 Mar 2026', next_action: 'Check reactivation date in two weeks' }
    ],
    integrations: [
      { category: 'CRM', name: 'Zoho', status: 'Needs Attention', last_sync: '5 days ago' },
      { category: 'Calendar', name: 'Google Calendar', status: 'Not Connected', last_sync: 'No sync yet' },
      { category: 'SMS', name: 'Twilio', status: 'Not Connected', last_sync: 'No sync yet' },
      { category: 'Billing', name: 'Stripe', status: 'Connected', last_sync: '1 day ago' }
    ],
    recent_calls: [
      { caller_name: 'Vehicle Service Enquiry', timestamp: '15 Mar • 2:04pm', outcome: 'Paused', sentiment: 'Neutral', urgency: 'Low', follow_up_required: true, summary: 'Call captured manually while account is temporarily paused.' }
    ],
    invoices: [
      { number: 'INV-1089', amount: 2490, status: 'Paid', date: '01 Mar 2026' },
      { number: 'INV-1010', amount: 2490, status: 'Paid', date: '01 Feb 2026' }
    ],
    analytics: {
      lead_conversion: 19,
      average_call_duration: '2m 21s',
      peak_call_times: '4pm – 7pm',
      follow_up_metrics: '4 pending callbacks',
      trend: [
        { label: 'Week 1', calls: 90, leads: 10 },
        { label: 'Week 2', calls: 78, leads: 8 },
        { label: 'Week 3', calls: 60, leads: 7 },
        { label: 'Week 4', calls: 48, leads: 9 }
      ],
      categories: [
        { name: 'Booking', value: 22, color: '#06b6d4' },
        { name: 'Pricing', value: 26, color: '#3b82f6' },
        { name: 'Support', value: 30, color: '#8b5cf6' },
        { name: 'General Enquiry', value: 22, color: '#14b8a6' }
      ]
    },
    is_archived: false
  }
];