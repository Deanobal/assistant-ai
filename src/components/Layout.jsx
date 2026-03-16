import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', path: '/Home' },
  { label: 'Services', path: '/Services' },
  { label: 'Integrations', path: '/Integrations' },
  { label: 'Pricing', path: '/Pricing' },
  { label: 'Case Studies', path: '/CaseStudies' },
  { label: 'About', path: '/About' },
  { label: 'Contact', path: '/Contact' },
  { label: 'Client Login', path: '/ClientLogin' },
];
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <Link to="/Home" className="flex items-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b3622e4aaa6acc06c2547f/161e273df_FuturisticAIneuralnetworklogo.png" 
            alt="Assistant AI Logo" 
            className="w-9 h-9"
          />
          <span className="text-white font-semibold text-lg tracking-tight">AssistantAI.com.au</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? 'text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          <Link
            to="/Contact"
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
          >
            Book Demo
          </Link>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5"
          >
            <div className="px-6 py-4 space-y-3">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-2 text-sm font-medium ${
                    location.pathname === link.path ? 'text-cyan-400' : 'text-gray-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/Contact"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-full mt-3"
              >
                Book Demo
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-[#070710] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b3622e4aaa6acc06c2547f/161e273df_FuturisticAIneuralnetworklogo.png" 
                alt="Assistant AI Logo" 
                className="w-9 h-9"
              />
              <span className="text-white font-semibold text-lg">AssistantAI.com.au</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Premium AI automation for Australian service businesses, designed to answer calls, capture leads, sync systems, and automate follow-up with a more productised service experience.
            </p>
            <p className="text-gray-600 text-xs mt-4">Built for trades, clinics, real estate, law firms, and service businesses across Australia.</p>
          </div>

          <div>
            <h4 className="text-white font-medium text-sm mb-4">Company</h4>
            <div className="space-y-2.5">
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} className="block text-gray-500 text-sm hover:text-cyan-400 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium text-sm mb-4">Contact</h4>
            <div className="space-y-2.5 text-gray-500 text-sm">
              <p>sales@assistantai.com.au</p>
              <Link to="/Platform" className="block hover:text-cyan-400 transition-colors">Platform Preview</Link>
              <Link to="/ClientLogin" className="block hover:text-cyan-400 transition-colors">Client Login</Link>
              <div className="flex gap-3 pt-2">
                <span className="text-gray-600 hover:text-cyan-400 transition-colors cursor-pointer">LinkedIn</span>
                <span className="text-gray-600 hover:text-cyan-400 transition-colors cursor-pointer">Facebook</span>
                <span className="text-gray-600 hover:text-cyan-400 transition-colors cursor-pointer">Instagram</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 text-center">
          <p className="text-gray-600 text-xs">© 2026 AssistantAI.com.au. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}