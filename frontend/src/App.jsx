import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { LanguageProvider } from './context/LanguageContext';
import { CompareProvider } from './context/CompareContext';
import FloatingCompareBar from './components/common/FloatingCompareBar';
import PropertyCompareModal from './components/common/PropertyCompareModal';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layouts
import PublicLayout from './components/layouts/PublicLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import MapSearchPage from './pages/public/MapSearchPage';
import { BuyPage, RentPage, CommercialPage, ResidentialPage } from './pages/public/CategoryPages';
import PropertyDetailPage from './pages/public/PropertyDetailPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import WelcomePage from './pages/public/WelcomePage';
import SplashScreen from './components/entry/SplashScreen';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerProperties from './pages/owner/OwnerProperties';
import AddPropertyWizard from './pages/owner/AddPropertyWizard';
import AddEditProperty from './pages/owner/AddEditProperty';
import OwnerNotifications from './pages/owner/OwnerNotifications';

// Broker Pages
import BrokerDashboard from './pages/broker/BrokerDashboard';
import BrokerVerificationQueue from './pages/broker/BrokerVerificationQueue';
import BrokerProperties from './pages/broker/BrokerProperties';
import BrokerEnquiries from './pages/broker/BrokerEnquiries';
import BrokerVisits from './pages/broker/BrokerVisits';
import BrokerFollowups from './pages/broker/BrokerFollowups';
import BrokerDeals from './pages/broker/BrokerDeals';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import ClientRequirements from './pages/client/ClientRequirements';
import ClientEnquiries from './pages/client/ClientEnquiries';
import ClientVisits from './pages/client/ClientVisits';
import ClientFavorites from './pages/client/ClientFavorites';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProperties from './pages/admin/AdminProperties';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBrokers from './pages/admin/AdminBrokers';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminVisits from './pages/admin/AdminVisits';
import AdminDeals from './pages/admin/AdminDeals';
import AdminCommissions from './pages/admin/AdminCommissions';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

// Common
import ProfilePage from './pages/common/ProfilePage';

function RootEntryPoint() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#181A1F] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#C62828] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If already authenticated: redirect to their correct dashboard
  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  // If unauthenticated: show full-screen animated RedStone logo splash (~2s), then navigate to /welcome
  return (
    <SplashScreen
      standalone={true}
      duration={2000}
      onComplete={() => {
        navigate('/welcome', { replace: true });
      }}
    />
  );
}

function SplashRouteHandler() {
  const navigate = useNavigate();
  return (
    <SplashScreen
      standalone={true}
      duration={2000}
      onComplete={() => {
        navigate('/welcome', { replace: true });
      }}
    />
  );
}

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            <CompareProvider>
              <ErrorBoundary>
                <Routes>
                {/* Mandatory Authentication-First Entry Flow Routes */}
                <Route path="/" element={<RootEntryPoint />} />
                <Route path="/splash" element={<SplashRouteHandler />} />
                <Route path="/welcome" element={<WelcomePage />} />

                {/* Marketplace & Browsing (Authenticated) + Auth Pages */}
                <Route element={<PublicLayout />}>
                  <Route path="/marketplace" element={<HomePage />} />
                  <Route path="/map-search" element={<MapSearchPage />} />
                  <Route path="/buy" element={<BuyPage />} />
                  <Route path="/rent" element={<RentPage />} />
                  <Route path="/commercial" element={<CommercialPage />} />
                  <Route path="/residential" element={<ResidentialPage />} />
                  <Route path="/properties/:id" element={<PropertyDetailPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Owner Dashboard Routes */}
                <Route element={<ProtectedRoute allowedRoles={['owner', 'admin']} />}>
                  <Route path="/owner" element={<DashboardLayout />}>
                    <Route index element={<Navigate to="/owner/dashboard" replace />} />
                    <Route path="dashboard" element={<OwnerDashboard />} />
                    <Route path="properties" element={<OwnerProperties />} />
                    <Route path="properties/add" element={<AddPropertyWizard />} />
                    <Route path="properties/wizard" element={<AddPropertyWizard />} />
                    <Route path="properties/:id/edit" element={<AddEditProperty />} />
                    <Route path="notifications" element={<OwnerNotifications />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>
                </Route>

                {/* Broker Dashboard Routes */}
                <Route element={<ProtectedRoute allowedRoles={['broker', 'admin']} />}>
                  <Route path="/broker" element={<DashboardLayout />}>
                    <Route index element={<Navigate to="/broker/dashboard" replace />} />
                    <Route path="dashboard" element={<BrokerDashboard />} />
                    <Route path="verification-queue" element={<BrokerVerificationQueue />} />
                    <Route path="properties" element={<BrokerProperties />} />
                    <Route path="enquiries" element={<BrokerEnquiries />} />
                    <Route path="visits" element={<BrokerVisits />} />
                    <Route path="followups" element={<BrokerFollowups />} />
                    <Route path="deals" element={<BrokerDeals />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>
                </Route>

                {/* Client Dashboard Routes */}
                <Route element={<ProtectedRoute allowedRoles={['client', 'admin']} />}>
                  <Route path="/client" element={<DashboardLayout />}>
                    <Route index element={<Navigate to="/client/dashboard" replace />} />
                    <Route path="dashboard" element={<ClientDashboard />} />
                    <Route path="requirements" element={<ClientRequirements />} />
                    <Route path="enquiries" element={<ClientEnquiries />} />
                    <Route path="visits" element={<ClientVisits />} />
                    <Route path="favorites" element={<ClientFavorites />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>
                </Route>

                {/* Admin Dashboard Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<DashboardLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="properties" element={<AdminProperties />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="brokers" element={<AdminBrokers />} />
                    <Route path="enquiries" element={<AdminEnquiries />} />
                    <Route path="visits" element={<AdminVisits />} />
                    <Route path="deals" element={<AdminDeals />} />
                    <Route path="commissions" element={<AdminCommissions />} />
                    <Route path="audit-logs" element={<AdminAuditLogs />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>

              {/* Floating Compare Pill & Modal */}
              <FloatingCompareBar />
              <PropertyCompareModal />
            </CompareProvider>
          </SocketProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
