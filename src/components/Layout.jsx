import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import CrispChat from './chat/CrispChat';
import SiteAnalyticsTracker from './analytics/SiteAnalyticsTracker';

const navLinks = [
  { label: 'Services', path: '/Services' },
  { label: 'Industries', path: '/Industries' },
  { label: 'Integrations', path: '/Integrations' },
  { label: 'Pricing', path: '/Pricing' },
  { label: 'Case Studies', path: '/CaseStudies' },
  { label: 'Contact', path: '/Contact' },
];

const footerCompanyLinks = [
  { label: 'Home', path: '/' },
  ...navLinks,
  { label: 'Resources', path: '/Resources' },
  { label: 'Blog', path: '/Blog' },
  { label: 'About', path: '/About' },
];

const footerSolutionLinks = [
  { label: 'AI Receptionist Australia', path: '/ai-receptionist-australia' },
  { label: 'AI Phone Assistant', path: '/ai-phone-assistant-small-business' },
  { label: 'Missed Call Automation', path: '/missed-call-automation-australia' },
  { label: 'Lead Follow-Up Automation', path: '/ai-lead-follow-up-automation' },
  { label: 'Appointment Booking AI', path: '/ai-appointment-booking-assistant' },
  { label: 'AI Receptionist for Trades', path: '/ai-receptionist-for-trades' },
];

const mobileNavLinks = [
  ...navLinks,
  { label: 'Client Login', path: '/ClientLogin' },
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-blue-200/[0.08] bg-[#060a12]/88 shadow-[0_10px_40px_rgba(2,7,18,0.28)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[88rem] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          to="/"
          className="flex min-h-11 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="AssistantAI home"
        >
          <img
            src="https://rygyswsngskbdpgeqloy.supabase.co/storage/v1/object/public/site-assets/logoai.png"
            alt="AssistantAI Logo"
            className="h-10 w-10"
          />
          <span className="text-xl font-semibold tracking-[-0.025em] text-white">AssistantAI</span>
        </Link>

        <div className="hidden min-[1101px]:flex flex-1 items-center justify-end gap-5 xl:gap-6">
          <div className="flex min-w-0 items-center gap-5 xl:gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return link.path.includes('#') ? (
                <a
                  key={link.path}
                  href={link.path}
                  className="text-sm font-medium whitespace-nowrap text-slate-300 transition-colors hover:text-[#7196ff]"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive ? 'text-[#7196ff]' : 'text-slate-300 hover:text-[#7196ff]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <Link
            to="/ClientLogin"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-blue-300/25 bg-blue-500/10 px-5 py-2.5 text-sm font-semibold text-blue-100 transition hover:border-blue-300/45 hover:bg-blue-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Client Login
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.035] text-white transition hover:border-blue-300/30 hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 min-[1101px]:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-blue-200/[0.08] bg-[#060a12]/98 shadow-2xl backdrop-blur-xl min-[1101px]:hidden">
          <div className="space-y-1 px-5 py-5 sm:px-8">
            {mobileNavLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return link.path.includes('#') ? (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-11 items-center rounded-xl px-3 text-base font-medium text-slate-300 hover:bg-blue-500/10 hover:text-blue-100"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex min-h-11 items-center rounded-xl px-3 text-base font-medium transition ${
                    isActive
                      ? 'bg-blue-500/10 text-[#7196ff]'
                      : 'text-slate-300 hover:bg-blue-500/10 hover:text-blue-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-blue-200/[0.08] bg-[#050912]">
      <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12 lg:grid-cols-5">
          <div className="md:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <img
                src="https://rygyswsngskbdpgeqloy.supabase.co/storage/v1/object/public/site-assets/logoai.png"
                alt="AssistantAI Logo"
                className="h-10 w-10"
              />
              <span className="text-xl font-semibold tracking-[-0.025em] text-white">AssistantAI</span>
            </div>
            <p className="max-w-md text-base leading-7 text-slate-300">
              Premium AI reception and follow-up for Australian service businesses, designed to answer calls, capture enquiries, reduce admin, and help more leads become paying clients.
            </p>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-400">
              Built for trades, clinics, real estate, law firms, and service businesses across Australia.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.1em] text-blue-200">Company</h4>
            <div className="space-y-3">
              {footerCompanyLinks.map((link) =>
                link.path.includes('#') ? (
                  <a key={link.path} href={link.path} className="block text-sm text-slate-400 transition hover:text-[#7196ff]">
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.path} to={link.path} className="block text-sm text-slate-400 transition hover:text-[#7196ff]">
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.1em] text-blue-200">Solutions</h4>
            <div className="space-y-3">
              {footerSolutionLinks.map((link) => (
                <Link key={link.path} to={link.path} className="block text-sm text-slate-400 transition hover:text-[#7196ff]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.1em] text-blue-200">Contact</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <a href="mailto:sales@assistantai.com.au" className="block text-base transition hover:text-[#7196ff]">
                sales@assistantai.com.au
              </a>
              <Link to="/Platform" className="block text-base transition hover:text-[#7196ff]">Platform Preview</Link>
              <Link to="/Resources" className="block text-base transition hover:text-[#7196ff]">AI Receptionist Resources</Link>
              <Link to="/ClientLogin" className="block transition hover:text-[#7196ff]">Client Login</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-blue-200/[0.08] pt-8 text-center">
          <p className="text-sm text-slate-500">© 2026 AssistantAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="public-site min-h-screen bg-[#060a12] text-white">
      <SiteAnalyticsTracker />
      <Navbar />
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer />
      <CrispChat />
    </div>
  );
}
