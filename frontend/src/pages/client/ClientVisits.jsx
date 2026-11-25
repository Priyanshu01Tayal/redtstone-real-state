import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, Clock, MapPin, User, Phone } from 'lucide-react';

const ClientVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const res = await api.get('/visits/client');
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
        <h1 className="text-2xl font-black text-[#222222]">My Scheduled Property Visits</h1>
        <p className="text-xs text-gray-500 mt-1">
          Physical site tour itineraries coordinated with our assigned in-house brokers.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading your visits...</div>
        ) : visits.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No property visits scheduled.
            <Link to="/buy" className="block text-[#C62828] font-bold mt-2">Find a property to inspect</Link>
          </div>
        ) : (
          visits.map((v) => (
            <div key={v._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition">
              <div className="space-y-2 flex-1 text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full ${
                    v.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {v.status}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Scheduled on {new Date(v.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#222222]">{v.propertyId?.title}</h3>
                <p className="text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C62828]" />
                  {v.propertyId?.address}, {v.propertyId?.locality}
                </p>

                {/* Assigned Broker (Escort) */}
                {v.brokerId && (
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center space-x-3 w-fit">
                    <img
                      src={v.brokerId.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-gray-800">Broker Escort: {v.brokerId.name}</p>
                      <p className="text-gray-500 text-[11px]">{v.brokerId.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Date & Time */}
              <div className="text-right shrink-0">
                <span className="text-sm font-black text-[#C62828] block">
                  {new Date(v.scheduledDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-xs font-bold text-gray-700">{v.scheduledTime}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientVisits;
