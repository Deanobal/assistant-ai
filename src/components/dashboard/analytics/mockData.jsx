import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';

const referenceDate = new Date('2026-03-18T18:00:00+11:00');

const leadStatuses = [
  'new', 'new', 'new', 'new', 'new', 'new', 'new', 'new', 'new',
  'contacted', 'contacted', 'contacted', 'contacted',
  'qualified', 'qualified', 'qualified', 'qualified', 'qualified', 'qualified', 'qualified',
  'booked', 'booked', 'booked', 'booked',
  'closed', 'closed', 'closed',
];

export const mockLeads = leadStatuses.map((status, index) => ({
  id: `lead-${index + 1}`,
  status,
  full_name: [
    'Olivia Carter', 'Liam Murphy', 'Chloe Bennett', 'Ethan Hughes', 'Mia Collins', 'Jack Turner', 'Ava Wilson',
    'Noah Harris', 'Grace Foster', 'Mason Clarke', 'Zoe Mitchell', 'Lucas Evans', 'Ruby Brooks', 'Thomas Reed',
    'Sophie Kelly', 'Archie Price', 'Ella Johnson', 'Henry Ward', 'Amelia Scott', 'Leo Morris', 'Hannah Doyle',
    'Cooper James', 'Matilda Ryan', 'Oscar Bailey', 'Isla Perry', 'Harvey Fisher', 'Evie Morgan'
  ][index],
  business_name: [
    'Parramatta Plumbing Co', 'Northern Beaches Air', 'Sunrise Dental Care', 'Westview Property Group', 'Harbour Legal',
    'Canterbury Electrical', 'Blue Gum Auto Care', 'Coastal Physio Rooms', 'Hills Family Dental', 'Inner West Plumbing',
    'Summit Glass & Glazing', 'Brighton Realty', 'Sydney Family Law', 'Rapid Drain Solutions', 'North Shore Smiles',
    'Eastern Suburbs Plumbing', 'Precision Air Services', 'Harbourview Real Estate', 'CBD Injury Clinic', 'Macarthur Legal',
    'Alpha Electrical Group', 'Southern Coast Auto', 'Westpoint Physio', 'Metro Dental Studio', 'Sydney Leak Detection',
    'Harbour Homes', 'Cityside Plumbing'
  ][index],
}));

