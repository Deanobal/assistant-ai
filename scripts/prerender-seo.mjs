import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const indexPath = path.join(distDir, 'index.html');
const origin = 'https://www.assistantai.com.au';
const defaultImage = `${origin}/og-assistantai.png`;

const routes = [
  ['/', 'AI Receptionist Australia | AssistantAI', 'AssistantAI builds AI receptionist, lead capture, booking support and follow-up automation systems for Australian service businesses.'],
  ['/Services', 'AI Receptionist Services | AssistantAI', 'Explore AssistantAI services for AI call answering, enquiry qualification, lead capture, booking support, CRM follow-up and secure signup.'],
  ['/Industries', 'AI Receptionist for Australian Service Industries | AssistantAI', 'AI receptionist workflows for Australian service businesses that need better lead capture, job booking and follow-up automation.'],
  ['/Integrations', 'AI Receptionist Integrations | AssistantAI', 'Connect AssistantAI with customer details, calendar support, SMS, email, secure signup, CRM workflows and setup automation.'],
  ['/Pricing', 'AssistantAI Pricing | AI Receptionist Plans Australia', 'Compare AssistantAI Starter, Growth and Enterprise pricing for AI receptionist setup, missed-call coverage, booking support and follow-up automation.'],
  ['/AIDemo', 'Live AI Receptionist Demo | AssistantAI', 'Try the AssistantAI receptionist demo and see how AI answers enquiries, qualifies buyers, recommends plans and moves leads toward secure signup.'],
  ['/GetStartedNow', 'Get Started with AssistantAI | Secure AI Receptionist Signup', 'Choose an AssistantAI plan, confirm your business details and start secure signup for AI receptionist setup.'],
  ['/BookStrategyCall', 'Book an AI Receptionist Strategy Call | AssistantAI', 'Request a strategy call with AssistantAI to map your AI receptionist, lead capture, booking, CRM follow-up and automation workflow.'],
  ['/Resources', 'AI Receptionist Resources Australia | AssistantAI', 'Free AssistantAI resources for Australian service businesses comparing AI receptionists, missed-call automation, CRM follow-up, booking workflows and ROI.'],
  ['/Blog', 'AssistantAI Blog | AI Receptionist and Automation Insights', 'Practical guides on AI receptionists, missed-call automation, lead follow-up, booking workflows and service-business automation.'],
  ['/CaseStudies', 'AssistantAI Use Cases and Sample Outcomes | AI Automation', 'Explore AssistantAI use cases and sample outcomes for Australian service businesses using AI automation.'],
  ['/About', 'About AssistantAI | AI Automation for Australian Service Businesses', 'Learn how AssistantAI helps Australian service businesses improve call answering, lead capture, CRM follow-up and response times with practical AI automation.'],
  ['/Contact', 'Contact AssistantAI | AI Receptionist Australia', 'Contact AssistantAI to discuss AI receptionist setup, missed-call coverage, booking support, CRM follow-up and secure signup for your business.'],
  ['/ai-receptionist-australia', 'AI Receptionist Australia | 24/7 Call Answering and Lead Capture', 'AssistantAI provides AI receptionist systems for Australian service businesses that answer calls, capture leads, qualify enquiries and support fast follow-up.'],
  ['/ai-phone-assistant-small-business', 'AI Phone Assistant for Small Business | AssistantAI', 'AI phone assistant for small businesses that answers calls, captures enquiries, reduces missed calls and helps convert more leads into booked jobs or consultations.'],
  ['/missed-call-automation-australia', 'Missed Call Automation Australia | AssistantAI', 'Missed call automation for Australian service businesses. Capture missed calls, trigger fast follow-up and stop paid leads leaking from your sales process.'],
  ['/ai-lead-follow-up-automation', 'AI Lead Follow-Up Automation | AssistantAI', 'AI lead follow-up automation for service businesses. Capture enquiries, qualify intent and support faster SMS or email follow-up so fewer leads go cold.'],
  ['/ai-appointment-booking-assistant', 'AI Appointment Booking Assistant | AssistantAI', 'AI appointment booking assistant for service businesses. Capture booking intent, qualify enquiries and hand off to your calendar or booking process.'],
  ['/ai-receptionist-for-trades', 'AI Receptionist for Trades | AssistantAI', 'AI receptionist for trades businesses. Answer calls, capture job details, recover missed enquiries and help tradies convert more calls into booked work.'],
  ['/ai-receptionist-for-clinics', 'AI Receptionist for Clinics | AssistantAI', 'AI receptionist for clinics that helps capture appointment enquiries, support booking workflows and reduce pressure on front-desk teams.'],
  ['/ai-receptionist-for-real-estate', 'AI Receptionist for Real Estate | AssistantAI', 'AI receptionist for real estate offices that captures buyer, seller, rental and appraisal enquiries and supports faster follow-up.'],
  ['/ai-receptionist-for-cleaning-companies', 'AI Receptionist for Cleaning Companies | AssistantAI', 'AI receptionist for cleaning companies that captures quote requests, site details, service frequency, urgency and follow-up requirements.'],
  ['/ai-receptionist-for-property-maintenance', 'AI Receptionist for Property Maintenance | AssistantAI', 'AI receptionist for property maintenance and field-service teams that captures job details, triages urgency and routes enquiries faster.'],
];

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function absolute(routePath) {
  return new URL(routePath, origin).toString();
}

