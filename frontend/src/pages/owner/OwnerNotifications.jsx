import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Bell, Check, Clock, Calendar, CheckCircle, RotateCcw } from 'lucide-react';
import Modal from '../../components/common/Modal';

const OwnerNotifications = () => {
  const { notifications, refreshNotifications, markAsRead, markAllAsRead } = useSocket();
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [confirmationType, setConfirmationType] = useState('confirmed');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRespondToVisit = async (e) => {
    e.preventDefault();
    if (!selectedVisit) return;
    setSubmitting(true);

    try {
      await api.put(`/visits/${selectedVisit}/owner-confirmation`, {
        confirmation: confirmationType,
        notes,
      });
      alert(`Visit marked as ${confirmationType}`);
      setResponseModalOpen(false);
      refreshNotifications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update visit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#222222]">Notifications & Alerts</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time alerts on enquiries, scheduled visits, and property approvals</p>
        </div>

        <button
          onClick={markAllAsRead}
          className="text-xs font-bold text-[#C62828] hover:underline flex items-center gap-1"
        >
          <Check className="w-3.5 h-3.5" /> Mark all read
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm divide-y divide-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            No notifications yet
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-5 flex items-start justify-between gap-4 transition ${
                !notif.isRead ? 'bg-[#FFEBEE]/30' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    notif.type.includes('visit')
                      ? 'bg-blue-100 text-blue-700'
                      : notif.type.includes('enquiry')
                      ? 'bg-red-100 text-[#C62828]'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>

                <div>
                  <h4 className="font-bold text-xs text-[#222222]">{notif.title}</h4>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Respond to Visit Action if relatedEntity is Visit */}
              {notif.relatedEntity?.entityType === 'Visit' && notif.relatedEntity?.entityId && (
                <button
                  onClick={() => {
                    setSelectedVisit(notif.relatedEntity.entityId);
                    setResponseModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#C62828] text-white text-[11px] font-bold rounded-xl shrink-0 hover:bg-[#B71C1C] transition"
                >
                  Confirm / Reschedule
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Response Modal */}
      <Modal
        isOpen={responseModalOpen}
        onClose={() => setResponseModalOpen(false)}
        title="Respond to Visit Request"
      >
        <form onSubmit={handleRespondToVisit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-2">Availability Decision</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmationType('confirmed')}
                className={`py-3 rounded-xl font-bold border transition ${
                  confirmationType === 'confirmed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                ✓ Confirm Schedule
              </button>

              <button
                type="button"
                onClick={() => setConfirmationType('change_requested')}
                className={`py-3 rounded-xl font-bold border transition ${
                  confirmationType === 'change_requested'
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                ↻ Request Different Time
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {confirmationType === 'confirmed' ? 'Notes for Broker (e.g. key location, gate pass)' : 'Suggested alternative time'}
            </label>
            <textarea
              rows="3"
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Saturday afternoon works better for us, or keys are at clubhouse..."
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#C62828]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#C62828] text-white rounded-xl font-bold text-xs shadow-md"
          >
            {submitting ? 'Sending Response...' : 'Submit Response to Broker'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default OwnerNotifications;
