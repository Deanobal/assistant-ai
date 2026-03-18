import React from 'react';
import { CheckCircle2, Clock3, Database, MessageSquare, PhoneCall, UserCheck } from 'lucide-react';

export const defaultWorkflowItems = [
  {
    icon: PhoneCall,
    title: 'Call Answered',
    desc: 'AssistantAI answers instantly and starts qualification.',
  },
  {
    icon: UserCheck,
    title: 'Lead Qualified',
    desc: 'Urgency, location, and job details are captured automatically.',
  },
  {
    icon: Database,
    title: 'CRM Updated',
    desc: 'The enquiry is pushed into the workflow with notes attached.',
  },
  {
    icon: MessageSquare,
    title: 'Follow-Up Sent',
    desc: 'A confirmation message goes out without manual admin.',
  },
];

export default function DemoAutomationPanel({ currentStep, items = defaultWorkflowItems }) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-[#11111a] p-5 md:p-6">
      <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">Workflow</p>
      <h3 className="mt-2 text-lg font-semibold text-white">What the AI is doing</h3>
      <div className="mt-6 space-y-4">
        {items.map((item, index) => {
          const active = index <= currentStep;
          return (
            <div
              key={item.title}
              className={`rounded-2xl border px-4 py-4 transition-all ${
                active ? 'border-cyan-500/20 bg-cyan-500/5' : 'border-white/8 bg-white/[0.02]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${active ? 'bg-cyan-500/12' : 'bg-white/[0.04]'}`}>
                  <item.icon className={`h-4 w-4 ${active ? 'text-cyan-400' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{item.title}</p>
                    {active ? <CheckCircle2 className="h-4 w-4 text-cyan-400" /> : <Clock3 className="h-4 w-4 text-gray-500" />}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-gray-400">{item.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}