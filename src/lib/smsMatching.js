function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

export function normalizePhone(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  const cleaned = raw.replace(/[^\d+]/g, '');
  const digits = cleaned.replace(/\D/g, '');

  if (cleaned.startsWith('+')) {
    return `+${digits}`;
  }

  if (digits.startsWith('61') && digits.length === 11) {
    return `+${digits}`;
  }

  if (digits.startsWith('0') && digits.length === 10) {
    return `+61${digits.slice(1)}`;
  }

  if (digits.length === 9 && digits.startsWith('4')) {
    return `+61${digits}`;
  }

  return cleaned;
}

function getPhoneMatchScore(inboundPhone, leadPhone) {
  if (!inboundPhone || !leadPhone) {
    return { score: 0, reason: null };
  }

  if (inboundPhone === leadPhone) {
    return { score: 80, reason: 'Exact phone match' };
  }

  const inboundDigits = inboundPhone.replace(/\D/g, '');
  const leadDigits = leadPhone.replace(/\D/g, '');

  if (inboundDigits.slice(-8) && inboundDigits.slice(-8) === leadDigits.slice(-8)) {
    return { score: 55, reason: 'Strong phone similarity' };
  }

  if (inboundDigits.slice(-6) && inboundDigits.slice(-6) === leadDigits.slice(-6)) {
    return { score: 30, reason: 'Partial phone similarity' };
  }

  return { score: 0, reason: null };
}

function getRecentActivityScore(lead) {
  const timestamp = lead.last_activity_at || lead.updated_date || lead.created_date || lead.created_at;
  if (!timestamp) {
    return { score: 0, reason: null };
  }

  const daysAgo = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24);

  if (daysAgo <= 7) {
    return { score: 15, reason: 'Recent lead activity' };
  }

  if (daysAgo <= 30) {
    return { score: 8, reason: 'Active in last 30 days' };
  }

  if (daysAgo <= 90) {
    return { score: 3, reason: 'Activity in last 90 days' };
  }

  return { score: 0, reason: null };
}

function getOutboundHistoryScore(inboundPhone, lead, outboundLogs) {
  const leadLogs = outboundLogs.filter((log) => log.entity_id === lead.id);
  const scoredLogs = leadLogs.map((log) => {
    const logPhone = normalizePhone(log.recipient_email || log.metadata?.receiver_number || log.metadata?.sms_actual_recipient);

    if (!logPhone || !inboundPhone) {
      return null;
    }

    if (logPhone === inboundPhone) {
      return { log, score: 70, reason: 'Recent outbound customer SMS history' };
    }

    const inboundDigits = inboundPhone.replace(/\D/g, '');
    const logDigits = logPhone.replace(/\D/g, '');

    if (inboundDigits.slice(-8) && inboundDigits.slice(-8) === logDigits.slice(-8)) {
      return { log, score: 40, reason: 'Outbound SMS to a highly similar number' };
    }

    if (inboundDigits.slice(-6) && inboundDigits.slice(-6) === logDigits.slice(-6)) {
      return { log, score: 20, reason: 'Outbound SMS to a partially similar number' };
    }

    return null;
  }).filter(Boolean);

  if (scoredLogs.length === 0) {
    return { score: 0, reason: null, count: 0 };
  }

  const bestMatch = scoredLogs.sort((a, b) => b.score - a.score)[0];
  const latest = bestMatch.log;
  const daysAgo = (Date.now() - new Date(latest.triggered_at || latest.created_date).getTime()) / (1000 * 60 * 60 * 24);
  const freshnessBonus = daysAgo <= 14 ? 12 : daysAgo <= 45 ? 6 : 0;

  return {
    score: bestMatch.score + freshnessBonus,
    reason: scoredLogs.length > 1 && bestMatch.score >= 40 ? `${scoredLogs.length} related outbound customer SMS messages` : bestMatch.reason,
    count: scoredLogs.length,
  };
}

export function buildLeadSearchText(lead) {
  return [lead.full_name, lead.business_name, lead.email, lead.mobile_number]
    .map(normalizeText)
    .filter(Boolean)
    .join(' ');
}

export function getSearchableLeadResults(leads, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return leads.slice(0, 8);
  }

  return leads
    .filter((lead) => buildLeadSearchText(lead).includes(normalizedQuery))
    .slice(0, 8);
}

export function getSuggestedLeadMatches(log, leads, outboundLogs) {
  const inboundPhone = normalizePhone(log.metadata?.sender_number || '');

  return leads
    .map((lead) => {
      const leadPhone = normalizePhone(lead.mobile_number || '');
      const phone = getPhoneMatchScore(inboundPhone, leadPhone);
      const outbound = getOutboundHistoryScore(inboundPhone, lead, outboundLogs);
      const activity = getRecentActivityScore(lead);
      const score = phone.score + outbound.score + activity.score;
      const reasons = [phone.reason, outbound.reason, activity.reason].filter(Boolean);

      return {
        lead,
        score,
        reasons,
        outboundMatchCount: outbound.count,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export function getResolutionState(log) {
  if (log.metadata?.manual_match_copy_log_id) {
    return 'matched';
  }

  if (log.metadata?.resolution_status === 'reviewed_no_match') {
    return 'reviewed_no_match';
  }

  return 'open';
}