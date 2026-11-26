import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { useAuth } from '../../context/AuthContext';

const PublicLayout = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Allow unauthenticated access strictly to login and register (welcome and splash have separate routes)
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
        <div className="w-12 h-12 border-4 border-[#C62828] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  // If user is not authenticated and trying to access browsing/marketplace routes
  if (!isAuthenticated && !isAuthPage) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F8]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
