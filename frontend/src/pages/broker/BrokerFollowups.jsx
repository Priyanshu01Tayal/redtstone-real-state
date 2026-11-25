import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { Clock, Phone, CheckCircle, PlusCircle } from 'lucide-react';

const BrokerFollowups = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowups = async () => {
    try {
      const res = await api.get('/broker/followups');
      setFollowups(res.data.followUps || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await api.put(`/broker/followups/${id}`, { status: newStatus });
      fetchFollowups();
    } catch (err) {
      alert('Failed to update follow-up');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#222222]">Follow-up Reminders & CRM</h1>
        <p className="text-xs text-gray-500 mt-1">Never miss a client call, negotiation milestone, or site visit follow-up.</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading reminders...</div>
        ) : followups.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No pending follow-ups.</div>
        ) : (
          followups.map((f) => (
            <div key={f._id} className="p-5 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition">
              <div className="flex items-start space-x-3.5">
                <input
                  type="checkbox"
                  checked={f.status === 'completed'}
                  onChange={() => handleToggleStatus(f._id, f.status)}
                  className="mt-1 h-4 w-4 rounded text-[#C62828] focus:ring-[#C62828]"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-[#222222]">{f.clientId?.name}</span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase px-1.5 py-0.5 rounded bg-gray-100">
                      {f.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{f.notes}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Property: <strong>{f.propertyId?.title}</strong> • Phone: {f.clientId?.phone}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-[#C62828] shrink-0">
                {new Date(f.scheduledDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BrokerFollowups;
