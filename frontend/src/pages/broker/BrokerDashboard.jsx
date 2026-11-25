import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Home,
  MessageSquare,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Phone,
  ArrowRight,
  User,
} from 'lucide-react';

const BrokerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/broker/dashboard-stats');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = data?.stats || {};
  const recentVisits = data?.recentVisits || [];
  const recentEnquiries = data?.recentEnquiries || [];

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EEEEEE] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-[#C62828] uppercase tracking-wider">
            In-House Brokerage Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#222222] mt-0.5">
            Operational Broker Console
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your assigned properties, client pipeline, property inspections, and closed deals.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/broker/visits"
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            Today's Visits ({stats.todayVisitsCount || 0})
          </Link>
          <Link
            to="/broker/enquiries"
            className="px-4 py-2.5 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold shadow-md transition"
          >
            New Enquiries ({stats.newEnquiriesCount || 0})
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold text-gray-500">Assigned Properties</span>
            <Home className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-black text-[#222222]">{stats.assignedPropertiesCount || 0}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Assigned by admin</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <div className="flex items-center justify-between text-[#C62828] mb-2">
            <span className="text-xs font-bold text-gray-500">Active Leads</span>
            <MessageSquare className="w-5 h-5 text-[#C62828]" />
          </div>
          <p className="text-3xl font-black text-[#C62828]">
            {(stats.newEnquiriesCount || 0) + (stats.activeLeadsCount || 0)}
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">{stats.newEnquiriesCount || 0} uncontacted</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold text-gray-500">Scheduled Visits</span>
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-blue-600">{stats.upcomingVisitsCount || 0}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">{stats.todayVisitsCount || 0} scheduled for today</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold text-gray-500">Commission Earned</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-emerald-600">
            ₹{((stats.totalCommissionEarned || 0) / 100000).toFixed(1)}L
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">{stats.closedDealsCount || 0} deals closed</span>
        </div>
      </div>

      {/* Secondary Operations Grid: Today's Visits & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scheduled Visits */}
        <div className="bg-white rounded-3xl p-6 border border-[#EEEEEE] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-base text-[#222222]">Upcoming Property Visits</h3>
            <Link to="/broker/visits" className="text-xs font-bold text-[#C62828] hover:underline">
              Visit Manager →
            </Link>
          </div>

          {recentVisits.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No upcoming visits scheduled.</p>
          ) : (
            <div className="space-y-3">
              {recentVisits.map((v) => (
                <div key={v._id} className="p-3.5 bg-[#F8F8F8] rounded-2xl border border-gray-100 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-[#222222] truncate max-w-xs">{v.propertyId?.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Client: <strong>{v.clientId?.name}</strong> ({v.clientId?.phone})
                    </p>
                    <p className="text-[10px] text-[#C62828] font-semibold mt-0.5">
                      {new Date(v.scheduledDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {v.scheduledTime}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                    v.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Client Enquiries */}
        <div className="bg-white rounded-3xl p-6 border border-[#EEEEEE] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-base text-[#222222]">Client Enquiries Stream</h3>
            <Link to="/broker/enquiries" className="text-xs font-bold text-[#C62828] hover:underline">
              All Enquiries →
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No client enquiries yet.</p>
          ) : (
            <div className="space-y-3">
              {recentEnquiries.map((enq) => (
                <div key={enq._id} className="p-3.5 bg-[#F8F8F8] rounded-2xl border border-gray-100 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#222222]">{enq.clientName}</span>
                      <span className="text-[10px] text-gray-400">({enq.clientPhone})</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-xs">
                      Property: {enq.propertyId?.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 italic">
                      "{enq.message}"
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                    enq.status === 'new' ? 'bg-red-100 text-[#C62828]' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {enq.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrokerDashboard;
