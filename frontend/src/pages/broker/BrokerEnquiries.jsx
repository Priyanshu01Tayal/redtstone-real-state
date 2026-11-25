import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { MessageSquare, Phone, Mail, Clock, Calendar, CheckCircle } from 'lucide-react';

const BrokerEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status modal
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('contacted');
  const [noteText, setNoteText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Visit schedule modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('11:00 AM');
  const [visitNotes, setVisitNotes] = useState('');

  const fetchEnquiries = async () => {
    try {
      const res = await api.get('/enquiries/broker');
      setEnquiries(res.data.enquiries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    setSubmitting(true);
    try {
      await api.put(`/enquiries/${selectedEnquiry._id}/status`, {
        status: newStatus,
        noteText,
      });
      setStatusModalOpen(false);
      setNoteText('');
      fetchEnquiries();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    setSubmitting(true);
    try {
      await api.post('/visits', {
        enquiryId: selectedEnquiry._id,
        propertyId: selectedEnquiry.propertyId?._id,
        clientId: selectedEnquiry.clientId?._id,
        scheduledDate: visitDate,
        scheduledTime: visitTime,
        brokerNotes: visitNotes,
      });
      alert('Property visit scheduled! Owner notified.');
      setScheduleModalOpen(false);
      fetchEnquiries();
    } catch (err) {
      alert(err.response?.data?.message || 'Schedule failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#222222]">Client Enquiries & Leads</h1>
        <p className="text-xs text-gray-500 mt-1">
          Follow up with clients, update lead status, and coordinate site tours directly with owners.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading enquiries...</div>
        ) : enquiries.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No enquiries received yet.</div>
        ) : (
          enquiries.map((enq) => (
            <div key={enq._id} className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:bg-gray-50/50 transition">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${
                    enq.status === 'new' ? 'bg-red-100 text-[#C62828]' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {enq.status?.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-gray-400 font-semibold">
                    Received {new Date(enq.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <h3 className="font-bold text-sm text-[#222222]">{enq.clientName}</h3>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#C62828]" /> {enq.clientPhone}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#C62828]" /> {enq.clientEmail}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                  "{enq.message}"
                </p>

                <div className="flex items-center space-x-4 text-xs text-gray-500 pt-1">
                  <span>Property: <strong>{enq.propertyId?.title}</strong></span>
                  <span>Target Budget: <strong>₹{enq.budget?.toLocaleString('en-IN') || 'Flexible'}</strong></span>
                  <span>Preferred Time: <strong>{enq.preferredTime}</strong></span>
                </div>

                {/* Notes History */}
                {enq.notes && enq.notes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Recent Follow-up Notes:</span>
                    {enq.notes.map((n, idx) => (
                      <p key={idx} className="text-[11px] text-gray-600 bg-white p-2 rounded-lg border border-gray-100">
                        • {n.text}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col items-center md:items-end space-y-2 shrink-0">
                <button
                  onClick={() => {
                    setSelectedEnquiry(enq);
                    setNewStatus(enq.status);
                    setStatusModalOpen(true);
                  }}
                  className="w-full px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-xs font-bold rounded-xl transition"
                >
                  Update Status / Add Note
                </button>

                <button
                  onClick={() => {
                    setSelectedEnquiry(enq);
                    setScheduleModalOpen(true);
                  }}
                  className="w-full px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" /> Schedule Visit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Enquiry Pipeline"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted Client</option>
              <option value="visit_requested">Visit Requested</option>
              <option value="negotiation">In Price Negotiation</option>
              <option value="closed_won">Closed Won (Deal Signed)</option>
              <option value="closed_lost">Closed Lost</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Add Follow-up Note</label>
            <textarea
              rows="3"
              placeholder="e.g. Spoke on call. Client interested in making token advance next Monday."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#C62828]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#C62828] text-white rounded-xl font-bold text-xs"
          >
            {submitting ? 'Saving...' : 'Save Enquiry Updates'}
          </button>
        </form>
      </Modal>

      {/* Schedule Visit Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Property Visit with Owner"
      >
        <form onSubmit={handleScheduleVisit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Visit Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Time Slot</label>
              <select
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200"
              >
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:30 PM">05:30 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Inspection Notes / Client Requirements</label>
            <textarea
              rows="3"
              placeholder="e.g. Client requested to check society clubhouse and parking bay allotment."
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#C62828] text-white rounded-xl font-bold text-xs"
          >
            {submitting ? 'Scheduling...' : 'Save & Automatically Alert Property Owner'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default BrokerEnquiries;