function schemaFor(routePath, title, description) {
  const base = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'AssistantAI',
      url: origin,
      logo: `${origin}/icons/admin-inbox-icon.svg`,
      description: 'AssistantAI builds AI receptionist and automation systems for Australian service businesses.',
      areaServed: { '@type': 'Country', name: 'Australia' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: title.replace(' | AssistantAI', ''),
      provider: { '@type': 'Organization', name: 'AssistantAI', url: origin },
      areaServed: { '@type': 'Country', name: 'Australia' },
      url: absolute(routePath),
      description,
    },
  ];

  if (routePath === '/') {
    base.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'AssistantAI',
      url: origin,
      description: 'AI receptionist and enquiry automation for Australian service businesses.',
    });
  }

  return base;
}

function buildHeadTags(routePath, title, description) {
  const canonical = absolute(routePath);
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const escapedCanonical = escapeHtml(canonical);
  const escapedImage = escapeHtml(defaultImage);
  const structured = schemaFor(routePath, title, description)
    .map((item, index) => `<script type="application/ld+json" data-prerender-seo="true" id="prerender-schema-${index}">${JSON.stringify(item)}</script>`)
    .join('\n    ');

  return `
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${escapedCanonical}" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDescription}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapedCanonical}" />
    <meta property="og:image" content="${escapedImage}" />
    <meta property="og:image:alt" content="AssistantAI AI receptionist and lead automation platform" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDescription}" />
    <meta name="twitter:image" content="${escapedImage}" />
    ${structured}`;
}

function replaceSeo(html, routePath, title, description) {
  const nextHead = buildHeadTags(routePath, title, description);
  let output = html
    .replace(/\s*<title>[\s\S]*?<\/title>/i, '')
    .replace(/\s*<meta name="description"[\s\S]*?>/gi, '')
    .replace(/\s*<meta name="robots"[\s\S]*?>/gi, '')
    .replace(/\s*<link rel="canonical"[\s\S]*?>/gi, '')
    .replace(/\s*<meta property="og:[\s\S]*?>/gi, '')
    .replace(/\s*<meta name="twitter:[\s\S]*?>/gi, '')
    .replace(/\s*<script type="application\/ld\+json" data-prerender-seo="true"[\s\S]*?<\/script>/gi, '');

  return output.replace('</head>', `${nextHead}\n  </head>`);
}

if (!fs.existsSync(indexPath)) {
  throw new Error(`Cannot find built index.html at ${indexPath}`);
}

const template = fs.readFileSync(indexPath, 'utf8');

for (const [routePath, title, description] of routes) {
  const html = replaceSeo(template, routePath, title, description);
  const routeDir = routePath === '/' ? distDir : path.join(distDir, routePath.replace(/^\//, ''));
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), html);
}

console.log(`Prerendered SEO HTML for ${routes.length} routes.`);
