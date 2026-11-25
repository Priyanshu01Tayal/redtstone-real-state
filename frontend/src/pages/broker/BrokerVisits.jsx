import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { Calendar, Clock, CheckCircle, XCircle, RotateCcw, User, Phone, MapPin } from 'lucide-react';

const BrokerVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Status update modal
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState('Confirmed');
  const [brokerNotes, setBrokerNotes] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchVisits = async () => {
    try {
      const res = await api.get('/visits/broker');
      setVisits(res.data.visits || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleUpdateVisit = async (e) => {
    e.preventDefault();
    if (!selectedVisit) return;
    setSubmitting(true);

    try {
      await api.put(`/visits/${selectedVisit._id}/status`, {
        status,
        brokerNotes,
        scheduledDate: newDate || undefined,
        scheduledTime: newTime || undefined,
        rescheduleReason: rescheduleReason || undefined,
      });
      setModalOpen(false);
      fetchVisits();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = visits.filter((v) => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      return new Date(v.scheduledDate).toISOString().split('T')[0] === todayStr;
    }
    return v.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#222222]">Property Visits Workflow</h1>
        <p className="text-xs text-gray-500 mt-1">
          Coordinate schedules between property owners and clients. Update visit outcomes and progress leads.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 pb-2 text-xs font-bold overflow-x-auto">
        {[
          { key: 'all', label: 'All Visits' },
          { key: 'today', label: "Today's Schedule" },
          { key: 'Scheduled', label: 'Scheduled' },
          { key: 'Confirmed', label: 'Confirmed' },
          { key: 'Completed', label: 'Completed' },
          { key: 'Cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              filter === tab.key ? 'bg-[#C62828] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading visit schedules...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No visits found in this view.</div>
        ) : (
          filtered.map((v) => (
            <div key={v._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full ${
                    v.status === 'Confirmed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : v.status === 'Completed'
                      ? 'bg-blue-100 text-blue-800'
                      : v.status === 'Cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {v.status}
                  </span>

                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    v.ownerConfirmation === 'confirmed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    Owner: {v.ownerConfirmation === 'confirmed' ? 'Availability Confirmed ✓' : 'Awaiting Confirmation'}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#222222]">{v.propertyId?.title}</h3>
                <p className="text-xs text-gray-500">{v.propertyId?.address}, {v.propertyId?.locality}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-2.5 bg-[#F8F8F8] rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Client</span>
                    <p className="font-bold text-[#222222]">{v.clientId?.name}</p>
                    <p className="text-gray-500">{v.clientId?.phone} • {v.clientId?.email}</p>
                  </div>

                  <div className="p-2.5 bg-[#F8F8F8] rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Property Owner</span>
                    <p className="font-bold text-[#222222]">{v.ownerId?.name}</p>
                    <p className="text-gray-500">{v.ownerId?.phone}</p>
                  </div>
                </div>

                {v.ownerNotes && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-100">
                    <strong>Owner Note:</strong> {v.ownerNotes}
                  </p>
                )}

                {v.brokerNotes && (
                  <p className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <strong>Broker Note:</strong> {v.brokerNotes}
                  </p>
                )}
              </div>

              {/* Scheduled Time & Actions */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-sm font-black text-[#C62828] block">
                    {new Date(v.scheduledDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-xs font-bold text-gray-700">{v.scheduledTime}</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedVisit(v);
                    setStatus(v.status);
                    setBrokerNotes(v.brokerNotes || '');
                    setModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#C62828] text-white text-xs font-bold rounded-xl hover:bg-[#B71C1C] transition shadow-sm"
                >
                  Manage Visit & Notes
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Visit Status / Reschedule Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Update Property Visit Workflow"
      >
        <form onSubmit={handleUpdateVisit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Visit Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-bold focus:outline-none"
            >
              <option value="Requested">Requested</option>
              <option value="Proposed">Proposed to Owner</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed with Client</option>
              <option value="Completed">Completed (Visit Done)</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="No Show">No Show</option>
            </select>
          </div>

          {status === 'Rescheduled' && (
            <div className="p-3 bg-amber-50 rounded-xl space-y-3 border border-amber-200">
              <span className="font-bold text-amber-900 block">Reschedule Details:</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="p-2 rounded-lg border border-gray-200 text-xs"
                />
                <input
                  type="text"
                  placeholder="e.g. 03:30 PM"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="p-2 rounded-lg border border-gray-200 text-xs"
                />
              </div>
              <input
                type="text"
                placeholder="Reason for rescheduling..."
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-200 text-xs"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-700 mb-1">Broker Notes / Inspection Outcome</label>
            <textarea
              rows="3"
              placeholder="e.g. Client loved the terrace view. Preparing price offer for owner."
              value={brokerNotes}
              onChange={(e) => setBrokerNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#C62828]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#C62828] text-white rounded-xl font-bold text-xs shadow-md"
          >
            {submitting ? 'Updating...' : 'Save & Notify Stakeholders'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default BrokerVisits;
