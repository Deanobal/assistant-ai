import { Phone, UserCheck, CalendarCheck, Database, MessageSquareText, PhoneForwarded } from 'lucide-react';

const cards = [
  { icon: Phone, title: 'AI Receptionist', desc: 'Answers calls and captures enquiries 24/7 so ready buyers do not get left waiting.' },
  { icon: UserCheck, title: 'Enquiry Qualification', desc: 'Asks the right questions and helps work out whether Starter, Growth, or Enterprise is the right fit.' },
  { icon: CalendarCheck, title: 'Booking Support', desc: 'Helps turn inbound demand into booked jobs, appointments, and scheduled next steps faster.' },
  { icon: Database, title: 'Organised Customer Details', desc: 'Keeps contact details, notes, and follow-up needs clear for your team.' },
  { icon: MessageSquareText, title: 'Secure Signup', desc: 'Guides ready Starter and Growth buyers toward secure checkout after they confirm.' },
  { icon: PhoneForwarded, title: 'Setup Underway', desc: 'Once payment is complete, your setup details are prepared so we can begin.' },
];

export default function ServicesPreview() {
  return (
    <section className="site-section">
      <div className="site-container">
        <div className="site-section-head site-section-head-center">
          <p className="site-kicker">Core features</p>
          <h2>AI that answers, qualifies, follows up, and helps buyers start.</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <article key={card.title} className="site-card min-h-[15.5rem] p-5 sm:p-6">
              <span className="site-icon">
                <card.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="site-card-title mt-6">{card.title}</h3>
              <p className="site-card-copy mt-3">{card.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
