import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Briefcase, Star, Award, Phone, Mail } from 'lucide-react';

const AdminBrokers = () => {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        const res = await api.get('/admin/users?role=broker');
        setBrokers(res.data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrokers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#222222]">In-House Brokerage Roster</h1>
        <p className="text-xs text-gray-500 mt-1">Our certified team representing listed properties and coordinating deals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {brokers.map((b) => (
          <div key={b._id} className="bg-white p-6 rounded-3xl border border-[#EEEEEE] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={b.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                  alt={b.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C62828]"
                />
                <div>
                  <h3 className="font-bold text-base text-[#222222]">{b.name}</h3>
                  <p className="text-xs text-[#C62828] font-semibold">{b.licenseNumber || 'License DL-REA-XXXX'}</p>
                  <div className="flex items-center text-xs text-amber-600 font-bold mt-1">
                    <Star className="w-3.5 h-3.5 fill-current mr-1" />
                    <span>{b.rating || '4.8'} / 5.0 Rating</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 py-3 border-y border-gray-100">
                <p><strong>Experience:</strong> {b.experienceYears || '7'} Years in Real Estate</p>
                <p><strong>Deals Closed:</strong> {b.dealsCount || '35'}+ Transactions</p>
                {b.specialization && (
                  <p><strong>Specialization:</strong> {Array.isArray(b.specialization) ? b.specialization.join(', ') : b.specialization}</p>
                )}
                {b.serviceAreas && (
                  <p><strong>Service Areas:</strong> {Array.isArray(b.serviceAreas) ? b.serviceAreas.join(', ') : b.serviceAreas}</p>
                )}
              </div>

              <div className="pt-3 text-xs text-gray-500 space-y-1">
                <div className="flex items-center space-x-1.5"><Phone className="w-3.5 h-3.5 text-[#C62828]" /> <span>{b.phone}</span></div>
                <div className="flex items-center space-x-1.5"><Mail className="w-3.5 h-3.5 text-[#C62828]" /> <span>{b.email}</span></div>
              </div>
            </div>

            <span className="mt-4 block text-center py-2 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-xl">
              Active In-House Representative
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBrokers;
