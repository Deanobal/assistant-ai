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
    <section className="relative bg-[#0c0c14] py-14 sm:py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <div className="text-center lg:text-left">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-cyan-400 sm:text-base lg:text-lg">WHAT PROBLEM WE SOLVE</p>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-4xl">
              Most businesses are not losing leads because demand is weak. They are losing them because no one responds fast enough.
            </h2>
          </div>

          <div className="rounded-[24px] border border-white/5 bg-[#12121a] p-4 sm:rounded-[28px] sm:p-6 md:p-7">
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              {problems.map((item) => (
                <div key={item.text} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 sm:min-h-[132px]">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                    <item.icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <p className="text-base leading-relaxed text-white sm:text-[1.05rem]">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-gray-400 sm:mt-6 sm:text-base">
              AssistantAI fixes that with a done-for-you AI receptionist and automation system built for Australian businesses.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
