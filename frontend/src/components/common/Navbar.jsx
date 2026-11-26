import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCompare } from '../../context/CompareContext';
import NotificationDropdown from './NotificationDropdown';
import {
  Building2,
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  PlusCircle,
  Globe,
  SlidersHorizontal,
  Scale,
  MapPin,
  Home,
  Building,
} from 'lucide-react';

const Navbar = ({ onOpenFilters }) => {
  const { user, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const { comparedProperties } = useCompare();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchExpand, setSearchExpand] = useState(false);

  // Quick search state in header
  const [headerLocation, setHeaderLocation] = useState('');
  const [headerType, setHeaderType] = useState('buy');
  const [headerCategory, setHeaderCategory] = useState('');
  const [headerBudget, setHeaderBudget] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

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

  const getListPropertyLink = () => {
    if (!user) return '/welcome';
    if (user.role === 'owner' || user.role === 'admin') return '/owner/properties/add';
    if (user.role === 'broker') return '/broker/properties';
    return '/welcome';
  };

  const handleHeaderSearch = (e) => {
    e?.preventDefault();
    setSearchExpand(false);
    const params = new URLSearchParams();
    if (headerLocation) params.set('locality', headerLocation);
    if (headerType === 'rent') params.set('listingType', 'rent');
    else params.set('listingType', 'sale');
    if (headerCategory) params.set('propertyType', headerCategory);
    if (headerBudget) params.set('maxPrice', headerBudget);

    navigate(`/marketplace?${params.toString()}`);
  };

  // Close search expand on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchExpand(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Buy', path: '/buy' },
    { name: 'Rent', path: '/rent' },
    { name: 'Commercial', path: '/commercial' },
    { name: 'Residential', path: '/residential' },
    { name: 'Map Search', path: '/map-search' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#EBEBEB] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* LEFT: Redstone Brand Logo */}
          <div className="flex-shrink-0">
            <Link
              to={user ? `/${user.role}/dashboard` : '/welcome'}
              className="flex items-center space-x-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#C62828] flex items-center justify-center text-white shadow-sm group-hover:bg-[#B71C1C] transition transform group-hover:scale-105">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-extrabold tracking-tight text-[#222222]">
                  RED<span className="text-[#C62828]">STONE</span>
                </span>
                <span className="block text-[9px] tracking-widest font-bold text-[#717171] uppercase -mt-1">
                  Real Estate Brokerage
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER: Airbnb-Style Interactive Search Bar (Desktop) */}
          <div className="hidden md:flex flex-col items-center flex-1 max-w-xl mx-4" ref={searchRef}>
            {!searchExpand ? (
              <div className="flex items-center justify-between w-full max-w-md bg-white border border-[#EBEBEB] hover:border-gray-300 rounded-full py-2 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.12)] transition duration-200 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setSearchExpand(true)}
                  className="text-xs font-semibold text-[#222222] hover:text-[#C62828] px-2 truncate"
                >
                  {headerLocation || 'Anywhere in NCR'}
                </button>
                <span className="h-4 w-px bg-gray-200" />
                <button
                  type="button"
                  onClick={() => setSearchExpand(true)}
                  className="text-xs font-semibold text-[#222222] hover:text-[#C62828] px-2 truncate"
                >
                  {headerCategory ? headerCategory.replace('_', ' ') : 'Any Category'}
                </button>
                <span className="h-4 w-px bg-gray-200" />
                <button
                  type="button"
                  onClick={() => setSearchExpand(true)}
                  className="text-xs font-normal text-[#717171] px-2 truncate"
                >
                  {headerBudget ? `Up to ₹${(Number(headerBudget) / 100000).toFixed(0)}L` : 'Any Budget'}
                </button>

                <button
                  type="button"
                  onClick={() => setSearchExpand(true)}
                  className="w-8 h-8 rounded-full bg-[#C62828] hover:bg-[#B71C1C] flex items-center justify-center text-white shadow-sm transition ml-1 shrink-0"
                  title="Search Properties"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Expanded Airbnb Search Panel */
              <form
                onSubmit={handleHeaderSearch}
                className="w-full bg-white border border-[#EBEBEB] rounded-3xl p-3 shadow-xl space-y-3 animate-fade-in"
              >
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {/* Location Input */}
                  <div className="p-2 bg-[#F7F7F7] rounded-xl">
                    <label className="block text-[10px] font-bold uppercase text-[#717171]">Where</label>
                    <input
                      type="text"
                      placeholder="e.g. Crossing Republik"
                      value={headerLocation}
                      onChange={(e) => setHeaderLocation(e.target.value)}
                      className="w-full bg-transparent font-semibold text-[#222222] focus:outline-none placeholder-gray-400 text-xs mt-0.5"
                    />
                  </div>

                  {/* Buy / Rent */}
                  <div className="p-2 bg-[#F7F7F7] rounded-xl">
                    <label className="block text-[10px] font-bold uppercase text-[#717171]">Type</label>
                    <select
                      value={headerType}
                      onChange={(e) => setHeaderType(e.target.value)}
                      className="w-full bg-transparent font-semibold text-[#222222] focus:outline-none text-xs mt-0.5 cursor-pointer"
                    >
                      <option value="buy">Buy</option>
                      <option value="rent">Rent</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div className="p-2 bg-[#F7F7F7] rounded-xl">
                    <label className="block text-[10px] font-bold uppercase text-[#717171]">Category</label>
                    <select
                      value={headerCategory}
                      onChange={(e) => setHeaderCategory(e.target.value)}
                      className="w-full bg-transparent font-semibold text-[#222222] focus:outline-none text-xs mt-0.5 cursor-pointer"
                    >
                      <option value="">All Categories</option>
                      <option value="apartment">Apartment</option>
                      <option value="flat">High-Rise Flat</option>
                      <option value="villa">Luxury Villa</option>
                      <option value="independent_house">Builder Floor</option>
                      <option value="office">Office Space</option>
                      <option value="shop">Commercial Shop</option>
                    </select>
                  </div>

                  {/* Budget */}
                  <div className="p-2 bg-[#F7F7F7] rounded-xl">
                    <label className="block text-[10px] font-bold uppercase text-[#717171]">Max Budget</label>
                    <select
                      value={headerBudget}
                      onChange={(e) => setHeaderBudget(e.target.value)}
                      className="w-full bg-transparent font-semibold text-[#222222] focus:outline-none text-xs mt-0.5 cursor-pointer"
                    >
                      <option value="">Any Budget</option>
                      <option value="5000000">₹50 Lakh</option>
                      <option value="10000000">₹1 Crore</option>
                      <option value="20000000">₹2 Crore</option>
                      <option value="50000000">₹5 Crore+</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-4 text-xs font-semibold text-[#717171]">
                    {navItems.slice(0, 4).map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setSearchExpand(false)}
                        className="hover:text-[#C62828] transition"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setSearchExpand(false)}
                      className="px-3 py-1.5 text-xs text-[#717171] hover:text-[#222222] font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT: List Property, Language, Notifications & User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* List Your Property CTA */}
            <Link
              to={getListPropertyLink()}
              className="hidden lg:inline-flex items-center space-x-1 text-xs font-semibold text-[#222222] hover:bg-[#F7F7F7] px-3.5 py-2 rounded-full transition duration-150"
            >
              <span>List Your Property</span>
            </Link>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-[#F7F7F7] text-[#717171] hover:text-[#222222] transition"
              title="Switch Language / भाषा बदलें"
            >
              <Globe className="w-4 h-4" />
            </button>

            {/* Compare Badge Icon if properties are compared */}
            {comparedProperties && comparedProperties.length > 0 && (
              <span className="relative">
                <span className="flex items-center justify-center p-2 rounded-full bg-red-50 text-[#C62828] text-xs font-bold">
                  <Scale className="w-4 h-4" />
                </span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C62828] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow">
                  {comparedProperties.length}
                </span>
              </span>
            )}

            {/* Notification Dropdown for Authenticated User */}
            {user && <NotificationDropdown />}

            {/* Airbnb-style Rounded User Profile Pill Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 border border-[#EBEBEB] hover:shadow-md transition duration-200 rounded-full py-1.5 px-3 bg-white"
              >
                <Menu className="w-4 h-4 text-[#717171]" />
                {user ? (
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#717171] text-white flex items-center justify-center text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-[#EBEBEB] py-2 z-50 text-xs text-[#222222] animate-fade-in">
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-[#EBEBEB]">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#C62828] bg-red-50 px-2 py-0.5 rounded">
                            {user.role} Portal
                          </span>
                          <p className="font-bold text-sm text-[#222222] mt-1 truncate">{user.name}</p>
                          <p className="text-[11px] text-[#717171] truncate">{user.email}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            to={getDashboardLink()}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 font-bold hover:bg-[#F7F7F7] text-[#222222]"
                          >
                            <LayoutDashboard className="w-4 h-4 mr-2.5 text-[#C62828]" />
                            My Dashboard
                          </Link>

                          <Link
                            to="/marketplace"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 hover:bg-[#F7F7F7] text-[#222222]"
                          >
                            <Home className="w-4 h-4 mr-2.5 text-gray-500" />
                            Explore Marketplace
                          </Link>

                          <Link
                            to="/map-search"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 hover:bg-[#F7F7F7] text-[#222222]"
                          >
                            <MapPin className="w-4 h-4 mr-2.5 text-gray-500" />
                            Interactive Map & Heatmaps
                          </Link>

                          <Link
                            to={getListPropertyLink()}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 hover:bg-[#F7F7F7] text-[#222222]"
                          >
                            <PlusCircle className="w-4 h-4 mr-2.5 text-emerald-600" />
                            List Your Property
                          </Link>
                        </div>

                        <div className="border-t border-[#EBEBEB] pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center px-4 py-2.5 text-red-600 hover:bg-red-50 text-left font-semibold"
                          >
                            <LogOut className="w-4 h-4 mr-2.5" />
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="py-1">
                          <Link
                            to="/welcome"
                            onClick={() => setUserDropdownOpen(false)}
                            className="block px-4 py-2.5 font-bold hover:bg-[#F7F7F7] text-[#C62828]"
                          >
                            🚪 Select Stakeholder Role
                          </Link>
                          <Link
                            to="/login"
                            onClick={() => setUserDropdownOpen(false)}
                            className="block px-4 py-2.5 font-semibold hover:bg-[#F7F7F7]"
                          >
                            Sign In
                          </Link>
                          <Link
                            to="/register"
                            onClick={() => setUserDropdownOpen(false)}
                            className="block px-4 py-2.5 hover:bg-[#F7F7F7] text-[#717171]"
                          >
                            Create an Account
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-lg text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Compact Search Bar */}
        <div className="md:hidden pb-3">
          <button
            type="button"
            onClick={() => {
              if (onOpenFilters) onOpenFilters();
              else navigate('/marketplace');
            }}
            className="w-full flex items-center justify-between bg-white border border-[#EBEBEB] rounded-full py-2.5 px-4 shadow-sm"
          >
            <div className="flex items-center space-x-3 text-left">
              <Search className="w-4 h-4 text-[#C62828] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#222222]">Where to in NCR?</p>
                <p className="text-[10px] text-[#717171]">Anywhere • Any Category • Any Budget</p>
              </div>
            </div>
            <div className="p-1.5 rounded-full border border-[#EBEBEB]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#717171]" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EBEBEB] bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navItems.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  location.pathname === link.path
                    ? 'text-[#C62828] bg-red-50'
                    : 'text-[#222222] hover:bg-[#F7F7F7]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-[#EBEBEB] space-y-2">
            <button
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[#EBEBEB] font-bold text-xs text-[#222222] bg-[#F7F7F7]"
            >
              <Globe className="w-3.5 h-3.5 text-[#C62828]" />
              <span>{lang === 'en' ? 'भाषा बदलें: हिंदी' : 'Switch Language: English'}</span>
            </button>

            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 bg-[#C62828] text-white py-2.5 rounded-xl font-bold text-xs shadow"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to {user.role.toUpperCase()} Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2 text-center text-xs font-semibold text-red-600"
                >
                  Sign Out ({user.name})
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl border border-[#EBEBEB] font-bold text-xs text-[#222222]"
                >
                  Sign In
                </Link>
                <Link
                  to="/welcome"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl bg-[#C62828] text-white font-bold text-xs"
                >
                  Select Role
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
