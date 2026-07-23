import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const siteOrigin = 'https://www.assistantai.com.au';

const routes = {
  '/': {
    title: 'AI Receptionist Australia for Service Businesses | AssistantAI',
    description: 'AssistantAI is an AI receptionist for Australian service businesses, answering calls 24/7, qualifying enquiries, supporting bookings and automating follow-up.',
    h1: 'AI Receptionist for Australian Service Businesses',
    intro: 'An AI voice agent for business that answers calls, qualifies enquiries and follows up 24/7 so missed calls become booked opportunities.',
  },
  '/Services': {
    title: 'AI Receptionist Services Australia | AssistantAI',
    description: 'Explore AI call answering, lead qualification, booking support, follow-up automation and virtual AI assistant services for Australian businesses.',
    h1: 'AI Receptionist and Automation Services',
    intro: 'A practical automated phone answering service, lead capture system and virtual AI assistant built around your business workflow.',
  },
  '/Industries': {
    title: 'AI Receptionist for Australian Service Industries | AssistantAI',
    description: 'AI receptionist solutions for Australian trades, clinics, real estate, cleaning, legal and other enquiry-driven service businesses.',
    h1: 'AI Receptionist Solutions by Industry',
    intro: 'Industry-specific call answering, qualification and booking workflows for Australian service businesses.',
  },
  '/Pricing': {
    title: 'AI Receptionist Pricing Australia | AssistantAI',
    description: 'Compare AssistantAI Starter, Growth and Enterprise plans for AI call answering, lead capture, booking support and follow-up automation.',
    h1: 'Clear AI Receptionist Pricing',
    intro: 'Choose the level of call coverage, automation and integration support that fits your business.',
  },
  '/About': {
    title: 'About AssistantAI | Australian AI Receptionist Platform',
    description: 'Learn how AssistantAI helps Australian service businesses answer calls, capture enquiries and improve speed to lead.',
    h1: 'Built for Australian Service Businesses',
    intro: 'AssistantAI combines practical voice AI with lead capture, booking support and clear human escalation.',
  },
  '/Contact': {
    title: 'Contact AssistantAI Australia | Book a Strategy Call',
    description: 'Contact AssistantAI to discuss AI receptionist, automated call answering, lead capture and booking workflows for your business.',
    h1: 'Talk to AssistantAI',
    intro: 'Tell us where calls, enquiries or follow-up are being lost and we will map the right next step.',
  },
  '/BookStrategyCall': {
    title: 'Book an AI Receptionist Strategy Call | AssistantAI',
    description: 'Book a strategy call to map an AI receptionist and follow-up workflow for your Australian service business.',
    h1: 'Book Your AI Receptionist Strategy Call',
    intro: 'Review your call volume, missed enquiries, booking process and integration requirements with AssistantAI.',
  },
  '/GetStartedNow': {
    title: 'Get Started with AssistantAI | AI Receptionist Australia',
    description: 'Choose an AssistantAI plan and start setting up 24/7 AI call answering, lead qualification and follow-up automation.',
    h1: 'Start Your AssistantAI Setup',
    intro: 'Choose a plan, complete secure checkout and begin onboarding your AI receptionist.',
  },
  '/CaseStudies': {
    title: 'AssistantAI Case Studies | AI Receptionist Results',
    description: 'See how AI reception, call answering and lead follow-up workflows help service businesses capture more opportunities.',
    h1: 'AI Receptionist Case Studies',
    intro: 'Practical examples of faster call response, cleaner lead capture and more consistent follow-up.',
  },
  '/Blog': {
    title: 'AI Receptionist Australia Resources | AssistantAI Blog',
    description: 'Guides on AI receptionists, voice agents, missed-call recovery, lead qualification, booking support and business automation.',
    h1: 'AI Receptionist and Automation Resources',
    intro: 'Practical guidance for Australian service businesses evaluating AI call answering and follow-up automation.',
  },
  '/ai-assistant-australia': {
    title: 'AI Assistant Australia | Calls, Leads, Bookings & Follow-Up | AssistantAI',
    description: 'AssistantAI provides an AI assistant for Australian service businesses that answers calls, captures leads, qualifies enquiries and supports bookings.',
    h1: 'AI Assistant for Australian Service Businesses',
    intro: 'One practical AI system for calls, lead capture, booking handoff and follow-up.',
  },
  '/Integrations': {
    title: 'AssistantAI Integrations | CRM, Calendar, Payments and Messaging',
    description: 'Connect AssistantAI with CRM, calendar, Stripe, messaging and workflow tools used by Australian service businesses.',
    h1: 'Connect AssistantAI to Your Business Tools',
    intro: 'Join call answering and lead capture with the systems your team already uses.',
  },
  '/Platform': {
    title: 'AssistantAI Platform | AI Calls, Leads and Follow-Up',
    description: 'See the AssistantAI platform for AI call handling, lead qualification, booking support, client visibility and follow-up workflows.',
    h1: 'One Platform for Calls, Leads and Follow-Up',
    intro: 'Turn every enquiry into a clear record, next action and measurable outcome.',
  },
  '/AIDemo': {
    title: 'Live AI Receptionist Demo Australia | AssistantAI',
    description: 'Try the AssistantAI voice demo and hear how an AI receptionist can answer and qualify a service-business enquiry.',
    h1: 'Try the Live AI Receptionist',
    intro: 'Speak with the AssistantAI demo to experience natural call answering and enquiry qualification.',
  },
  '/Resources': {
    title: 'AI Receptionist Buyer Resources Australia | AssistantAI',
    description: 'Use AssistantAI checklists and guides to evaluate AI receptionists, call answering, integrations and follow-up automation.',
    h1: 'AI Receptionist Buyer Resources',
    intro: 'Clear, practical resources for choosing and implementing an AI voice agent for business.',
  },
  '/ClientLogin': {
    title: 'Client Login | AssistantAI',
    description: 'Securely access your AssistantAI client portal.',
    h1: 'Client Login',
    intro: 'Access your AssistantAI portal to review call activity, billing, setup progress and support.',
    robots: 'noindex, nofollow',
  },
  '/thank-you': {
    title: 'Thank You | AssistantAI',
    description: 'Thanks — we have received your request and will contact you with the right next step.',
    h1: 'Thanks — we have received your request.',
    intro: 'We will review your details and contact you with the clearest next step.',
    robots: 'noindex, nofollow',
  },
};

