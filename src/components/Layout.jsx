import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import CrispChat from './chat/CrispChat';

const navLinks = [
{ label: 'Home', path: '/' },
{ label: 'Services', path: '/Services' },
{ label: 'Demo', path: '/AIDemo' },
{ label: 'Integrations', path: '/Integrations' },
{ label: 'Pricing', path: '/Pricing' },
{ label: 'Blog', path: '/Blog' },
{ label: 'Case Studies', path: '/CaseStudies' },
{ label: 'About', path: '/About' },
{ label: 'Contact', path: '/Contact' }];

const mobileNavLinks = [
  ...navLinks,
  { label: 'Client Login', path: '/ClientLogin' }
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b3622e4aaa6acc06c2547f/161e273df_FuturisticAIneuralnetworklogo.png"
            alt="AssistantAI Logo"
            className="w-9 h-9" />

          <span className="text-white text-xl font-semibold tracking-tight">AssistantAI</span>
        </Link>

        <div className="hidden md:flex items-center justify-end gap-6 flex-1 min-w-0">
          <div className="flex items-center gap-6 min-w-0">
            {navLinks.map((link) =>
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium whitespace-nowrap transition-colors ${
              location.pathname === link.path ?
              'text-cyan-400' :
              'text-gray-400 hover:text-cyan-400'}`
              }>

                {link.label}
              </Link>
            )}
          </div>

          <Link
            to="/ClientLogin"
            className="shrink-0 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20 hover:text-white">

            Client Login
          </Link>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}>

          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen &&
        <div className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5">

            <div className="px-6 py-4 space-y-3">
              {mobileNavLinks.map((link) =>
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-sm font-medium ${
              location.pathname === link.path ? 'text-cyan-400' : 'text-gray-400'}`
              }>

                  {link.label}
                </Link>
            )}
            </div>
          </div>
        }
    </nav>);

}

function Footer() {
  return (
    <footer className="bg-[#070710] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b3622e4aaa6acc06c2547f/161e273df_FuturisticAIneuralnetworklogo.png"
                alt="AssistantAI Logo"
                className="w-9 h-9" />

              <span className="text-white font-semibold text-lg">AssistantAI</span>
            </div>
            <p className="max-w-sm text-base leading-7 text-gray-500">Premium AI automation for Australian service businesses, designed to answer calls, capture leads, sync systems, and automate follow-up with a more productised service experience.

            </p>
            <p className="mt-4 text-base leading-7 text-gray-600">Built for trades, clinics, real estate, law firms, and service businesses across Australia.</p>
          </div>

          <div>
            <h4 className="text-white font-medium text-sm mb-4">Company</h4>
            <div className="space-y-2.5">
              {navLinks.map((link) =>
              <Link key={link.path} to={link.path} className="block text-gray-500 text-sm hover:text-cyan-400 transition-colors">
                  {link.label}
                </Link>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium text-sm mb-4">Contact</h4>
            <div className="space-y-2.5 text-gray-500 text-sm">
              <p className="text-base">sales@assistantai.com.au</p>
              <Link to="/Platform" className="text-base block hover:text-cyan-400 transition-colors">Platform Preview</Link>
              <Link to="/ClientLogin" className="block hover:text-cyan-400 transition-colors">Client Login</Link>
              <Link to="/Dashboard" className="block hover:text-cyan-400 transition-colors">Admin Login</Link>
              <div className="flex gap-3 pt-2">
                <span className="text-gray-600 hover:text-cyan-400 transition-colors cursor-pointer">LinkedIn</span>
                <span className="text-gray-600 hover:text-cyan-400 transition-colors cursor-pointer">Facebook</span>
                <span className="text-gray-600 hover:text-cyan-400 transition-colors cursor-pointer">Instagram</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 text-center">
          <p className="text-gray-600 text-sm">© 2026 AssistantAI. All rights reserved.</p>
        </div>
      </div>
    </footer>);

}

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
      <CrispChat />
    </div>);

}