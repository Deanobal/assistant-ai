import {
  AudioLines,
  CalendarCheck2,
  Check,
  ClipboardCheck,
  ContactRound,
  Phone,
  Send,
  UsersRound,
} from 'lucide-react';

const steps = [
  { title: 'Answer instantly', body: 'Pick up every call, even when your team is busy.' },
  { title: 'Qualify the enquiry', body: 'Ask the right questions and capture key details.' },
  { title: 'Book or escalate', body: 'Book the next step or route urgent calls.' },
  { title: 'Follow up automatically', body: 'Send confirmations so nothing slips.' },
];

const outcomes = [
  { label: 'Contact details captured', helper: 'Name, phone and suburb', icon: ContactRound },
  { label: 'Plumbing enquiry qualified', helper: 'Issue, urgency and notes', icon: ClipboardCheck },
  { label: 'Booking request sent', helper: 'To your booking workflow', icon: CalendarCheck2 },
  { label: 'Follow-up queued', helper: 'Confirmation ready', icon: Send },
];

const journeySteps = [
  { icon: Phone, label: 'Incoming call', time: '02:37' },
  { icon: ContactRound, label: 'Details captured', time: '02:38' },
  { icon: CalendarCheck2, label: 'Booking requested', time: '02:45' },
  { icon: Send, label: 'Follow-up queued', time: '02:46' },
];

export default function PremiumWorkflowSection() {
  return (
    <section id="how-it-works" className="aai-deferred-section scroll-mt-20 border-b border-[#142033] bg-[#040a14] py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-[760px]">
          <h2 className="text-balance text-4xl font-[700] leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">Every call, handled from hello to follow-up.</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#aab4c3] sm:text-lg sm:leading-8">AssistantAI listens, captures the details your team needs, and moves each enquiry to the right next step.</p>
        </div>

        <div className="mt-12 grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(340px,0.9fr)]">
          <div className="overflow-hidden rounded-[18px] border border-[#2a374a] bg-[#07111d]">
            <div className="flex items-center justify-between border-b border-[#1c2939] px-5 py-4 sm:px-7">
              <p className="font-semibold text-white">Call journey</p>
              <p className="flex items-center gap-2 text-xs font-semibold text-[#9ef2c2]"><Check className="h-4 w-4" /> Completed</p>
            </div>

            <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[220px_1fr]">
              <div className="space-y-3">
                {journeySteps.map(({ icon: Icon, label, time }, index) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${index === 0 ? 'border-[#347cff] bg-[#15366e] text-[#6fa3ff]' : 'border-[#243349] bg-[#101d30] text-[#9db1ca]'}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-[#94a1b1]">{time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-[15px] border border-[#223046] bg-[#08131f]">
                <div className="border-b border-[#1c2939] p-4 sm:p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold text-[#6d9fff]"><AudioLines className="h-4 w-4" /> AI Receptionist</p>
                  <p className="mt-2 text-sm leading-6 text-[#e4e9ef]">Thanks for calling. How can I help today?</p>
                </div>
                <div className="border-b border-[#1c2939] p-4 sm:p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold text-[#61d3de]"><ContactRound className="h-4 w-4" /> Caller</p>
                  <p className="mt-2 text-sm leading-6 text-[#e4e9ef]">I need a plumber for a leaking tap.</p>
                </div>
                <div className="p-4 sm:p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold text-[#6d9fff]"><AudioLines className="h-4 w-4" /> AI Receptionist</p>
                  <p className="mt-2 text-sm leading-6 text-[#e4e9ef]">I can help with that. What suburb are you in?</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-[#2a374a] bg-[#07111d] p-4 sm:p-5">
            <h3 className="px-1 pb-4 text-lg font-semibold text-white">Action taken</h3>
            <div className="space-y-3">
              {outcomes.map(({ label, helper, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 rounded-[13px] border border-[#1d2a3c] bg-[#091521] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#11233b] text-[#7aa8ff]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="mt-1 text-xs text-[#94a1b1]">{helper}</p>
                  </div>
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <ol className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-4 border-t border-[#263348] pt-5 xl:border-t-0 xl:pt-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#347cff] bg-[#0b2245] text-sm font-bold text-[#8bb3ff]">{index + 1}</span>
              <div>
                <h3 className="font-semibold text-white">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#9ca9b9]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex items-start gap-4 rounded-[16px] border border-[#263448] bg-[#07111d] p-5 sm:items-center sm:p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#347cff] bg-[#0b2245] text-[#75a5ff]"><UsersRound className="h-5 w-5" /></div>
          <div>
            <h3 className="font-semibold text-white">Your team stays in control.</h3>
            <p className="mt-1 text-sm leading-6 text-[#aab4c3]">Urgent or complex calls can be escalated instantly.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
