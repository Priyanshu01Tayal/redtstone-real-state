import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { MessageSquare, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

const ClientEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const res = await api.get('/enquiries/client');
        setEnquiries(res.data.enquiries || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#222222]">My Enquiries History</h1>
        <p className="text-xs text-gray-500 mt-1">
          Track the status of your queries. Our assigned brokers manage all details directly.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading your enquiries...</div>
        ) : enquiries.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            You haven't enquired about any properties yet.
            <Link to="/buy" className="block text-[#C62828] font-bold mt-2">Browse Properties</Link>
          </div>
        ) : (
          enquiries.map((enq) => (
            <div key={enq._id} className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:bg-gray-50/50 transition">
              <div className="space-y-2 flex-1 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-[#FFEBEE] text-[#C62828]">
                    {enq.status?.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Submitted {new Date(enq.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#222222]">{enq.propertyId?.title}</h3>
                <p className="text-gray-500">{enq.propertyId?.locality}, {enq.propertyId?.city}</p>

                <p className="text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                  "{enq.message}"
                </p>

                {/* Assigned Broker Information (CRITICAL: Show broker, NOT owner) */}
                {enq.brokerId && (
                  <div className="p-3 rounded-xl bg-red-50/60 border border-red-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase block">Your Assigned In-House Broker</span>
                      <p className="font-bold text-[#222222]">{enq.brokerId.name}</p>
                      <p className="text-gray-500 text-[11px]">{enq.brokerId.phone} • {enq.brokerId.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {enq.propertyId?._id && (
                <Link
                  to={`/properties/${enq.propertyId._id}`}
                  className="px-4 py-2 border border-gray-200 text-xs font-bold text-gray-700 rounded-xl hover:bg-gray-50 shrink-0"
                >
                  View Property Details
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientEnquiries;