export const mockCallRecords = [
  {
    id: 'call-1',
    timestamp: '2026-03-18T08:12:00+11:00',
    duration: 428,
    status: 'booked',
    lead_id: 'lead-21',
    caller_name: 'Sarah Miller',
    caller_phone: '+61 412 774 221',
    enquiry_category: 'urgent service',
    sentiment: 'positive',
    follow_up_required: false,
    appointment_booked: true,
    ai_summary: 'Caller reported a burst pipe in Parramatta and booked the next available same-day visit.',
    outcome_label: 'Appointment booked',
  },
  {
    id: 'call-2',
    timestamp: '2026-03-18T10:44:00+11:00',
    duration: 214,
    status: 'answered',
    lead_id: 'lead-14',
    caller_name: 'Daniel Ross',
    caller_phone: '+61 434 118 620',
    enquiry_category: 'pricing',
    sentiment: 'neutral',
    follow_up_required: true,
    appointment_booked: false,
    ai_summary: 'Caller asked for hot water system replacement pricing and requested a quote by SMS.',
    outcome_label: 'Quote follow-up needed',
  },
  {
    id: 'call-3',
    timestamp: '2026-03-17T07:56:00+11:00',
    duration: 0,
    status: 'missed',
    lead_id: null,
    caller_name: 'Unknown Caller',
    caller_phone: '+61 421 880 155',
    enquiry_category: 'general enquiry',
    sentiment: 'neutral',
    follow_up_required: true,
    appointment_booked: false,
    ai_summary: 'Missed inbound call before business hours. No message left.',
    outcome_label: 'Missed call',
  },
  {
    id: 'call-4',
    timestamp: '2026-03-17T11:08:00+11:00',
    duration: 366,
    status: 'answered',
    lead_id: 'lead-15',
    caller_name: 'Priya Nair',
    caller_phone: '+61 466 210 484',
    enquiry_category: 'booking',
    sentiment: 'positive',
    follow_up_required: false,
    appointment_booked: false,
    ai_summary: 'Caller enquired about a routine maintenance booking for next week and requested available times.',
    outcome_label: 'Lead captured',
  },
  {
    id: 'call-5',
    timestamp: '2026-03-16T09:24:00+11:00',
    duration: 295,
    status: 'transferred',
    lead_id: 'lead-16',
    caller_name: 'Olivia Kent',
    caller_phone: '+61 478 992 510',
    enquiry_category: 'support',
    sentiment: 'negative',
    follow_up_required: true,
    appointment_booked: false,
    ai_summary: 'Existing customer raised a service issue and the call was transferred for manual review.',
    outcome_label: 'Transferred to team',
  },
  {
    id: 'call-6',
    timestamp: '2026-03-15T13:18:00+11:00',
    duration: 301,
    status: 'booked',
    lead_id: 'lead-22',
    caller_name: 'Matthew Doyle',
    caller_phone: '+61 423 451 338',
    enquiry_category: 'booking',
    sentiment: 'positive',
    follow_up_required: false,
    appointment_booked: true,
    ai_summary: 'Booked a ducted air-con service for a property in Penrith.',
    outcome_label: 'Appointment booked',
  },
  {
    id: 'call-7',
    timestamp: '2026-03-14T16:42:00+11:00',
    duration: 184,
    status: 'answered',
    lead_id: null,
    caller_name: 'Brooke Taylor',
    caller_phone: '+61 455 606 792',
    enquiry_category: 'reschedule',
    sentiment: 'neutral',
    follow_up_required: true,
    appointment_booked: false,
    ai_summary: 'Customer needed to move an installation appointment from Friday to Monday morning.',
    outcome_label: 'Reschedule requested',
  },
  {
    id: 'call-8',
    timestamp: '2026-03-13T08:38:00+11:00',
    duration: 412,
    status: 'booked',
    lead_id: 'lead-23',
    caller_name: 'Harrison Green',
    caller_phone: '+61 401 337 914',
    enquiry_category: 'urgent service',
    sentiment: 'positive',
    follow_up_required: false,
    appointment_booked: true,
    ai_summary: 'Caller reported no hot water at a rental property and accepted the first available slot.',
    outcome_label: 'Appointment booked',
  },
  {
    id: 'call-9',
    timestamp: '2026-03-12T10:12:00+11:00',
    duration: 242,
    status: 'answered',
    lead_id: 'lead-17',
    caller_name: 'Emma White',
    caller_phone: '+61 414 272 901',
    enquiry_category: 'pricing',
    sentiment: 'positive',
    follow_up_required: false,
    appointment_booked: false,
    ai_summary: 'Caller asked for split system pricing and agreed to receive a same-day estimate.',
    outcome_label: 'Quote requested',
  },
  {
    id: 'call-10',
    timestamp: '2026-03-11T15:32:00+11:00',
    duration: 0,
    status: 'missed',
    lead_id: null,
    caller_name: 'Unknown Caller',
    caller_phone: '+61 437 882 441',
    enquiry_category: 'urgent service',
    sentiment: 'negative',
    follow_up_required: true,
    appointment_booked: false,
    ai_summary: 'Missed inbound call during peak afternoon period.',
    outcome_label: 'Missed call',
  },
  {
    id: 'call-11',
    timestamp: '2026-03-10T09:48:00+11:00',
    duration: 348,
    status: 'answered',
    lead_id: 'lead-18',
    caller_name: 'Natalie Ford',
    caller_phone: '+61 490 771 660',
    enquiry_category: 'general enquiry',
    sentiment: 'neutral',
    follow_up_required: false,
    appointment_booked: false,
    ai_summary: 'Caller asked whether weekend appointments are available in the Hills District.',
    outcome_label: 'Lead captured',
  },
  {
    id: 'call-12',
    timestamp: '2026-03-09T12:06:00+11:00',
    duration: 278,
    status: 'disconnected',
    lead_id: null,
    caller_name: 'Jason Hall',
    caller_phone: '+61 422 161 543',
    enquiry_category: 'follow-up',
    sentiment: 'neutral',
    follow_up_required: true,
    appointment_booked: false,
    ai_summary: 'Caller disconnected after confirming they were following up on a previous quote.',
    outcome_label: 'Disconnected call',
  },
  {
    id: 'call-13',
    timestamp: '2026-03-08T08:54:00+11:00',
    duration: 393,
    status: 'booked',
    lead_id: 'lead-24',
    caller_name: 'Kate Morrison',
    caller_phone: '+61 425 718 331',
    enquiry_category: 'booking',
    sentiment: 'positive',
    follow_up_required: false,
    appointment_booked: true,
    ai_summary: 'Booked a routine dental consult after asking about next available appointments.',
    outcome_label: 'Appointment booked',
  },
  {
    id: 'call-14',
    timestamp: '2026-03-07T14:18:00+11:00',
    duration: 226,
    status: 'answered',
    lead_id: 'lead-19',
    caller_name: 'Ben Howard',
    caller_phone: '+61 411 273 880',
    enquiry_category: 'support',
    sentiment: 'negative',
    follow_up_required: true,
    appointment_booked: false,
    ai_summary: 'Existing client requested assistance with a recent installation issue in Liverpool.',
    outcome_label: 'Support follow-up',
  },
  {
    id: 'call-15',
    timestamp: '2026-03-05T09:12:00+11:00',
    duration: 254,
    status: 'answered',
    lead_id: 'lead-20',
    caller_name: 'Sienna Brooks',
    caller_phone: '+61 433 540 672',
    enquiry_category: 'general enquiry',
    sentiment: 'positive',
    follow_up_required: false,
    appointment_booked: false,
    ai_summary: 'Caller wanted to confirm service areas for a multi-site property portfolio.',
    outcome_label: 'Lead captured',
  },
  {
    id: 'call-16',
    timestamp: '2026-03-03T16:04:00+11:00',
    duration: 0,
    status: 'missed',
    lead_id: null,
    caller_name: 'Unknown Caller',
    caller_phone: '+61 404 992 765',
    enquiry_category: 'pricing',
    sentiment: 'neutral',
    follow_up_required: true,
    appointment_booked: false,
    ai_summary: 'Missed call during the late afternoon rush.',
    outcome_label: 'Missed call',
  },
  {
    id: 'call-17',
    timestamp: '2026-03-01T11:36:00+11:00',
    duration: 337,
    status: 'answered',
    lead_id: 'lead-13',
    caller_name: 'Alicia Moore',
    caller_phone: '+61 469 234 512',
    enquiry_category: 'follow-up',
    sentiment: 'positive',
    follow_up_required: false,
    appointment_booked: false,
    ai_summary: 'Followed up on a quote from last week and confirmed interest in proceeding.',
    outcome_label: 'Lead warmed up',
  },
  {
    id: 'call-18',
    timestamp: '2026-02-27T08:22:00+11:00',
    duration: 289,
    status: 'booked',
    lead_id: 'lead-12',
    caller_name: 'Chris Bennett',
    caller_phone: '+61 418 811 421',
    enquiry_category: 'booking',
    sentiment: 'positive',
    follow_up_required: false,
    appointment_booked: true,
    ai_summary: 'Booked a same-week inspection for roof leak damage in the Inner West.',
    outcome_label: 'Appointment booked',
  },
  {
    id: 'call-19',
    timestamp: '2026-02-24T13:42:00+11:00',
    duration: 206,
    status: 'answered',
    lead_id: null,
    caller_name: 'Laura Singh',
    caller_phone: '+61 470 119 280',
    enquiry_category: 'reschedule',
    sentiment: 'neutral',
    follow_up_required: true,
    appointment_booked: false,
    ai_summary: 'Customer requested to move a follow-up visit to the following Tuesday.',
    outcome_label: 'Reschedule requested',
  },
  {
    id: 'call-20',
    timestamp: '2026-02-20T10:28:00+11:00',
    duration: 310,
    status: 'answered',
    lead_id: 'lead-11',
    caller_name: 'Toby Ellis',
    caller_phone: '+61 452 890 317',
    enquiry_category: 'pricing',
    sentiment: 'positive',
    follow_up_required: false,
    appointment_booked: false,
    ai_summary: 'Requested pricing for preventative maintenance at a two-storey office in Chatswood.',
    outcome_label: 'Quote requested',
  },
  {
    id: 'call-21',
    timestamp: '2026-02-16T09:14:00+11:00',
    duration: 375,
    status: 'answered',
    lead_id: 'lead-10',
    caller_name: 'Megan Riley',
    caller_phone: '+61 415 993 842',
    enquiry_category: 'general enquiry',
    sentiment: 'positive',
    follow_up_required: false,
    appointment_booked: false,
    ai_summary: 'Caller asked about availability for a commercial fit-out quote.',
    outcome_label: 'Lead captured',
  },
  {
    id: 'call-22',
    timestamp: '2026-02-12T15:18:00+11:00',
    duration: 0,
    status: 'missed',
    lead_id: null,
    caller_name: 'Unknown Caller',
    caller_phone: '+61 402 615 448',
    enquiry_category: 'support',
    sentiment: 'negative',
    follow_up_required: true,
    appointment_booked: false,
    ai_summary: 'Missed support-related call in the afternoon.',
    outcome_label: 'Missed call',
  },
  {
    id: 'call-23',
    timestamp: '2026-02-08T11:42:00+11:00',
    duration: 287,
    status: 'answered',
    lead_id: 'lead-9',
    caller_name: 'Georgia Lane',
    caller_phone: '+61 430 774 995',
    enquiry_category: 'booking',
    sentiment: 'positive',
    follow_up_required: false,
    appointment_booked: false,
    ai_summary: 'Caller requested a booking window for a weekend inspection in the Sutherland Shire.',
    outcome_label: 'Lead captured',
  },
  {
    id: 'call-24',
    timestamp: '2026-02-03T08:46:00+11:00',
    duration: 444,
    status: 'booked',
    lead_id: 'lead-8',
    caller_name: 'Nick Porter',
    caller_phone: '+61 447 501 663',
    enquiry_category: 'urgent service',
    sentiment: 'positive',
    follow_up_required: false,
    appointment_booked: true,
    ai_summary: 'Caller had a blocked drain emergency and confirmed a technician dispatch for the same morning.',
    outcome_label: 'Appointment booked',
  },
];

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

