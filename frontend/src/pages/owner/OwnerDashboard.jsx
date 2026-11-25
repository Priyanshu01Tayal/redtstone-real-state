import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  PlusCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import Badge from '../../components/common/Badge';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [counts, setCounts] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propsRes, visitsRes] = await Promise.all([
          api.get('/properties/owner/my-properties'),
          api.get('/visits/owner'),
        ]);
        setProperties(propsRes.data.properties || []);
        setCounts(propsRes.data.counts || { total: 0, approved: 0, pending: 0, rejected: 0 });
        setVisits(visitsRes.data.visits || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EEEEEE] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">Property Owner Portal</span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#222222] mt-0.5">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your properties, review visit requests from our in-house brokers, and track deal progress.
          </p>
        </div>

        <Link
          to="/owner/properties/add"
          className="inline-flex items-center space-x-2 bg-[#C62828] hover:bg-[#B71C1C] text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Property</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold text-gray-500">Total Properties</span>
            <Home className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-black text-[#222222]">{counts.total}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Listed under your account</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold text-gray-500">Live & Published</span>
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{counts.approved}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Active with assigned broker</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold text-gray-500">Pending Review</span>
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-amber-600">{counts.pending}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Awaiting admin verification</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <div className="flex items-center justify-between text-[#C62828] mb-2">
            <span className="text-xs font-bold text-gray-500">Property Visits</span>
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-[#C62828]">{visits.length}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Coordinated by our brokers</span>
        </div>
      </div>

      {/* Main Sections: Recent Properties & Upcoming Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Properties List */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#EEEEEE] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-base text-[#222222]">My Properties</h3>
            <Link to="/owner/properties" className="text-xs font-bold text-[#C62828] hover:underline">
              View All ({properties.length})
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-gray-400 py-4">Loading properties...</p>
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <Home className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-600">You haven't listed any properties yet</p>
              <Link to="/owner/properties/add" className="inline-block mt-3 text-xs text-[#C62828] font-bold">
                + Add your first property
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {properties.slice(0, 4).map((prop) => (
                <div key={prop._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
                      alt={prop.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-[#222222] line-clamp-1">{prop.title}</h4>
                      <p className="text-[11px] text-gray-500">{prop.locality}, {prop.city} • ₹{prop.price?.toLocaleString('en-IN')}</p>
                      {prop.assignedBrokerId ? (
                        <p className="text-[10px] text-[#C62828] font-semibold mt-0.5">
                          Broker: {prop.assignedBrokerId.name}
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-400 mt-0.5">Broker assignment pending</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        prop.approvalStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : prop.approvalStatus === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {prop.approvalStatus}
                    </span>
                    <span className="block text-[10px] text-gray-400 mt-1">
                      {prop.viewsCount || 0} views • {prop.enquiriesCount || 0} enquiries
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coordinated Visits Panel */}
        <div className="bg-white rounded-3xl p-6 border border-[#EEEEEE] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-base text-[#222222]">Scheduled Visits</h3>
            <span className="text-xs text-gray-400 font-semibold">{visits.length} Total</span>
          </div>

          {visits.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No scheduled visits on your properties yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visits.slice(0, 4).map((v) => (
                <div key={v._id} className="p-3 bg-[#F8F8F8] rounded-2xl border border-gray-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#222222] truncate max-w-[150px]">
                      {v.propertyId?.title || 'Property'}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      v.ownerConfirmation === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {v.ownerConfirmation === 'confirmed' ? 'Confirmed' : 'Needs Response'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {new Date(v.scheduledDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {v.scheduledTime}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Broker in charge: {v.brokerId?.name || 'In-House Broker'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
