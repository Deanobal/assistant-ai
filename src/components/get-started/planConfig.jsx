export const GET_STARTED_PLANS = {
  Starter: {
    key: 'starter',
    name: 'Starter',
    setupFee: 1500,
    monthlyFee: 497,
    setupLabel: '$1,500 setup',
    monthlyLabel: '$497/month',
    description: 'Best for basic missed-call coverage, simple lead capture, and simple follow-up',
    buttonLabel: 'Choose Starter',
  },
  Growth: {
    key: 'growth',
    name: 'Growth',
    setupFee: 3000,
    monthlyFee: 1500,
    setupLabel: '$3,000 setup',
    monthlyLabel: '$1,500/month',
    description: 'Best for call handling, bookings, CRM updates, SMS/email follow-up, and reporting',
    buttonLabel: 'Choose Growth',
  },
};

export const ENTERPRISE_PLAN = {
  name: 'Enterprise',
  setupLabel: 'Custom setup from $7,500 + $3,000/month',
  monthlyLabel: 'Custom review',
  description: 'Best for multiple locations, custom workflows, advanced integrations, or compliance needs',
};

export function getPlanFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const plan = (params.get('plan') || '').toLowerCase();
  if (plan === 'starter') return GET_STARTED_PLANS.Starter;
  if (plan === 'growth') return GET_STARTED_PLANS.Growth;
  return null;
}

export function getPlanByName(name) {
  return GET_STARTED_PLANS[name] || null;
}