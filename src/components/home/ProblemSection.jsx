import { PhoneMissed, Clock3, Users, ArrowRightCircle } from 'lucide-react';

const problems = [
  {
    icon: PhoneMissed,
    text: 'Missed calls become lost revenue.',
  },
  {
    icon: Clock3,
    text: 'Follow-up gets delayed.',
  },
  {
    icon: Users,
    text: 'Admin staff cannot answer every enquiry.',
  },
  {
    icon: ArrowRightCircle,
    text: 'Good prospects choose the faster competitor.',
  },
];

export default function ProblemSection() {
  return (
    <section className="relative overflow-hidden border-y border-blue-200/[0.07] bg-[#060a12] py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(43,94,255,0.08),transparent_30rem)]" />

      <div className="relative mx-auto max-w-[88rem] px-5 sm:px-8 lg:px-10">
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="max-w-2xl text-center lg:text-left">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#7096ff]">
              What problem we solve
            </p>
            <h2 className="text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-4xl md:text-5xl">
              Most businesses are not losing leads because demand is weak. They are losing them because no one responds fast enough.
            </h2>
          </div>

          <div className="rounded-[28px] border border-blue-200/[0.13] bg-[linear-gradient(145deg,rgba(8,13,23,0.98),rgba(10,18,32,0.96))] p-4 shadow-[0_26px_80px_rgba(0,0,0,0.28)] sm:p-6 md:p-7">
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              {problems.map((item) => (
                <article
                  key={item.text}
                  className="group min-h-[150px] rounded-2xl border border-blue-200/[0.11] bg-[#080d17] p-5 transition duration-200 hover:border-blue-300/[0.24] hover:bg-[#0a1220]"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-300/[0.18] bg-[linear-gradient(145deg,rgba(82,118,255,0.14),rgba(18,30,51,0.9))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_12px_28px_rgba(0,0,0,0.2)]">
                    <item.icon
                      className="h-5 w-5 text-[#a9c0ff] drop-shadow-[0_0_10px_rgba(113,150,255,0.24)]"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-lg font-semibold leading-7 tracking-[-0.02em] text-white">{item.text}</p>
                </article>
              ))}
            </div>

            <p className="mt-6 text-base leading-7 text-slate-300">
              AssistantAI fixes that with a done-for-you AI receptionist and automation system built for Australian businesses.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
