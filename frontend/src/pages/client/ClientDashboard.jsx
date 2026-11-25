import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Calendar, Search, ArrowRight, Star, ShieldCheck } from 'lucide-react';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enqRes, visitsRes] = await Promise.all([
          api.get('/enquiries/client'),
          api.get('/visits/client'),
        ]);
        setEnquiries(enqRes.data.enquiries || []);
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
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EEEEEE] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-[#C62828] uppercase tracking-wider">Buyer & Tenant Portal</span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#222222] mt-0.5">
            Hello, {user?.name}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track your property enquiries, scheduled physical site tours, and broker communications.
          </p>
        </div>

        <Link
          to="/buy"
          className="inline-flex items-center space-x-2 bg-[#C62828] hover:bg-[#B71C1C] text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-md transition"
        >
          <Search className="w-4 h-4" />
          <span>Explore Verified Properties</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold text-gray-500">Active Enquiries</span>
            <MessageSquare className="w-5 h-5 text-[#C62828]" />
          </div>
          <p className="text-3xl font-black text-[#222222]">{enquiries.length}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Sent to dedicated brokers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold text-gray-500">Scheduled Visits</span>
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-blue-600">{visits.length}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Physical inspections</span>
        </div>
      </div>

      {/* Scheduled Visits & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visits */}
        <div className="bg-white rounded-3xl p-6 border border-[#EEEEEE] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-base text-[#222222]">My Property Visits</h3>
            <Link to="/client/visits" className="text-xs font-bold text-[#C62828] hover:underline">
              View All ({visits.length})
            </Link>
          </div>

          {visits.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No property visits scheduled yet.</p>
          ) : (
            <div className="space-y-3">
              {visits.map((v) => (
                <div key={v._id} className="p-3.5 bg-[#F8F8F8] rounded-2xl border border-gray-100 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-[#222222] truncate max-w-xs">{v.propertyId?.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{v.propertyId?.locality}, {v.propertyId?.city}</p>
                    <p className="text-[10px] text-[#C62828] font-bold mt-1">
                      {new Date(v.scheduledDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {v.scheduledTime}
                    </p>
                    {v.brokerId && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Broker in charge: <strong>{v.brokerId.name}</strong> ({v.brokerId.phone})
                      </p>
                    )}
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

        {/* Enquiries */}
        <div className="bg-white rounded-3xl p-6 border border-[#EEEEEE] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-base text-[#222222]">My Recent Enquiries</h3>
            <Link to="/client/enquiries" className="text-xs font-bold text-[#C62828] hover:underline">
              View All ({enquiries.length})
            </Link>
          </div>

          {enquiries.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No enquiries submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {enquiries.map((enq) => (
                <div key={enq._id} className="p-3.5 bg-[#F8F8F8] rounded-2xl border border-gray-100 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-[#222222] truncate max-w-xs">{enq.propertyId?.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 italic line-clamp-1">"{enq.message}"</p>
                    {enq.brokerId && (
                      <p className="text-[10px] text-gray-400 mt-1">Assigned Broker: {enq.brokerId.name}</p>
                    )}
                  </div>

                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase bg-gray-100 text-gray-700">
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

export default ClientDashboard;
