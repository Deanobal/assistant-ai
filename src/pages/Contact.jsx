import { Clock3, Mail, MapPin, PhoneCall } from 'lucide-react';
import SEO from '../components/SEO';
import ContactForm from '@/components/contact/ContactForm';
import {
  AccentText,
  PageShell,
  Section,
  premiumButtonSecondary,
} from '@/components/marketing/PremiumMarketing';
import { Link } from 'react-router-dom';

export default function Contact() {
  return (
    <>
      <SEO
        title="Contact | Talk to AssistantAI"
        description="Contact AssistantAI to discuss AI receptionist setup, missed-call coverage, booking support and follow-up for your Australian service business."
        canonicalPath="/Contact"
      />
      <PageShell>
        <Section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(31,111,255,0.13),transparent_32%)]" />
          <div className="relative grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
            <div className="lg:pt-7">
              <h1 className="text-balance text-[2.75rem] font-[720] leading-[1.02] tracking-[-0.052em] text-white sm:text-[3.7rem] lg:text-[4.15rem]">
                Let’s improve the way your business <AccentText>handles calls.</AccentText>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-[#aeb8c6] sm:text-lg">
                Tell us how calls, bookings and follow-up work today. We’ll help you identify the right AssistantAI setup and a practical next step.
              </p>

              <div className="mt-9 space-y-5 border-y border-[#1d2b3e] py-7">
                {[
                  { icon: MapPin, label: 'Australia-wide implementation and support' },
                  { icon: Clock3, label: 'Clear response and next-step communication' },
                  { icon: PhoneCall, label: 'Live AI receptionist demo available' },
                  { icon: Mail, label: 'sales@assistantai.com.au' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-[#c2cbd6]">
                    <Icon className="h-4 w-4 shrink-0 text-[#4b8cff]" aria-hidden="true" />
                    {label}
                  </div>
                ))}
              </div>

              <Link to="/AIDemo" className={`${premiumButtonSecondary} mt-7`}>
                Talk to Our AI Receptionist
                <PhoneCall className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div>
              <div className="mb-5">
                <p className="text-sm font-semibold text-[#76a7ff]">Tell us about your business</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">Start the conversation</h2>
              </div>
              <ContactForm />
            </div>
          </div>
        </Section>
      </PageShell>
    </>
  );
}