const bucketLabel = (hour) => {
  if (hour < 10) return '7am – 10am';
  if (hour < 13) return '10am – 1pm';
  if (hour < 16) return '1pm – 4pm';
  return '4pm – 7pm';
};

const countBy = (items, valueGetter) => items.reduce((acc, item) => {
  const value = valueGetter(item);
  acc[value] = (acc[value] || 0) + 1;
  return acc;
}, {});

const formatSeconds = (value) => {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
};

const buildDailyTrend = () => {
  const days = eachDayOfInterval({ start: subDays(referenceDate, 6), end: referenceDate });
  return days.map((day) => {
    const records = mockCallRecords.filter((record) => format(parseISO(record.timestamp), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
    const missed = records.filter((record) => record.status === 'missed').length;
    return {
      label: format(day, 'EEE'),
      answered: records.length - missed,
      missed,
    };
  });
};

const buildWeeklyTrend = () => {
  const weeks = eachWeekOfInterval({ start: subWeeks(referenceDate, 7), end: referenceDate }, { weekStartsOn: 1 });
  return weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const records = mockCallRecords.filter((record) => {
      const date = parseISO(record.timestamp);
      return date >= startOfWeek(weekStart, { weekStartsOn: 1 }) && date <= weekEnd;
    });
    const missed = records.filter((record) => record.status === 'missed').length;
    return {
      label: format(weekStart, 'dd MMM'),
      answered: records.length - missed,
      missed,
    };
  });
};

