import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import {
  Building2,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  PlusCircle,
  Briefcase,
  Globe,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardLink = () => {
    if (!user) return '/welcome';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'broker':
        return '/broker/dashboard';
      case 'owner':
        return '/owner/dashboard';
      case 'client':
      default:
        return '/client/dashboard';
    }
  };

  const navLinks = [
    { name: t('home'), path: user ? '/marketplace' : '/welcome' },
    { name: t('mapAndHeatmap'), path: '/map-search' },
    { name: t('buy'), path: '/buy' },
    { name: t('rent'), path: '/rent' },
    { name: t('commercial'), path: '/commercial' },
    { name: t('residential'), path: '/residential' },
    { name: t('aboutUs'), path: '/about' },
    { name: t('contact'), path: '/contact' },
  ];


  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EEEEEE] shadow-sm">
      {/* Top Utility Bar for 1-Click Role Switcher */}
      <div className="bg-[#222222] text-xs text-gray-300 py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 text-gray-300 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E53935]" />
              Government RERA Registered In-House Brokerage
            </span>
            <span>•</span>
            <span>Zero Spam • Direct In-House Broker Representation</span>
          </div>

          <div className="flex items-center space-x-2">
            {!user ? (
              <Link
                to="/welcome"
                className="bg-[#C62828] hover:bg-[#B71C1C] text-white px-3 py-0.5 rounded text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
              >
                <span>🚪 Stakeholder Entry Portal</span>
              </Link>
            ) : (
              <span className="text-gray-400 text-[11px]">
                Signed in: <strong className="text-white uppercase">{user.role}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to={user ? `/${user.role}/dashboard` : '/welcome'} className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#C62828] flex items-center justify-center text-white shadow-md group-hover:bg-[#B71C1C] transition transform group-hover:scale-105">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-[#222222]">
                RED<span className="text-[#C62828]">STONE</span>
              </span>
              <span className="block text-[10px] tracking-widest font-bold text-[#777777] uppercase -mt-1">
                Real Estate Brokerage
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-semibold transition ${
                    isActive
                      ? 'text-[#C62828] border-b-2 border-[#C62828] pb-1'
                      : 'text-[#222222] hover:text-[#C62828]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EEEEEE] bg-gray-50 hover:bg-gray-100 text-xs font-black text-[#222222] transition-colors shadow-sm"
              title="Switch Language / भाषा बदलें"
            >
              <Globe className="w-3.5 h-3.5 text-[#C62828]" />
              <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                {/* Notification Dropdown */}
                <NotificationDropdown />

                {/* Role Badge */}
                <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-md bg-[#FFEBEE] text-[#C62828] border border-red-200">
                  {user.role}
                </span>

                {/* Dashboard CTA */}
                <Link
                  to={getDashboardLink()}
                  className="inline-flex items-center space-x-1.5 bg-[#C62828] hover:bg-[#B71C1C] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#EEEEEE]"
                    />
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-2xl border border-[#EEEEEE] py-2 z-50">
                        <div className="px-4 py-2 border-b border-[#EEEEEE]">
                          <p className="text-xs text-gray-400">Signed in as</p>
                          <p className="text-sm font-bold text-[#222222] truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>

                        <Link
                          to={getDashboardLink()}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2 text-[#C62828]" />
                          My Dashboard
                        </Link>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-bold text-[#222222] hover:text-[#C62828] px-3 py-2 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-[#C62828] hover:bg-[#B71C1C] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                >
                  List Property / Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {user && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EEEEEE] bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-800 hover:bg-red-50 hover:text-[#C62828]"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-[#EEEEEE] space-y-2">
            <button
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-300 font-bold text-xs text-[#222222] bg-gray-50 mb-2"
            >
              <Globe className="w-4 h-4 text-[#C62828]" />
              <span>{lang === 'en' ? 'भाषा बदलें: हिंदी' : 'Switch Language: English'}</span>
            </button>

            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 bg-[#C62828] text-white py-3 rounded-xl font-bold text-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to {user.role.toUpperCase()} Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-red-600"
                >
                  Sign Out ({user.name})
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl border border-gray-300 font-bold text-sm text-[#222222]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-[#C62828] text-white font-bold text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
