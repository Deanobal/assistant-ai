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
    <section className="relative py-18 md:py-24 bg-[#0c0c14]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-start">
          <div>
            <p className="text-cyan-400 mb-3 text-lg font-medium">WHAT PROBLEM WE SOLVE</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              Most businesses are not losing leads because demand is weak. They are losing them because no one responds fast enough.
            </h2>
          </div>

          <div className="rounded-[28px] border border-white/5 bg-[#12121a] p-6 md:p-7">
            <div className="grid sm:grid-cols-2 gap-4">
              {problems.map((item) => (
                <div key={item.text} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-3">
                    <item.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <p className="text-white leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-gray-400 leading-relaxed">
              AssistantAI fixes that with a done-for-you AI receptionist and automation system built for Australian businesses.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}