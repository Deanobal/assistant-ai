const faqs = [
  {
    question: 'What does AssistantAI do for service businesses?',
    answer: 'AssistantAI provides an AI receptionist that answers calls, captures enquiries, supports bookings and helps Australian service businesses follow up faster.',
  },
  {
    question: 'Can it handle calls outside business hours?',
    answer: 'Yes. It can provide consistent first-response coverage after hours, capture the caller’s details and prepare the right next action for your team.',
  },
  {
    question: 'Does it replace our team?',
    answer: 'No. AssistantAI handles repetitive first response and structured capture. Urgent, sensitive or complex enquiries can be escalated to a person.',
  },
  {
    question: 'Can it connect to our existing systems?',
    answer: 'AssistantAI can be configured around calendars, CRM workflows, payments, SMS and email tools depending on your plan and implementation requirements.',
  },
];

export default function PremiumFAQSection() {
  return (
    <section id="faq" className="aai-deferred-section scroll-mt-20 bg-[#030812] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:px-12">
        <div>
          <h2 className="text-4xl font-[700] leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl">Questions, answered clearly.</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-[#aab4c3]">The practical details Australian service businesses usually want to know before they start.</p>
        </div>
        <div className="divide-y divide-[#263348] border-y border-[#263348]">
          {faqs.map((faq, index) => (
            <details key={faq.question} className="group py-5" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b8cff] sm:text-lg">
                {faq.question}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#314058] text-[#7faaff] transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="max-w-2xl pb-1 pt-4 text-sm leading-7 text-[#aab4c3] sm:text-base">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
