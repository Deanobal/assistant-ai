import React, { lazy, Suspense, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import './styles/admin-shopify.css';
import PageNotFound from './lib/PageNotFound';
import Layout from './components/Layout';
import AdminSessionGate from './components/admin/AdminSessionGate';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import MarketingLayout from './components/admin/MarketingLayout';

const ClientLogin = lazy(() => import('./pages/ClientLogin'));
const ClientPortal = lazy(() => import('./pages/ClientPortal'));
const Services = lazy(() => import('./pages/Services'));
const Industries = lazy(() => import('./pages/Industries'));
const Pricing = lazy(() => import('./pages/Pricing'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const BookStrategyCall = lazy(() => import('./pages/BookStrategyCall'));
const GetStartedNow = lazy(() => import('./pages/GetStartedNow'));
const SecureSetup = lazy(() => import('./pages/SecureSetup'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const HighIntentSeoLanding = lazy(() => import('./pages/HighIntentSeoLanding'));
const AiAssistantAustralia = lazy(() => import('./pages/AiAssistantAustralia'));
const Integrations = lazy(() => import('./pages/Integrations'));
const Platform = lazy(() => import('./pages/Platform'));
const AIDemo = lazy(() => import('./pages/AIDemo'));
const Resources = lazy(() => import('./pages/Resources'));
const ThankYou = lazy(() => import('./pages/ThankYou'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminHome = lazy(() => import('./pages/AdminHome'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));
const ClientManager = lazy(() => import('./pages/ClientManager'));
const ClientConnectors = lazy(() => import('./pages/ClientConnectors'));
const ClientWorkspace = lazy(() => import('./pages/ClientWorkspace'));
const LeadDashboard = lazy(() => import('./pages/LeadDashboard'));
const LeadDetail = lazy(() => import('./pages/LeadDetail'));
const OnboardingDashboard = lazy(() => import('./pages/OnboardingDashboard'));
const OnboardingIntake = lazy(() => import('./pages/OnboardingIntake'));
const OnboardingSettings = lazy(() => import('./pages/OnboardingSettings'));
const TeamAccess = lazy(() => import('./pages/TeamAccess'));
const SystemReadiness = lazy(() => import('./pages/SystemReadiness'));
const SupportInbox = lazy(() => import('./pages/SupportInbox'));
const ActionInbox = lazy(() => import('./pages/ActionInbox'));
const UnmatchedSmsInbox = lazy(() => import('./pages/UnmatchedSmsInbox'));
const SeoDashboard = lazy(() => import('./pages/admin/marketing/SeoDashboard'));
const ContentStudio = lazy(() => import('./pages/admin/marketing/ContentStudio'));
const LandingPageBuilder = lazy(() => import('./pages/admin/marketing/LandingPageBuilder'));
const PricingManager = lazy(() => import('./pages/admin/marketing/PricingManager'));
const SocialProofManager = lazy(() => import('./pages/admin/marketing/SocialProofManager'));
const FaqManager = lazy(() => import('./pages/admin/marketing/FaqManager'));
const NavigationManager = lazy(() => import('./pages/admin/marketing/NavigationManager'));
const FormBuilder = lazy(() => import('./pages/admin/marketing/FormBuilder'));
const BlogManager = lazy(() => import('./pages/admin/marketing/BlogManager'));
const ContentManager = lazy(() => import('./pages/admin/marketing/ContentManager'));
const MediaLibrary = lazy(() => import('./pages/admin/marketing/MediaLibrary'));
const SiteSettings = lazy(() => import('./pages/admin/marketing/SiteSettings'));
const Campaigns = lazy(() => import('./pages/admin/marketing/Campaigns'));
const MarketingSettings = lazy(() => import('./pages/admin/marketing/Settings'));

function LazyRoute({ children }) {
  return <Suspense fallback={<div className="min-h-screen bg-[#07070d]" />}>{children}</Suspense>;
}

function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      let cancelled = false;
      let attempts = 0;

      const scrollToHash = () => {
        if (cancelled) return;
        const target = document.getElementById(hash.replace('#', ''));
        if (target) {
          target.scrollIntoView({ block: 'start', behavior: 'auto' });
          return;
        }

        attempts += 1;
        if (attempts < 120) window.requestAnimationFrame(scrollToHash);
      };

      window.requestAnimationFrame(scrollToHash);
      return () => {
        cancelled = true;
      };
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    return undefined;
  }, [pathname, search, hash]);

  return null;
}

function ProtectedMarketingLayout() {
  return (
    <AdminSessionGate>
      <MarketingLayout />
    </AdminSessionGate>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/Home" element={<Navigate to="/" replace />} />
              <Route path="/Services" element={<LazyRoute><Services /></LazyRoute>} />
              <Route path="/Industries" element={<LazyRoute><Industries /></LazyRoute>} />
              <Route path="/Pricing" element={<LazyRoute><Pricing /></LazyRoute>} />
              <Route path="/About" element={<LazyRoute><About /></LazyRoute>} />
              <Route path="/Contact" element={<LazyRoute><Contact /></LazyRoute>} />
              <Route path="/BookStrategyCall" element={<LazyRoute><BookStrategyCall /></LazyRoute>} />
              <Route path="/GetStartedNow" element={<LazyRoute><GetStartedNow /></LazyRoute>} />
              <Route path="/secure-setup" element={<LazyRoute><SecureSetup /></LazyRoute>} />
              <Route path="/secure-setup/:token" element={<LazyRoute><SecureSetup /></LazyRoute>} />
              <Route path="/CaseStudies" element={<LazyRoute><CaseStudies /></LazyRoute>} />
              <Route path="/Blog" element={<LazyRoute><Blog /></LazyRoute>} />
              <Route path="/Blog/:slug" element={<LazyRoute><BlogPost /></LazyRoute>} />
              <Route path="/lp/:slug" element={<LazyRoute><LandingPage /></LazyRoute>} />
              <Route path="/ai-assistant-australia" element={<LazyRoute><AiAssistantAustralia /></LazyRoute>} />
              <Route path="/:slug" element={<LazyRoute><HighIntentSeoLanding /></LazyRoute>} />
              <Route path="/Integrations" element={<LazyRoute><Integrations /></LazyRoute>} />
              <Route path="/Platform" element={<LazyRoute><Platform /></LazyRoute>} />
              <Route path="/AIDemo" element={<LazyRoute><AIDemo /></LazyRoute>} />
              <Route path="/Resources" element={<LazyRoute><Resources /></LazyRoute>} />
              <Route path="/ClientLogin" element={<LazyRoute><ClientLogin /></LazyRoute>} />
              <Route path="/ClientPortal" element={<LazyRoute><ClientPortal /></LazyRoute>} />
              <Route path="/thank-you" element={<LazyRoute><ThankYou /></LazyRoute>} />
            </Route>
            <Route path="/Dashboard" element={<LazyRoute><Dashboard /></LazyRoute>} />
            <Route path="/AdminLogin" element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<LazyRoute><AdminHome /></LazyRoute>} />
              <Route path="/Analytics" element={<LazyRoute><AnalyticsDashboard /></LazyRoute>} />
              <Route path="/ActionInbox" element={<LazyRoute><ActionInbox /></LazyRoute>} />
              <Route path="/LeadDashboard" element={<LazyRoute><LeadDashboard /></LazyRoute>} />
              <Route path="/LeadDetail" element={<LazyRoute><LeadDetail /></LazyRoute>} />
              <Route path="/ClientManager" element={<LazyRoute><ClientManager /></LazyRoute>} />
              <Route path="/ClientConnectors" element={<LazyRoute><ClientConnectors /></LazyRoute>} />
              <Route path="/ClientWorkspace" element={<LazyRoute><ClientWorkspace /></LazyRoute>} />
              <Route path="/Onboarding" element={<LazyRoute><OnboardingDashboard /></LazyRoute>} />
              <Route path="/OnboardingIntake" element={<LazyRoute><OnboardingIntake /></LazyRoute>} />
              <Route path="/OnboardingSettings" element={<LazyRoute><OnboardingSettings /></LazyRoute>} />
              <Route path="/SupportInbox" element={<LazyRoute><SupportInbox /></LazyRoute>} />
              <Route path="/UnmatchedSmsInbox" element={<LazyRoute><UnmatchedSmsInbox /></LazyRoute>} />
              <Route path="/TeamAccess" element={<LazyRoute><TeamAccess /></LazyRoute>} />
              <Route path="/SystemReadiness" element={<LazyRoute><SystemReadiness /></LazyRoute>} />
            </Route>
            <Route element={<ProtectedMarketingLayout />}>
              <Route path="/admin/marketing/seo-dashboard" element={<LazyRoute><SeoDashboard /></LazyRoute>} />
              <Route path="/admin/marketing/content-studio" element={<LazyRoute><ContentStudio /></LazyRoute>} />
              <Route path="/admin/marketing/landing-pages" element={<LazyRoute><LandingPageBuilder /></LazyRoute>} />
              <Route path="/admin/marketing/pricing" element={<LazyRoute><PricingManager /></LazyRoute>} />
              <Route path="/admin/marketing/social-proof" element={<LazyRoute><SocialProofManager /></LazyRoute>} />
              <Route path="/admin/marketing/faqs" element={<LazyRoute><FaqManager /></LazyRoute>} />
              <Route path="/admin/marketing/navigation" element={<LazyRoute><NavigationManager /></LazyRoute>} />
              <Route path="/admin/marketing/forms" element={<LazyRoute><FormBuilder /></LazyRoute>} />
              <Route path="/admin/marketing/blog" element={<LazyRoute><BlogManager /></LazyRoute>} />
              <Route path="/admin/marketing/content" element={<LazyRoute><ContentManager /></LazyRoute>} />
              <Route path="/admin/marketing/media" element={<LazyRoute><MediaLibrary /></LazyRoute>} />
              <Route path="/admin/marketing/site-settings" element={<LazyRoute><SiteSettings /></LazyRoute>} />
              <Route path="/admin/marketing/campaigns" element={<LazyRoute><Campaigns /></LazyRoute>} />
              <Route path="/admin/marketing/settings" element={<LazyRoute><MarketingSettings /></LazyRoute>} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
