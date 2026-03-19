import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';

const categoryLabels = {
  booking: 'Booking',
  pricing: 'Pricing',
  'urgent service': 'Urgent Service',
  'general enquiry': 'General Enquiry',
  'follow-up': 'Follow-Up',
  support: 'Support',
  reschedule: 'Reschedule',
};

const categoryColors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b', '#ec4899', '#94a3b8'];
const qualifiedStatuses = ['Contacted', 'Strategy Call Booked', 'Proposal Sent', 'Follow-Up', 'Won', 'Onboarding'];
const bookingStatuses = ['Strategy Call Booked', 'Won', 'Onboarding'];

function bucketLabel(hour) {
  if (hour < 10) return '7am – 10am';
  if (hour < 13) return '10am – 1pm';
  if (hour < 16) return '1pm – 4pm';
  return '4pm – 7pm';
}

function countBy(items, valueGetter) {
  return items.reduce((acc, item) => {
    const value = valueGetter(item);
    if (!value) return acc;
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function formatSeconds(value) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

function parseDate(value) {
  return value ? parseISO(value) : null;
}

function buildTrend(records, view) {
  const now = new Date();

  if (view === 'daily') {
    return eachDayOfInterval({ start: subDays(now, 6), end: now }).map((day) => {
      const matches = records.filter((record) => isSameDay(parseDate(record.timestamp), day));
      const missed = matches.filter((record) => record.status === 'missed').length;
      return {
        label: format(day, 'EEE'),
        answered: matches.length - missed,
        missed,
      };
    });
  }

  if (view === 'weekly') {
    return eachWeekOfInterval({ start: subWeeks(now, 7), end: now }, { weekStartsOn: 1 }).map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const matches = records.filter((record) => {
        const date = parseDate(record.timestamp);
        return date >= startOfWeek(weekStart, { weekStartsOn: 1 }) && date <= weekEnd;
      });
      const missed = matches.filter((record) => record.status === 'missed').length;
      return {
        label: format(weekStart, 'dd MMM'),
        answered: matches.length - missed,
        missed,
      };
    });
  }

  return eachMonthOfInterval({ start: subMonths(now, 5), end: now }).map((monthStart) => {
    const monthKey = format(monthStart, 'yyyy-MM');
    const matches = records.filter((record) => format(parseDate(record.timestamp), 'yyyy-MM') === monthKey);
    const missed = matches.filter((record) => record.status === 'missed').length;
    return {
      label: format(monthStart, 'MMM'),
      answered: matches.length - missed,
      missed,
    };
  });
}

export function getLiveAnalyticsSnapshot(leads, callRecords) {
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter((lead) => qualifiedStatuses.includes(lead.status)).length;
  const leadBookedCount = leads.filter((lead) => bookingStatuses.includes(lead.status)).length;
  const callBookedCount = callRecords.filter((record) => record.appointment_booked).length;
  const appointmentsBooked = Math.max(leadBookedCount, callBookedCount);
  const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

  const categoryCounts = countBy(callRecords, (record) => record.enquiry_category);
  const categoryData = Object.entries(categoryCounts)
    .map(([key, value], index) => ({
      key,
      label: categoryLabels[key] || key,
      value,
      color: categoryColors[index % categoryColors.length],
    }))
    .sort((a, b) => b.value - a.value);

  const peakBuckets = countBy(callRecords, (record) => {
    const date = parseDate(record.timestamp);
    return date ? bucketLabel(date.getHours()) : null;
  });

  const peakCallTimes = Object.entries(peakBuckets).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No data yet';
  const followUpCalls = callRecords.filter((record) => record.follow_up_required).length;
  const linkedLeadCalls = callRecords.filter((record) => record.lead_id).length;
  const totalDuration = callRecords.reduce((sum, record) => sum + (record.duration || 0), 0);
  const averageDurationSeconds = callRecords.length > 0 ? Math.round(totalDuration / callRecords.length) : 0;

  return {
    kpis: [
      {
        label: 'Leads Captured',
        value: totalLeads,
        helper: totalLeads > 0 ? `${leads.filter((lead) => lead.status === 'New Lead').length} currently marked as new` : 'No live lead records yet',
      },
      {
        label: 'Qualified Leads',
        value: qualifiedLeads,
        helper: qualifiedLeads > 0 ? 'Leads progressed beyond the initial stage' : 'No qualified leads yet',
      },
      {
        label: 'Appointments Booked',
        value: appointmentsBooked,
        helper: appointmentsBooked > 0 ? 'Derived from lead and call booking records' : 'No bookings recorded yet',
      },
      {
        label: 'Conversion Rate',
        value: `${conversionRate}%`,
        helper: 'Qualified leads as a share of total leads',
      },
    ],
    stageRates: [
      {
        label: 'New → Qualified',
        value: `${conversionRate}%`,
      },
      {
        label: 'Qualified → Booked',
        value: `${qualifiedLeads > 0 ? Math.round((appointmentsBooked / qualifiedLeads) * 100) : 0}%`,
      },
      {
        label: 'Booked → Won',
        value: `${appointmentsBooked > 0 ? Math.round((leads.filter((lead) => lead.status === 'Won').length / appointmentsBooked) * 100) : 0}%`,
      },
    ],
    trendData: {
      daily: buildTrend(callRecords, 'daily'),
      weekly: buildTrend(callRecords, 'weekly'),
      monthly: buildTrend(callRecords, 'monthly'),
    },
    categoryData,
    insights: [
      {
        label: 'Peak Call Times',
        value: peakCallTimes,
        helper: 'Highest inbound activity window from live call records',
      },
      {
        label: 'Average Call Duration',
        value: averageDurationSeconds > 0 ? formatSeconds(averageDurationSeconds) : 'No data yet',
        helper: 'Based on stored call durations',
      },
      {
        label: 'Calls Requiring Follow-Up',
        value: followUpCalls,
        helper: `${linkedLeadCalls} calls currently linked to a lead`,
      },
      {
        label: 'Most Common Enquiry Type',
        value: categoryData[0]?.label || 'No data yet',
        helper: categoryData[0] ? `${categoryData[0].value} matching call records` : 'Waiting for live call categories',
      },
    ],
  };
}