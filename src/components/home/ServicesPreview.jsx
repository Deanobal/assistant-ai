import { Phone, UserCheck, CalendarCheck, Database, MessageSquareText, PhoneForwarded } from 'lucide-react';

const cards = [
  { icon: Phone, title: 'AI Receptionist', desc: 'Answers calls and captures enquiries 24/7 so ready buyers do not get left waiting.' },
  { icon: UserCheck, title: 'AI Sales Qualifier', desc: 'Qualifies live prospects and recommends whether Starter, Growth, or Enterprise is the right fit.' },
  { icon: CalendarCheck, title: 'AI Booking Assistant', desc: 'Turns inbound demand into booked jobs, appointments, and scheduled next steps faster.' },
  { icon: Database, title: 'CRM + Pipeline Sync', desc: 'Keeps lead records, contact details, notes, and pipeline status updated automatically.' },
  { icon: MessageSquareText, title: 'Payment + Signup Flow', desc: 'Creates secure checkout for ready Starter and Growth buyers after plan review.' },
  { icon: PhoneForwarded, title: 'Onboarding Trigger', desc: 'Starts fulfilment workflows after confirmed payment so setup can begin immediately.' },
];

export default function ServicesPreview() {
  return (
    <section className="relative py-18 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-cyan-400 text-lg font-medium mb-3">CORE FEATURES</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">AI That Answers, Qualifies, Takes Payment, and Starts Onboarding</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={card.title}
              className="p-6 rounded-2xl border border-white/5 bg-[#12121a] card-hover"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                <card.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{card.title}</h3>
              <p className="text-gray-400 text-base leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}