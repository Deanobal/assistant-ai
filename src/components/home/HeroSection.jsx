import {
  AudioLines,
  CalendarCheck2,
  Check,
  ClipboardCheck,
  ContactRound,
  MapPin,
  Phone,
  Play,
  Send,
} from 'lucide-react';
import VapiReceptionistDemoButton from '@/components/voice/VapiReceptionistDemoButton';

const callSteps = [
  { label: 'Incoming call', time: '02:37', icon: Phone, active: true },
  { label: 'Contact captured', time: '02:38', icon: ContactRound },
  { label: 'Enquiry qualified', time: '02:41', icon: ClipboardCheck },
  { label: 'Booking requested', time: '02:45', icon: CalendarCheck2 },
  { label: 'Follow-up queued', time: '02:46', icon: Send },
];

const waveform = [8, 15, 11, 24, 17, 31, 13, 21, 38, 19, 13, 28, 46, 25, 16, 34, 21, 14, 29, 19, 10, 24, 14, 8];
const integrations = ['HighLevel', 'Google Calendar', 'Stripe', 'Twilio', 'Resend'];

function Waveform({ compact = false }) {
  return (
    <div className={`flex items-center gap-1 ${compact ? 'h-7' : 'h-12'} overflow-hidden`} aria-hidden="true">
      {waveform.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className="aai-wave-bar w-0.5 shrink-0 rounded-full bg-[#2f7cff] sm:w-1"
          style={{ height: `${compact ? Math.max(6, height * 0.62) : height}px`, animationDelay: `${index * 45}ms` }}
        />
      ))}
    </div>
  );
}

function LiveCallWorkspace() {
  return (
    <div className="relative mx-auto w-full max-w-[690px]">
      <div className="absolute -inset-10 -z-10 bg-[radial-gradient(circle,rgba(36,112,255,0.14),transparent_62%)] blur-2xl" />
      <div className="overflow-hidden rounded-[20px] border border-[#28364a] bg-[#07111d]/96 shadow-[0_32px_90px_rgba(0,0,0,0.46)]">
        <div className="flex items-center justify-between border-b border-[#1d2a3c] px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-white sm:text-base">Live call workspace</p>
            <p className="mt-1 text-xs text-[#94a1b1]">Example customer journey</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#d8ffe8]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            Live
          </div>
        </div>

        <div className="m-3 flex items-center gap-3 rounded-[14px] border border-[#1d2d42] bg-[#0a1726] px-4 py-3 sm:m-5 sm:px-5 sm:py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2859a6] bg-[#102d5a] text-[#4b8cff] sm:h-12 sm:w-12">
            <Phone className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Call in progress</p>
            <p className="text-xs text-[#9aa8b8]">02:37</p>
          </div>
          <div className="ml-auto hidden min-w-0 max-w-[52%] sm:block">
            <Waveform compact />
          </div>
        </div>

        <div className="grid gap-3 p-3 pt-0 sm:p-5 sm:pt-0 xl:grid-cols-[0.86fr_1.14fr]">
          <div className="space-y-2.5">
            {callSteps.map(({ label, time, icon: Icon, active }) => (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-[13px] border px-3 py-3 transition-colors ${active ? 'border-[#296fd9] bg-[#0b203c]' : 'border-[#1c2939] bg-[#09131f]'}`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${active ? 'bg-[#1768ec] text-white' : 'bg-[#112138] text-[#74a7ff]'}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="min-w-0 flex-1 text-sm font-medium text-white">{label}</span>
                <span className="text-[11px] text-[#94a1b1]">{time}</span>
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-[14px] border border-[#1c2939] bg-[#08121e] sm:block">
            <div className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-3 border-b border-[#1c2939] p-5 text-sm">
              <p className="col-span-2 mb-1 font-semibold text-white">Call details</p>
              <span className="text-[#94a1b1]">Caller</span><span className="text-white">Jane S.</span>
              <span className="text-[#94a1b1]">Service</span><span className="text-white">Plumbing</span>
              <span className="text-[#94a1b1]">Location</span>
              <span className="flex items-center gap-1.5 text-white"><MapPin className="h-3.5 w-3.5 text-[#4f8cff]" /> Brisbane</span>
            </div>
            <div className="border-b border-[#1c2939] p-5">
              <p className="flex items-center gap-2 text-xs font-semibold text-[#6edfe7]"><AudioLines className="h-4 w-4" /> Live transcript</p>
              <p className="mt-3 text-sm leading-6 text-[#c4ccd6]">“I need a plumber for a leaking tap and I’m available tomorrow morning.”</p>
            </div>
            <div className="p-5">
              <p className="flex items-center gap-2 text-xs font-semibold text-[#7ff0b2]"><Check className="h-4 w-4" /> Smart summary</p>
              <p className="mt-3 text-sm leading-6 text-[#c4ccd6]">Leaking tap · Brisbane · booking requested · morning preferred</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-[#142033] bg-[#030812]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(30,107,255,0.10),transparent_36%)]" />
      <div className="relative mx-auto max-w-[1440px] px-5 pb-8 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pb-10 lg:pt-20 xl:px-16">
        <div className="grid items-center gap-12 lg:min-h-[650px] lg:grid-cols-2 lg:gap-12 xl:gap-14">
          <div className="max-w-[660px]">
            <h1 className="text-balance text-[2.85rem] font-[720] leading-[0.98] tracking-[-0.055em] text-white sm:text-[4rem] lg:text-[4.15rem] xl:text-[4.45rem]">
              AI Receptionist for Australian <span className="text-[#347cff]">Service</span> Businesses
            </h1>
            <p className="mt-7 text-xl font-semibold tracking-[-0.02em] text-[#d7dde6] sm:text-2xl">Turn every call into a customer.</p>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#aab4c3] sm:text-lg sm:leading-8">
              Answer calls, qualify enquiries, support bookings and follow up — 24/7.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start">
              <VapiReceptionistDemoButton className="w-full sm:w-auto" showFallbackText />
              <a
                href="#how-it-works"
                className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-[12px] border border-[#3b4657] bg-[#07101b] px-6 py-4 text-sm font-semibold text-white transition hover:border-[#617086] hover:bg-[#0b1624] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b8cff]"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                See how it works
              </a>
            </div>

            <p className="mt-6 flex items-center gap-2.5 text-sm text-[#aeb8c5]">
              <MapPin className="h-4 w-4 text-[#4b8cff]" aria-hidden="true" />
              Built for Australian service businesses
            </p>
          </div>

          <div className="lg:-translate-y-5">
            <LiveCallWorkspace />
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-[18px] border border-[#253246] bg-[#07111d]/75 lg:mt-4">
          <p className="border-b border-[#1c2939] px-5 py-3 text-center text-xs font-medium text-[#94a1b1]">Works with the tools you already use</p>
          <div className="grid grid-cols-2 sm:grid-cols-5">
            {integrations.map((integration, index) => (
              <div
                key={integration}
                className={`flex min-h-16 items-center justify-center px-4 text-center text-sm font-semibold tracking-[-0.02em] text-[#c5ced9] ${index ? 'border-l border-[#1c2939]' : ''} ${index === integrations.length - 1 ? 'col-span-2 border-t border-[#1c2939] sm:col-span-1 sm:border-t-0' : ''}`}
              >
                {integration}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
