import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RoleSelection from '../../components/entry/RoleSelection';

const WelcomePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F5] via-[#F8F8F8] to-[#FFFFFF] text-[#222222] flex flex-col justify-between">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#C62828] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-[#222222]">
              RED<span className="text-[#C62828]">STONE</span>
            </span>
            <span className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              Real Estate Brokerage
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            type="button"
            onClick={() => navigate('/splash')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 font-semibold transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C62828]" />
            <span>Replay Intro</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        {/* Welcome Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 bg-red-50 text-[#C62828] px-3.5 py-1.5 rounded-full text-xs font-black border border-red-200">
            <ShieldCheck className="w-4 h-4" />
            <span>Authentication-First Stakeholder Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#222222] tracking-tight">
            Welcome to <span className="text-[#C62828]">RedStone</span> Platform
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Select your stakeholder role to access your dedicated portal. All listings, enquiries, and inspections are strictly broker-mediated with 100% owner privacy.
          </p>
        </div>

        {/* If already authenticated, show Welcome Back status bar */}
        {isAuthenticated && user && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-5 border-2 border-[#C62828] shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-left">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#C62828]"
              />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#C62828] bg-red-50 px-2 py-0.5 rounded">
                  Active Session: {user.role?.toUpperCase()}
                </span>
                <h4 className="font-bold text-sm text-[#222222] mt-0.5">{user.name}</h4>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate(`/${user.role}/dashboard`)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-black text-xs transition shadow flex items-center justify-center space-x-1.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to My Dashboard</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Role Cards Grid */}
        <RoleSelection />
      </main>

      {/* Bottom Trust & Security Strip */}
      <footer className="border-t border-gray-200 py-6 bg-white/70 backdrop-blur-sm mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#C62828]" />
            <span className="font-semibold">RedStone Real Estate Brokerage Ltd. • RERA DL-REA-2021-9872</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <span>100% Owner Privacy</span>
            <span>•</span>
            <span>Zero Spam Calls</span>
            <span>•</span>
            <span>Physical Site Inspections</span>
            <span>•</span>
            <span>Fair 2% Brokerage</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