function decodeSourceString(value = '') {
  return value.replace(/\\'/g, "'").replace(/\\n/g, ' ').replace(/\\\\/g, '\\');
}

function field(block, name) {
  const match = block.match(new RegExp(`\\b${name}:\\s*'((?:\\\\'|[^'])*)'`));
  return decodeSourceString(match?.[1] || '');
}

async function addHighIntentRoutes() {
  const source = await readFile(path.join(rootDir, 'src/pages/HighIntentSeoLanding.jsx'), 'utf8');
  const pagePattern = /\r?\n\s{2}'([^']+)': \{([\s\S]*?)\r?\n\s{4}icon: [A-Za-z0-9_]+,\r?\n\s{2}\},/g;
  for (const match of source.matchAll(pagePattern)) {
    const slug = match[1];
    const block = match[2];
    routes[`/${slug}`] = {
      title: field(block, 'title'),
      description: field(block, 'description'),
      h1: field(block, 'h1'),
      intro: field(block, 'intro'),
    };
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function replaceMeta(html, attribute, key, content) {
  const pattern = new RegExp(`<meta\\s+${attribute}="${key}"[^>]*>`, 'i');
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function renderRoute(template, routePath, page) {
  const canonical = new URL(routePath, siteOrigin).toString();
  const shell = `<main data-prerendered-route="${escapeHtml(routePath)}" style="min-height:70vh;background:#06080d;color:#fff;padding:clamp(5rem,10vw,9rem) 1.5rem;font-family:Inter,Arial,sans-serif"><div style="max-width:72rem;margin:0 auto"><p style="color:#67e8f9;font-weight:700;letter-spacing:.14em;text-transform:uppercase">AssistantAI Australia</p><h1 style="max-width:58rem;font-size:clamp(2.5rem,7vw,5rem);line-height:1.02;margin:1rem 0 1.5rem">${escapeHtml(page.h1)}</h1><p style="max-width:48rem;color:#cbd5e1;font-size:1.2rem;line-height:1.7">${escapeHtml(page.intro || page.description)}</p></div></main>`;

  let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`);
  html = replaceMeta(html, 'name', 'description', page.description);
  html = replaceMeta(html, 'name', 'robots', page.robots || 'index, follow');
  html = replaceMeta(html, 'property', 'og:title', page.title);
  html = replaceMeta(html, 'property', 'og:description', page.description);
  html = replaceMeta(html, 'property', 'og:url', canonical);
  html = replaceMeta(html, 'name', 'twitter:title', page.title);
  html = replaceMeta(html, 'name', 'twitter:description', page.description);
  html = html.replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}" />`);
  html = html.replace(/<div id="root">[\s\S]*<\/div>\s*(?=<\/body>)/i, `<div id="root">${shell}</div>\n\n  `);
  return html;
}

await addHighIntentRoutes();
const template = await readFile(path.join(distDir, 'index.html'), 'utf8');

for (const [routePath, page] of Object.entries(routes)) {
  if (!page.title || !page.description || !page.h1) continue;
  const outputDir = routePath === '/' ? distDir : path.join(distDir, routePath.slice(1));
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'index.html'), renderRoute(template, routePath, page), 'utf8');
}

console.log(`Prerendered ${Object.keys(routes).length} crawlable routes.`);
