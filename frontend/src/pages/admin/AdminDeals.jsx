import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DollarSign, CheckCircle2 } from 'lucide-react';

const AdminDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await api.get('/deals');
        setDeals(res.data.deals || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#222222]">Closed Deals & Contracts</h1>
        <p className="text-xs text-gray-500 mt-1">Transactions closed and executed by our brokerage team.</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading deals...</div>
        ) : deals.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No closed deals recorded yet.</div>
        ) : (
          deals.map((d) => (
            <div key={d._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:bg-gray-50/50">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-emerald-100 text-emerald-800">
                    {d.status?.replace('_', ' ')}
                  </span>
                  <span className="font-bold text-[#222222] text-sm">{d.propertyId?.title}</span>
                </div>

                <p className="text-gray-600">
                  Client: <strong>{d.clientId?.name}</strong> • Broker: <strong>{d.brokerId?.name}</strong> • Owner: <strong>{d.ownerId?.name}</strong>
                </p>

                {d.termsAndConditions && (
                  <p className="text-[11px] text-gray-500 italic">{d.termsAndConditions}</p>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="text-lg font-black text-[#C62828] block">
                  ₹{d.finalPrice?.toLocaleString('en-IN')}
                </span>
                <span className="text-gray-400 text-[11px]">
                  Closed on {new Date(d.agreementDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDeals;