const buildMonthlyTrend = () => {
  const months = eachMonthOfInterval({ start: subMonths(referenceDate, 5), end: referenceDate });
  return months.map((monthStart) => {
    const monthKey = format(monthStart, 'yyyy-MM');
    const records = mockCallRecords.filter((record) => format(parseISO(record.timestamp), 'yyyy-MM') === monthKey);
    const missed = records.filter((record) => record.status === 'missed').length;
    return {
      label: format(startOfMonth(monthStart), 'MMM'),
      answered: records.length - missed,
      missed,
    };
  });
};

export function getAnalyticsSnapshot() {
  const leadCounts = countBy(mockLeads, (lead) => lead.status);
  const categoryCounts = countBy(mockCallRecords, (record) => record.enquiry_category);
  const peakBuckets = countBy(mockCallRecords, (record) => bucketLabel(parseISO(record.timestamp).getHours()));
  const peakCallTimes = Object.entries(peakBuckets).sort((a, b) => b[1] - a[1])[0]?.[0] || '10am – 1pm';
  const categoryData = Object.entries(categoryCounts).map(([key, value], index) => ({
    key,
    label: categoryLabels[key],
    value,
    color: categoryColors[index],
  })).sort((a, b) => b.value - a.value);

  const qualifiedLeads = leadCounts.qualified || 0;
  const appointmentsBooked = leadCounts.booked || 0;
  const closedLeads = leadCounts.closed || 0;
  const totalLeads = mockLeads.length;
  const newLeads = leadCounts.new || 0;
  const followUpCalls = mockCallRecords.filter((record) => record.follow_up_required).length;
  const linkedLeadCalls = mockCallRecords.filter((record) => record.lead_id).length;
  const averageDurationSeconds = Math.round(
    mockCallRecords.reduce((sum, record) => sum + record.duration, 0) / mockCallRecords.length
  );

  return {
    kpis: [
      {
        label: 'Leads Captured',
        value: totalLeads,
        helper: `${leadCounts.new || 0} new leads currently waiting`,
      },
      {
        label: 'Qualified Leads',
        value: qualifiedLeads,
        helper: `${leadCounts.contacted || 0} additional leads in follow-up`,
      },
      {
        label: 'Appointments Booked',
        value: appointmentsBooked,
        helper: `${closedLeads} jobs already converted to closed`,
      },
      {
        label: 'Conversion Rate',
        value: `${Math.round((qualifiedLeads / Math.max(newLeads, 1)) * 100)}%`,
        helper: 'Lead to qualified rate',
      },
    ],
    stageRates: [
      {
        label: 'New → Qualified',
        value: `${Math.round((qualifiedLeads / Math.max(newLeads, 1)) * 100)}%`,
      },
      {
        label: 'Qualified → Booked',
        value: `${Math.round((appointmentsBooked / Math.max(qualifiedLeads, 1)) * 100)}%`,
      },
      {
        label: 'Booked → Closed',
        value: `${Math.round((closedLeads / Math.max(appointmentsBooked, 1)) * 100)}%`,
      },
    ],
    trendData: {
      daily: buildDailyTrend(),
      weekly: buildWeeklyTrend(),
      monthly: buildMonthlyTrend(),
    },
    categoryData,
    insights: [
      {
        label: 'Peak Call Times',
        value: peakCallTimes,
        helper: 'Highest inbound activity window',
      },
      {
        label: 'Average Call Duration',
        value: formatSeconds(averageDurationSeconds),
        helper: 'Across all AI-handled calls',
      },
      {
        label: 'Calls Requiring Follow-Up',
        value: followUpCalls,
        helper: `${linkedLeadCalls} calls linked to captured leads`,
      },
      {
        label: 'Most Common Enquiry Type',
        value: categoryData[0]?.label || 'Booking',
        helper: `${categoryData[0]?.value || 0} calls in the current sample`,
      },
    ],
  };
}