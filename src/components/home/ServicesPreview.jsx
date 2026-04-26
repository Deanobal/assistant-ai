import { Phone, UserCheck, CalendarCheck, Database, MessageSquareText, PhoneForwarded } from 'lucide-react';

const cards = [
  { icon: Phone, title: 'Instant Call Answering', desc: 'Use an AI receptionist to answer every call instantly so your service business stops losing leads to missed calls and voicemail.' },
  { icon: UserCheck, title: 'Lead Capture', desc: 'Capture enquiry details, qualify prospects, and pass cleaner information into your workflow from the first conversation.' },
  { icon: CalendarCheck, title: 'Job Booking', desc: 'Turn inbound demand into booked jobs, appointments, and scheduled next steps faster with less manual coordination.' },
  { icon: Database, title: 'CRM Sync', desc: 'Keep customer records accurate with CRM integration that updates contacts, notes, and outcomes automatically.' },
  { icon: MessageSquareText, title: 'Follow-Up Automation', desc: 'Trigger SMS and email follow-up automatically so prospects get fast confirmations, reminders, and next steps.' },
  { icon: PhoneForwarded, title: 'Smart Call Routing', desc: 'Send urgent or high-value calls to the right person when human input is needed without slowing down response times.' },
];

export default function ServicesPreview() {
  return (
    <section className="relative py-18 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-cyan-400 text-lg font-medium mb-3">CORE FEATURES</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Instant Call Answering, Lead Capture, Job Booking, Follow-Up Automation and CRM Sync</h2>
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