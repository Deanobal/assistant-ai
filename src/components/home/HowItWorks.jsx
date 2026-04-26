import { PhoneCall, Lightbulb, Link as LinkIcon, Rocket } from 'lucide-react';

const steps = [
  { icon: PhoneCall, step: '01', title: 'Book a Strategy Call', desc: 'We learn how your business handles calls, bookings, follow-up, and missed opportunities today.' },
  { icon: Lightbulb, step: '02', title: 'We Build Your System', desc: 'We design the AssistantAI call handling and automation workflow around your business.' },
  { icon: LinkIcon, step: '03', title: 'We Connect Your Tools', desc: 'We connect CRM, calendar, follow-up, and the systems your team already uses.' },
  { icon: Rocket, step: '04', title: 'You Go Live', desc: 'Your system goes live with support, optimisation, and ongoing management included.' }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 md:py-20 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-cyan-400 mb-3 text-lg font-medium">PROCESS</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            From strategy call to live AI — we handle everything so you can focus on running your business.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative p-6 rounded-2xl border border-white/5 bg-[#12121a]"
            >
              <span className="text-5xl font-bold text-white/[0.03] absolute top-4 right-4">{step.step}</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-500 text-base leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}