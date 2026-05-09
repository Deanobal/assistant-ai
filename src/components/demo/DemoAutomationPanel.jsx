import { CheckCircle2, Clock3, CreditCard, Database, PhoneCall, Sparkles, UserCheck } from 'lucide-react';

export const defaultWorkflowItems = [
  {
    icon: PhoneCall,
    title: 'AI Answers & Qualifies',
    desc: 'AssistantAI answers live, identifies the business need, and asks qualification questions.',
  },
  {
    icon: Sparkles,
    title: 'Plan Recommended',
    desc: 'The AI recommends Starter, Growth, or Enterprise based on volume, booking, CRM, follow-up, and complexity.',
  },
  {
    icon: Database,
    title: 'Lead Created / Updated',
    desc: 'Contact details, business details, summary, intent, and likely plan fit are saved to the lead system.',
  },
  {
    icon: CreditCard,
    title: 'Checkout Offered',
    desc: 'Ready buyers can receive an instant Stripe checkout link instead of waiting for a strategy call.',
  },
  {
    icon: UserCheck,
    title: 'Onboarding Starts',
    desc: 'Once Stripe confirms payment, the client, billing, intake, integrations, tasks, and admin alerts are created.',
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