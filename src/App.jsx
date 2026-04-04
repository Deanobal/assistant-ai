import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import Industries from './pages/Industries';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import BookStrategyCall from './pages/BookStrategyCall';
import GetStartedNow from './pages/GetStartedNow';
import CaseStudies from './pages/CaseStudies';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Integrations from './pages/Integrations';
import Platform from './pages/Platform';
import AIDemo from './pages/AIDemo';
import ClientLogin from './pages/ClientLogin';
import ClientPortal from './pages/ClientPortal';
import ThankYou from './pages/ThankYou';
import Dashboard from './pages/Dashboard';
import ClientManager from './pages/ClientManager';
import ClientWorkspace from './pages/ClientWorkspace';
import LeadDashboard from './pages/LeadDashboard';
import LeadDetail from './pages/LeadDetail';
import OnboardingDashboard from './pages/OnboardingDashboard';
import OnboardingIntake from './pages/OnboardingIntake';
import TeamAccess from './pages/TeamAccess';
import SystemReadiness from './pages/SystemReadiness';
import SupportInbox from './pages/SupportInbox';
import ActionInbox from './pages/ActionInbox';
import UnmatchedSmsInbox from './pages/UnmatchedSmsInbox';
import AdminLayout from './components/admin/AdminLayout';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Navigate to="/" replace />} />
        <Route path="/Services" element={<Services />} />
        <Route path="/Industries" element={<Industries />} />
        <Route path="/Pricing" element={<Pricing />} />
        <Route path="/About" element={<About />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/BookStrategyCall" element={<BookStrategyCall />} />
        <Route path="/GetStartedNow" element={<GetStartedNow />} />
        <Route path="/CaseStudies" element={<CaseStudies />} />
        <Route path="/Blog" element={<Blog />} />
        <Route path="/Blog/:slug" element={<BlogPost />} />
        <Route path="/Integrations" element={<Integrations />} />
        <Route path="/Platform" element={<Platform />} />
        <Route path="/AIDemo" element={<AIDemo />} />
        <Route path="/ClientLogin" element={<ClientLogin />} />
        <Route path="/ClientPortal" element={<ClientPortal />} />
        <Route path="/thank-you" element={<ThankYou />} />
      </Route>
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route element={<AdminLayout />}>
        <Route path="/ActionInbox" element={<ActionInbox />} />
        <Route path="/LeadDashboard" element={<LeadDashboard />} />
        <Route path="/LeadDetail" element={<LeadDetail />} />
        <Route path="/ClientManager" element={<ClientManager />} />
        <Route path="/ClientWorkspace" element={<ClientWorkspace />} />
        <Route path="/Onboarding" element={<OnboardingDashboard />} />
        <Route path="/OnboardingIntake" element={<OnboardingIntake />} />
        <Route path="/SupportInbox" element={<SupportInbox />} />
        <Route path="/UnmatchedSmsInbox" element={<UnmatchedSmsInbox />} />
        <Route path="/TeamAccess" element={<TeamAccess />} />
        <Route path="/SystemReadiness" element={<SystemReadiness />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App