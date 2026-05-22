import { Link } from 'react-router-dom';
import { BarChart3, BookOpen, BriefcaseBusiness, ClipboardList, DollarSign, FileText, HelpCircle, Image, Inbox, Layers, LifeBuoy, MessageSquareQuote, Navigation, Rocket, Search, Settings, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const modules = [
  { title: 'Action Inbox', desc: 'Urgent conversations, replies and escalations.', href: '/ActionInbox', icon: Inbox },
  { title: 'Leads', desc: 'Pipeline, lead detail and follow-up control.', href: '/LeadDashboard', icon: BarChart3 },
  { title: 'Clients', desc: 'Client records, workspaces and account status.', href: '/ClientManager', icon: BriefcaseBusiness },
  { title: 'Onboarding', desc: 'Build progress, intake and go-live readiness.', href: '/Onboarding', icon: Rocket },
  { title: 'Support', desc: 'Client and website support threads.', href: '/SupportInbox', icon: LifeBuoy },
  { title: 'Content Studio', desc: 'Generate drafts for blogs, ads, emails and social posts.', href: '/admin/marketing/content-studio', icon: Sparkles },
  { title: 'Landing Pages', desc: 'Build campaign and offer pages with public URLs.', href: '/admin/marketing/landing-pages', icon: Layers },
  { title: 'Pricing Manager', desc: 'Control plans, fees, inclusions and Stripe mapping.', href: '/admin/marketing/pricing', icon: DollarSign },
  { title: 'Social Proof', desc: 'Manage testimonials, case studies and proof metrics.', href: '/admin/marketing/social-proof', icon: MessageSquareQuote },
  { title: 'FAQ Manager', desc: 'Manage sales objections, pricing answers and SEO FAQs.', href: '/admin/marketing/faqs', icon: HelpCircle },
  { title: 'Navigation', desc: 'Control header, footer, CTA and menu links.', href: '/admin/marketing/navigation', icon: Navigation },
  { title: 'Form Builder', desc: 'Control lead forms, fields and routing logic.', href: '/admin/marketing/forms', icon: ClipboardList },
  { title: 'Blog Manager', desc: 'Create, edit and publish SEO blog posts.', href: '/admin/marketing/blog', icon: BookOpen },
  { title: 'Content Manager', desc: 'Manage editable website copy blocks.', href: '/admin/marketing/content', icon: FileText },
  { title: 'Media Library', desc: 'Manage image and file URLs for content and campaigns.', href: '/admin/marketing/media', icon: Image },
  { title: 'Site Settings', desc: 'Global business, CTA and contact settings.', href: '/admin/marketing/site-settings', icon: SlidersHorizontal },
  { title: 'SEO Dashboard', desc: 'Search strategy and optimisation tasks.', href: '/admin/marketing/seo-dashboard', icon: Search },
  { title: 'Campaigns', desc: 'Marketing campaigns and outbound content.', href: '/admin/marketing/campaigns', icon: ClipboardList },
  { title: 'System Readiness', desc: 'Launch checks, config and operational status.', href: '/SystemReadiness', icon: Settings },
];

export default function AdminHome() {
  return (
    <div className="space-y-8 text-slate-950">
      <div className="admin-card p-8">
        <p className="admin-kicker">AssistantAI Backend</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Control Centre</h1>
        <p className="admin-muted mt-4 max-w-3xl">Manage leads, clients, onboarding, forms, offers, navigation, FAQs, social proof, content, media, landing pages, blog posts, SEO, campaigns and launch readiness from one internal workspace.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.href} to={module.href}>
              <Card className="admin-card h-full transition">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-950">{module.title}</h2>
                  <p className="admin-muted mt-2 text-sm leading-relaxed">{module.desc}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}