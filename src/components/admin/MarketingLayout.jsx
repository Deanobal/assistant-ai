import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, Mail, Settings, Menu, X } from 'lucide-react';

export default function MarketingLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'SEO Dashboard', path: '/admin/marketing/seo-dashboard', icon: BarChart3 },
    { label: 'Campaigns', path: '/admin/marketing/campaigns', icon: Mail },
    { label: 'Settings', path: '/admin/marketing/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#06080d]">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white/[0.05] border border-white/10 text-white hover:bg-white/10"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-[#070a12] transition-transform duration-300 lg:translate-x-0 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white">Marketing Hub</h2>
            <p className="text-xs text-slate-500 mt-1">SEO & Campaigns</p>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-cyan-500/10 border border-cyan-400/20 text-cyan-400'
                      : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-white/10">
            <a
              href="/Dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-white transition-colors text-sm"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <div className="border-b border-white/10 bg-[#070a12]/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="px-6 py-4 lg:px-8">
            <h1 className="text-xl font-bold text-white">Marketing Hub</h1>
            <p className="text-sm text-slate-400 mt-1">Manage your SEO strategy and marketing campaigns</p>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}