import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../common/NotificationDropdown';
import {
  Building2,
  LayoutDashboard,
  Home,
  PlusCircle,
  MessageSquare,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Shield,
  Briefcase,
  CheckCircle2,
  Clock,
  Heart,
  TrendingUp,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, demoLogin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  // Role based navigation menus
  const roleMenus = {
    owner: [
      { name: 'Dashboard Overview', path: '/owner/dashboard', icon: LayoutDashboard },
      { name: 'My Properties', path: '/owner/properties', icon: Home },
      { name: 'Add New Property', path: '/owner/properties/add', icon: PlusCircle },
      { name: 'Notifications', path: '/owner/notifications', icon: MessageSquare },
      { name: 'My Profile', path: '/owner/profile', icon: Users },
    ],
    broker: [
      { name: 'Broker Overview', path: '/broker/dashboard', icon: LayoutDashboard },
      { name: 'Verification Queue', path: '/broker/verification-queue', icon: ClipboardCheck },
      { name: 'Assigned Properties', path: '/broker/properties', icon: Home },
      { name: 'Client Enquiries', path: '/broker/enquiries', icon: MessageSquare },
      { name: 'Property Visits', path: '/broker/visits', icon: Calendar },
      { name: 'Follow-ups & CRM', path: '/broker/followups', icon: Clock },
      { name: 'Deals & Negotiations', path: '/broker/deals', icon: DollarSign },
      { name: 'My Profile', path: '/broker/profile', icon: Users },
    ],
    client: [
      { name: 'Client Overview', path: '/client/dashboard', icon: LayoutDashboard },
      { name: 'My Requirements & Matches', path: '/client/requirements', icon: Sparkles },
      { name: 'My Enquiries', path: '/client/enquiries', icon: MessageSquare },
      { name: 'My Visit Schedules', path: '/client/visits', icon: Calendar },
      { name: 'Saved Favorites', path: '/client/favorites', icon: Heart },
      { name: 'My Profile', path: '/client/profile', icon: Users },
    ],
    admin: [
      { name: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Properties & Approvals', path: '/admin/properties', icon: Home },
      { name: 'User Management', path: '/admin/users', icon: Users },
      { name: 'In-House Brokers', path: '/admin/brokers', icon: Briefcase },
      { name: 'Enquiries Stream', path: '/admin/enquiries', icon: MessageSquare },
      { name: 'Visits Monitor', path: '/admin/visits', icon: Calendar },
      { name: 'Deals & Contracts', path: '/admin/deals', icon: DollarSign },
      { name: 'Commission Management', path: '/admin/commissions', icon: TrendingUp },
      { name: 'Audit Logs', path: '/admin/audit-logs', icon: Shield },
      { name: 'Reports & Analytics', path: '/admin/reports', icon: FileText },
      { name: 'Brokerage Settings', path: '/admin/settings', icon: Settings },
    ],
  };

  const currentNav = roleMenus[user.role] || roleMenus.client;

  const handleRoleSwitch = async (newRole) => {
    await demoLogin(newRole);
    navigate(`/${newRole}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#222222] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C62828] flex items-center justify-center text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                RED<span className="text-[#E53935]">STONE</span>
              </span>
              <span className="block text-[9px] tracking-widest font-bold text-gray-400 uppercase -mt-1">
                {user.role} workspace
              </span>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center space-x-3">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border border-[#C62828]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <span className="inline-block px-2 py-0.5 mt-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-[#C62828] text-white">
              {user.role}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#C62828] text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* 1-Click Role Switcher in Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/80">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Switch Demo Persona:
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {['admin', 'broker', 'owner', 'client'].map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSwitch(r)}
                className={`py-1 px-2 rounded text-[11px] font-bold uppercase transition ${
                  user.role === r
                    ? 'bg-[#C62828] text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
            <Link
              to="/"
              className="text-xs text-gray-400 hover:text-white flex items-center space-x-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </Link>
            <button
              onClick={logout}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#EEEEEE] shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-2 text-xs text-[#777777]">
                <Link to="/" className="hover:text-[#C62828]">Home</Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                <span className="font-bold text-[#222222] capitalize">{user.role} Dashboard</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationDropdown />

              <Link
                to="/"
                className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-bold text-[#777777] hover:text-[#C62828] bg-gray-100 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Public Marketplace</span>
              </Link>

              <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
                <span className="text-xs font-bold text-[#222222] hidden md:inline-block">
                  {user.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
