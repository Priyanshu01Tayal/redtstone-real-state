import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { MessageSquare, Phone, Mail } from 'lucide-react';

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const res = await api.get('/enquiries/admin');
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
        <h1 className="text-2xl font-black text-[#222222]">Platform Enquiry Stream</h1>
        <p className="text-xs text-gray-500 mt-1">
          Complete visibility across all client enquiries, assigned brokers, and property owners.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading master enquiry stream...</div>
        ) : enquiries.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No enquiries recorded yet.</div>
        ) : (
          enquiries.map((enq) => (
            <div key={enq._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:bg-gray-50/50">
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#222222] text-sm">{enq.clientName}</span>
                  <span className="text-gray-400">({enq.clientPhone})</span>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-[#FFEBEE] text-[#C62828]">
                    {enq.status}
                  </span>
                </div>

                <p className="text-gray-600">
                  Target Property: <strong>{enq.propertyId?.title}</strong> ({enq.propertyId?.locality})
                </p>
                <p className="text-gray-500 italic bg-gray-50 p-2 rounded-lg">
                  "{enq.message}"
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 pt-1">
                  <span>Assigned Broker: <strong>{enq.brokerId?.name || 'Unassigned'}</strong></span>
                  <span>Owner: <strong>{enq.ownerId?.name || 'Unknown'}</strong></span>
                </div>
              </div>

              <span className="text-gray-400 text-[11px] font-semibold shrink-0">
                {new Date(enq.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminEnquiries;
