import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, AudioLines, Menu, X } from 'lucide-react';
import CrispChat from './chat/CrispChat';
import SiteAnalyticsTracker from './analytics/SiteAnalyticsTracker';

const navLinks = [
  { label: 'Services', path: '/Services' },
  { label: 'Industries', path: '/Industries' },
  { label: 'Integrations', path: '/Integrations' },
  { label: 'Pricing', path: '/Pricing' },
  { label: 'Case Studies', path: '/CaseStudies' },
];

const footerColumns = [
  {
    heading: 'Company',
    links: [
      { label: 'About', path: '/About' },
      { label: 'Case Studies', path: '/CaseStudies' },
      { label: 'Contact', path: '/Contact' },
      { label: 'Client Login', path: '/ClientLogin' },
    ],
  },
  {
    heading: 'Solutions',
    links: [
      { label: 'AI Receptionist Australia', path: '/ai-receptionist-australia' },
      { label: 'Missed Call Automation', path: '/missed-call-automation-australia' },
      { label: 'Appointment Booking AI', path: '/ai-appointment-booking-assistant' },
      { label: 'AI Receptionist for Trades', path: '/ai-receptionist-for-trades' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Services', path: '/Services' },
      { label: 'Industries', path: '/Industries' },
      { label: 'Integrations', path: '/Integrations' },
      { label: 'Blog', path: '/Blog' },
    ],
  },
];

function Brand({ compact = false }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="AssistantAI home">
      <span className={`flex shrink-0 items-center justify-center rounded-full bg-[#1f6fff] text-white shadow-[0_0_24px_rgba(31,111,255,0.28)] ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}>
        <AudioLines className={compact ? 'h-4 w-4' : 'h-[18px] w-[18px]'} strokeWidth={2.3} aria-hidden="true" />
      </span>
      <span className={`${compact ? 'text-lg' : 'text-xl'} font-[680] tracking-[-0.035em] text-white`}>
        Assistant<span className="text-[#4b8cff]">AI</span>
      </span>
    </Link>
  );
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#172235] bg-[#030812]/86 backdrop-blur-xl">
      <nav className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16" aria-label="Primary navigation">
        <Brand />

        <div className="hidden items-center gap-7 lg:flex xl:gap-9">
          {navLinks.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold transition ${active ? 'text-white' : 'text-[#aab4c3] hover:text-white'}`}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/ClientLogin"
            className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[#465267] bg-[#07101b] px-5 text-sm font-semibold text-white transition hover:border-[#6a778a] hover:bg-[#0c1724] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b8cff]"
          >
            Client Login
          </Link>
          <Link
            to="/GetStartedNow"
            className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[#347cff] bg-[#0b4dbb] px-5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(31,111,255,0.25)] transition hover:bg-[#0a45aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7faaff]"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#354258] text-white transition hover:bg-[#0b1725] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b8cff] lg:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen ? (
        <div id="mobile-navigation" className="border-t border-[#172235] bg-[#030812]/98 px-5 py-5 shadow-2xl lg:hidden">
          <div className="mx-auto max-w-lg space-y-1">
            {[...navLinks, { label: 'Contact', path: '/Contact' }, { label: 'Client Login', path: '/ClientLogin' }].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex min-h-12 items-center justify-between rounded-[10px] px-4 text-sm font-semibold transition ${location.pathname === link.path ? 'bg-[#0b1e38] text-[#76a7ff]' : 'text-[#c1cad5] hover:bg-[#091522] hover:text-white'}`}
              >
                {link.label}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ))}
            <Link to="/GetStartedNow" className="mt-3 flex min-h-12 items-center justify-center rounded-[10px] border border-[#347cff] bg-[#0b4dbb] px-5 text-sm font-semibold text-white">Get Started</Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#1c2939] bg-[#020711]">
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.95fr_0.75fr_1fr]">
          <div>
            <Brand compact />
            <p className="mt-5 max-w-xs text-sm leading-7 text-[#9ea9b7]">AI reception and follow-up for Australian service businesses.</p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.heading}>
              <h2 className="text-sm font-semibold text-white">{column.heading}</h2>
              <ul className="mt-5 space-y-3.5">
                {column.links.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-sm text-[#9ea9b7] transition hover:text-white">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="text-sm font-semibold text-white">Contact</h2>
            <a href="mailto:sales@assistantai.com.au" className="mt-5 block break-all text-sm text-[#9ea9b7] transition hover:text-white">sales@assistantai.com.au</a>
            <p className="mt-4 text-sm leading-6 text-[#9ea9b7]">Australia-wide implementation and support.</p>
          </div>
        </div>

        <div className="mt-12 border-t border-[#1c2939] pt-7 text-sm text-[#94a1b1]">© 2026 AssistantAI. All rights reserved.</div>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="public-site min-h-screen bg-[#030812] text-white">
      <SiteAnalyticsTracker />
      <Navbar />
      <main className="pt-[72px]">
        <Outlet />
      </main>
      <Footer />
      <CrispChat />
    </div>
  );
}
