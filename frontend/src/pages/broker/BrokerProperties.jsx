import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Home, User, Phone, Mail, MapPin, Eye, ExternalLink, Calendar } from 'lucide-react';

const BrokerProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await api.get('/broker/properties');
        setProperties(res.data.properties || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProps();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#222222]">My Assigned Properties</h1>
        <p className="text-xs text-gray-500 mt-1">
          These properties have been assigned to you by administration. You have direct access to owner details and client enquiries.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading assigned portfolio...</div>
        ) : properties.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No properties currently assigned to you. Admin assigns properties upon owner approval.
          </div>
        ) : (
          properties.map((prop) => (
            <div key={prop._id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-gray-50/50 transition">
              <div className="flex items-start space-x-4">
                <img
                  src={prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
                  alt=""
                  className="w-24 h-24 rounded-2xl object-cover shrink-0"
                />

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-[#FFEBEE] text-[#C62828]">
                      FOR {prop.listingType}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold capitalize">{prop.propertyType?.replace('_', ' ')}</span>
                  </div>

                  <h3 className="font-bold text-base text-[#222222]">{prop.title}</h3>
                  <p className="text-xs text-gray-500">
                    {prop.address}, {prop.locality}, {prop.city} • ₹{prop.price?.toLocaleString('en-IN')}
                  </p>

                  {/* Owner Contact Information (OPERATIONAL PRIVILEGE: Broker needs owner details to coordinate) */}
                  {prop.ownerId && (
                    <div className="mt-3 p-3 bg-red-50/60 rounded-xl border border-red-100 text-xs text-gray-700 flex flex-wrap items-center gap-4">
                      <div className="flex items-center space-x-1.5 font-bold text-[#222222]">
                        <User className="w-3.5 h-3.5 text-[#C62828]" />
                        <span>Owner: {prop.ownerId.name}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-[#C62828]" />
                        <span>{prop.ownerId.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-[#C62828]" />
                        <span>{prop.ownerId.email}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Stats & Actions */}
              <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 shrink-0">
                <div className="text-right text-xs">
                  <span className="font-bold text-emerald-600 block">Status: {prop.listingStatus?.toUpperCase()}</span>
                  <span className="text-[11px] text-gray-400">
                    {prop.enquiriesCount || 0} leads • {prop.visitsCount || 0} visits
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/properties/${prop._id}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Public View
                  </Link>
                  <Link
                    to="/broker/enquiries"
                    className="px-3 py-1.5 rounded-xl bg-[#C62828] text-white text-xs font-bold hover:bg-[#B71C1C]"
                  >
                    View Leads
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BrokerProperties;
