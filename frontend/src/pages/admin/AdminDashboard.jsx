import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  Home,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  Briefcase,
  ArrowRight,
  Calendar,
  MessageSquare,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard-stats');
        setStats(res.data.stats || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EEEEEE] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-[#C62828] uppercase tracking-wider">
            Platform Master Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#222222] mt-0.5">
            Admin Management Overview
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Oversee user verification, property approvals, in-house broker assignments, and brokerage commissions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/properties?approvalStatus=pending"
            className="px-4 py-2.5 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4" />
            <span>Approve Properties ({stats.pendingProperties || 0})</span>
          </Link>
          <Link
            to="/admin/commissions"
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            Commissions
          </Link>
        </div>
      </div>

      {/* High-Level KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold text-gray-500">Total Users</span>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-black text-[#222222]">{stats.totalUsers || 0}</p>
          <div className="flex gap-2 text-[10px] text-gray-400 mt-1 font-semibold">
            <span>{stats.totalOwners || 0} Owners</span> •
            <span>{stats.totalBrokers || 0} Brokers</span> •
            <span>{stats.totalClients || 0} Clients</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold text-gray-500">Pending Approvals</span>
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-amber-600">{stats.pendingProperties || 0}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Requires broker assignment</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold text-gray-500">Published Listings</span>
            <Home className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{stats.approvedProperties || 0}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Active on marketplace</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <div className="flex items-center justify-between text-[#C62828] mb-2">
            <span className="text-xs font-bold text-gray-500">Company Revenue</span>
            <DollarSign className="w-5 h-5 text-[#C62828]" />
          </div>
          <p className="text-3xl font-black text-[#C62828]">
            ₹{((stats.totalRevenue || 0) / 100000).toFixed(1)}L
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">{stats.closedDeals || 0} deals closed</span>
        </div>
      </div>

      {/* Operations Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/properties"
          className="bg-white p-6 rounded-3xl border border-[#EEEEEE] shadow-sm hover:shadow-md transition group"
        >
          <div className="w-12 h-12 bg-red-50 text-[#C62828] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <Home className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#222222]">Property Approval Hub</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Verify owner submissions, assign dedicated in-house brokers, and publish verified properties.
          </p>
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-[#C62828] mt-4">
            <span>Manage Properties</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/commissions"
          className="bg-white p-6 rounded-3xl border border-[#EEEEEE] shadow-sm hover:shadow-md transition group"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#222222]">Commission & Revenue</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Monitor deal closures, brokerage fee calculation, broker incentives, and company net income.
          </p>
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 mt-4">
            <span>View Commissions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white p-6 rounded-3xl border border-[#EEEEEE] shadow-sm hover:shadow-md transition group"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#222222]">User & Role Control</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Manage Owners, In-House Brokers, and Clients. Toggle account permissions and suspend accounts.
          </p>
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 mt-4">
            <span>Manage Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
