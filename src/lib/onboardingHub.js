export const PRE_LIVE_STATUSES = ['New', 'Awaiting Payment', 'Awaiting Assets', 'Onboarding', 'Build', 'Testing', 'Ready for Go Live', 'Go Live'];
export const LIVE_STATUSES = ['Live', 'Paused'];

export const PLAN_PRICING = {
  Starter: { setup_fee: 1500, monthly_fee: 497 },
  Growth: { setup_fee: 3000, monthly_fee: 1500 },
  Enterprise: { setup_fee: 7500, monthly_fee: 3000 },
};

export function isPreLiveClient(client) {
  return client?.lifecycle_state === 'pre_live' || PRE_LIVE_STATUSES.includes(client?.status);
}

export function isLiveClient(client) {
  return client?.lifecycle_state === 'live' || LIVE_STATUSES.includes(client?.status);
}

export function transitionClientToLive(client) {
  return {
    ...client,
    status: 'Go Live',
    lifecycle_state: 'live',
    onboarding_archived: true,
    go_live_ready: true,
    workflow_phase: 'Go Live',
    last_activity: 'Client transitioned from Onboarding Hub to Client Manager',
  };
}

export function getPlanPrice(plan, field) {
  return PLAN_PRICING[plan]?.[field] || 0;
}