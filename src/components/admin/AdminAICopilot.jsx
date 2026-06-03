import React, { useMemo, useState } from 'react';
import { Bot, Loader2, Maximize2, MessageSquare, Minimize2, Send, ShieldCheck, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const starterPrompts = [
  'What needs attention right now?',
  'Help me fix this page',
  'Draft a client follow-up',
  'Summarise onboarding blockers',
  'Create marketing copy',
];

function initialMessage() {
  return {
    role: 'assistant',
    content: 'Admin Copilot loaded. I can help with leads, onboarding, support, content, errors and next actions. On a Client Workspace, I can apply safe client edits like business name, email, phone, website, status and owner.',
    actions: [
      { label: 'Open Leads', href: '/LeadDashboard' },
      { label: 'Open Onboarding', href: '/Onboarding' },
    ],
  };
}

function withModeNote(data) {
  const parts = [data.reply || 'No response.'];
  if (data.mode) parts.push(`Mode: ${data.mode}`);
  if (data.model) parts.push(`Model: ${data.model}`);
  if (data.openai_error) parts.push(`OpenAI error: ${data.openai_error}`);
  return parts.join('\n\n');
}

function clientIdFromSearch(search) {
  try {
    return new URLSearchParams(search || '').get('id');
  } catch (_error) {
    return null;
  }
}

function extractValue(message, patterns) {
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) return match[1].trim().replace(/^['"]|['"]$/g, '');
  }
  return '';
}

function parseSafeClientPatch(message) {
  const text = String(message || '').trim();
  const lower = text.toLowerCase();
  if (lower.includes('delete') || lower.includes('remove client') || lower.includes('override billing') || lower.includes('change price') || lower.includes('pricing')) {
    return { blocked: true, patch: {} };
  }

  const patch = {};
  const businessName = extractValue(text, [/business name\s*(?:to|=|as)\s*['"]?([^'"\n]+)['"]?/i, /company\s*(?:to|=|as)\s*['"]?([^'"\n]+)['"]?/i]);
  const fullName = extractValue(text, [/full name\s*(?:to|=|as)\s*['"]?([^'"\n]+)['"]?/i, /contact name\s*(?:to|=|as)\s*['"]?([^'"\n]+)['"]?/i]);
  const email = extractValue(text, [/email\s*(?:to|=|as)\s*['"]?([^'"\s]+)['"]?/i]);
  const phone = extractValue(text, [/(?:phone|mobile)\s*(?:number)?\s*(?:to|=|as)\s*['"]?([+0-9\s]+)['"]?/i]);
  const website = extractValue(text, [/website\s*(?:to|=|as)\s*['"]?([^'"\s]+)['"]?/i]);
  const industry = extractValue(text, [/industry\s*(?:to|=|as)\s*['"]?([^'"\n]+)['"]?/i]);
  const service = extractValue(text, [/main service\s*(?:to|=|as)\s*['"]?([^'"\n]+)['"]?/i]);
  const status = extractValue(text, [/status\s*(?:to|=|as)\s*['"]?([^'"\n]+)['"]?/i]);
  const owner = extractValue(text, [/assigned owner\s*(?:to|=|as)\s*['"]?([^'"\n]+)['"]?/i, /assign(?:ed)?\s*(?:to)?\s*['"]?([^'"\n]+)['"]?/i]);

  if (businessName) patch.business_name = businessName;
  if (fullName) patch.full_name = fullName;
  if (email) patch.email = email;
  if (phone) {
    patch.mobile_number = phone;
    patch.phone = phone;
  }
  if (website) patch.website = website;
  if (industry) patch.industry = industry;
  if (service) patch.main_service = service;
  if (status) patch.status = status;
  if (owner) patch.assigned_owner = owner;

  return { blocked: false, patch };
}

export default function AdminAICopilot() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([initialMessage()]);

  const context = useMemo(() => ({
    page: location.pathname,
    search: location.search,
    timestamp: new Date().toISOString(),
  }), [location.pathname, location.search]);

  async function trySafeClientEdit(clean) {
    const clientId = clientIdFromSearch(location.search);
    if (!clientId || location.pathname !== '/ClientWorkspace') return false;

    const parsed = parseSafeClientPatch(clean);
    if (parsed.blocked) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'I did not apply that. Deleting, pricing, billing overrides and destructive changes require a dedicated confirmation flow.',
        actions: []
      }]);
      return true;
    }

    if (!Object.keys(parsed.patch || {}).length) return false;

    const response = await fetch('/api/admin-client-safe-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, patch: parsed.patch })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.details || data.error || 'Safe client update failed.');

    setMessages((prev) => [...prev, {
      role: 'assistant',
      content: `Done. I updated: ${Object.entries(parsed.patch).map(([key, value]) => `${key} = ${value}`).join(', ')}. Refresh the workspace if the visible fields do not update immediately.`,
      actions: [{ label: 'Reload Client Workspace', href: `/ClientWorkspace?id=${clientId}` }]
    }]);
    return true;
  }

  async function sendMessage(text = input) {
    const clean = String(text || '').trim();
    if (!clean || busy) return;
    setInput('');
    const userMessage = { role: 'user', content: clean };
    setMessages((prev) => [...prev, userMessage]);
    setBusy(true);
    try {
      const applied = await trySafeClientEdit(clean);
      if (!applied) {
        const response = await fetch('/api/admin-ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: clean, context }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) throw new Error(data.details || data.error || 'Copilot failed.');
        setMessages((prev) => [...prev, { role: 'assistant', content: withModeNote(data), actions: data.actions || [] }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: error.message || 'Copilot could not respond.', actions: [] }]);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-[5.5rem] right-4 z-40 flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-2xl shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800 lg:bottom-6"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 text-slate-950"><Bot className="h-5 w-5" /></span>
        <span className="hidden sm:block">Admin AI</span>
      </button>
    );
  }

  return (
    <div className={`fixed z-40 rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 ${expanded ? 'inset-4 lg:inset-8' : 'bottom-[5.5rem] right-4 w-[calc(100vw-2rem)] max-w-[430px] lg:bottom-6'}`}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white"><Bot className="h-5 w-5" /></div>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-slate-950">AssistantAI Admin Copilot</p>
            <p className="truncate text-xs font-semibold text-slate-500">Operator mode · {location.pathname}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setExpanded((prev) => !prev)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950">{expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
          <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"><X className="h-4 w-4" /></button>
        </div>
      </div>

      <div className={`overflow-y-auto p-4 ${expanded ? 'h-[calc(100vh-15rem)]' : 'h-[420px]'}`}>
        <div className="mb-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-3 text-xs font-semibold text-cyan-900">
          <div className="mb-1 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Controlled actions</div>
          On Client Workspace pages, I can apply safe client edits. Pricing, publishing, deleting, sending and billing overrides require confirmation.
        </div>

        <div className="space-y-3">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === 'user' ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-slate-50 text-slate-800'}`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.actions?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <Link key={`${action.href}-${action.label}`} to={action.href} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100">
                        {action.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Thinking...</div>}
        </div>
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {starterPrompts.map((prompt) => (
            <button key={prompt} type="button" onClick={() => sendMessage(prompt)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100">
              {prompt}
            </button>
          ))}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask the admin copilot..."
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none ring-cyan-200 placeholder:text-slate-400 focus:ring-4"
          />
          <Button type="submit" disabled={busy || !input.trim()} className="rounded-2xl bg-slate-950 px-4 text-white hover:bg-slate-800 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
