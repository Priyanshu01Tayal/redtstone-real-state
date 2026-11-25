import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Clock, MapPin, User, Shield } from 'lucide-react';

const AdminVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const res = await api.get('/visits/admin');
        setVisits(res.data.visits || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#222222]">Platform Visits Monitor</h1>
        <p className="text-xs text-gray-500 mt-1">Real-time supervision of physical site visits across all properties and brokers.</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading visit logs...</div>
        ) : visits.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No visits logged.</div>
        ) : (
          visits.map((v) => (
            <div key={v._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:bg-gray-50/50">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${
                    v.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {v.status}
                  </span>
                  <span className="font-bold text-[#222222] text-sm">{v.propertyId?.title}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <span>Client: <strong>{v.clientId?.name}</strong> ({v.clientId?.phone})</span>
                  <span>Broker: <strong>{v.brokerId?.name}</strong></span>
                  <span>Owner: <strong>{v.ownerId?.name}</strong></span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-black text-[#C62828] block">
                  {new Date(v.scheduledDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-gray-500 font-bold">{v.scheduledTime}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminVisits;
