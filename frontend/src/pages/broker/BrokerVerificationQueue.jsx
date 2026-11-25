import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Camera,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import api from '../../services/api';

const BrokerVerificationQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'schedule' | 'inspect' | 'recommend'

  // Schedule Modal State
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');

  // Inspection Checklist State
  const [checklist, setChecklist] = useState({
    addressVerified: true,
    specsVerified: true,
    legalDeedsReviewed: true,
    conditionRated: 4,
    photographsTaken: true,
    keysHandled: true,
  });
  const [discrepancies, setDiscrepancies] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [inspectionPhotos, setInspectionPhotos] = useState([]);

  // Recommendation State
  const [recommendation, setRecommendation] = useState('approved');
  const [recommendationReason, setRecommendationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/broker/verification-queue');
      setQueue(res.data.properties || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInspection = async () => {
    if (!scheduleDate) return alert('Please pick a scheduled inspection date');
    setActionLoading(true);
    try {
      await api.post('/broker/inspections', {
        propertyId: selectedProperty._id,
        scheduledDate: scheduleDate,
        notes: scheduleNotes,
      });
      alert('Physical inspection scheduled! Owner notified.');
      setActiveModal(null);
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddPhoto = () => {
    if (!photoUrl.trim()) return;
    setInspectionPhotos([...inspectionPhotos, { url: photoUrl.trim(), caption: 'Site Inspection' }]);
    setPhotoUrl('');
  };

  const handleSubmitRecommendation = async () => {
    setActionLoading(true);
    try {
      await api.post(`/broker/properties/${selectedProperty._id}/verification-recommendation`, {
        recommendation,
        recommendationReason,
        checklist,
      });
      alert('Verification recommendation successfully submitted to Admin for final publication approval!');
      setActiveModal(null);
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit recommendation');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#EEEEEE] shadow-sm">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FFCDD2] text-[#C62828] mb-1">
            Broker Territory Operations
          </span>
          <h1 className="text-2xl font-black text-[#222222]">Property Verification Queue</h1>
          <p className="text-sm text-[#777777]">
            Physically inspect submissions, verify ownership documents, and recommend approval to the Admin team.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 font-semibold block">Pending Verifications</span>
          <span className="text-3xl font-black text-[#C62828]">{queue.length}</span>
        </div>
      </div>

      {/* Queue List */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#EEEEEE]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#C62828] border-r-transparent"></div>
          <p className="text-sm text-gray-500 mt-2">Loading verification queue...</p>
        </div>
      ) : queue.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#EEEEEE]">
          <CheckCircle className="w-12 h-12 text-[#2E7D32] mx-auto mb-3" />
          <h3 className="font-bold text-lg text-[#222222]">Verification Queue Clean</h3>
          <p className="text-sm text-[#777777]">All owner properties in your area are verified and active.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {queue.map((prop) => {
            const owner = prop.ownerId || {};
            const inspection = prop.inspectionId || {};

            return (
              <div
                key={prop._id}
                className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Property Header */}
                  <div className="p-5 border-b border-[#EEEEEE] flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#C62828] bg-red-50 px-2 py-0.5 rounded">
                          {prop.purpose || prop.listingType} • {prop.propertyType}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            prop.verificationStatus === 'INSPECTION_COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : prop.verificationStatus === 'INSPECTION_SCHEDULED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {prop.verificationStatus}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-[#222222] line-clamp-1">{prop.title}</h3>
                      <p className="text-xs text-[#777777] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {prop.locality}, {prop.city}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-[#C62828] text-base">
                        ₹{(prop.price / 100000).toFixed(2)} L
                      </div>
                      <div className="text-xs text-gray-400">
                        {prop.bhk ? `${prop.bhk} BHK • ` : ''}
                        {prop.area} sq ft
                      </div>
                    </div>
                  </div>

                  {/* Owner Contact Box (Allowed for authorized broker verification) */}
                  <div className="p-4 bg-gray-50 border-b border-[#EEEEEE]">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Owner Information (Confidential)
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-[#222222]">{owner.name || 'Owner Name'}</div>
                        <div className="text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#C62828]" /> {owner.phone || 'Phone'}
                        </div>
                      </div>
                      <div className="text-right">
                        <a
                          href={`tel:${owner.phone}`}
                          className="px-3 py-1 bg-white border border-[#EEEEEE] rounded-lg text-xs font-bold text-[#C62828] hover:bg-red-50"
                        >
                          Call Owner
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Inspection Status snippet if present */}
                  {inspection._id && (
                    <div className="p-4 bg-blue-50/50 border-b border-blue-100 text-xs">
                      <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                        <ClipboardCheck className="w-4 h-4 text-blue-600" />
                        Inspection Status: <span className="uppercase">{inspection.status}</span>
                      </div>
                      {inspection.scheduledDate && (
                        <div className="text-blue-800">
                          Scheduled: {new Date(inspection.scheduledDate).toLocaleDateString()}
                        </div>
                      )}
                      {inspection.recommendation && (
                        <div className="font-semibold text-emerald-700 mt-1">
                          Recommendation: {inspection.recommendation.toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Broker Actions */}
                <div className="p-4 bg-white flex flex-wrap items-center justify-end gap-2 border-t border-[#EEEEEE]">
                  <button
                    onClick={() => {
                      setSelectedProperty(prop);
                      setActiveModal('schedule');
                    }}
                    className="px-3 py-1.5 bg-gray-100 text-xs font-bold text-gray-800 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Schedule Inspection
                  </button>

                  <button
                    onClick={() => {
                      setSelectedProperty(prop);
                      setActiveModal('inspect');
                    }}
                    className="px-3 py-1.5 bg-blue-50 text-xs font-bold text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    Fill Inspection Checklist
                  </button>

                  <button
                    onClick={() => {
                      setSelectedProperty(prop);
                      setActiveModal('recommend');
                    }}
                    className="px-4 py-1.5 bg-[#C62828] text-xs font-bold text-white rounded-lg hover:bg-[#B71C1C] transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Submit to Admin
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SCHEDULE INSPECTION MODAL */}
      {activeModal === 'schedule' && selectedProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-[#222222]">Schedule Physical Inspection</h3>
            <p className="text-xs text-[#777777]">
              Select date for site inspection. An automatic notification will be dispatched to owner{' '}
              <b>{selectedProperty.ownerId?.name}</b>.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Inspection Date</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Notes for Owner</label>
              <textarea
                rows={2}
                placeholder="e.g. Will meet at society gate to check registry documents and keys..."
                value={scheduleNotes}
                onChange={(e) => setScheduleNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleScheduleInspection}
                className="px-5 py-2 text-xs font-bold bg-[#C62828] text-white rounded-lg hover:bg-[#B71C1C]"
              >
                {actionLoading ? 'Scheduling...' : 'Confirm & Notify Owner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECTION CHECKLIST MODAL */}
      {activeModal === 'inspect' && selectedProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-lg text-[#222222]">Broker Physical Verification Checklist</h3>
            <p className="text-xs text-[#777777]">
              Property: <b>{selectedProperty.title}</b>
            </p>

            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
              {[
                { key: 'addressVerified', label: 'Physical Address & Society Verified' },
                { key: 'specsVerified', label: 'BHK, Area & Carpet Measurements Verified' },
                { key: 'legalDeedsReviewed', label: 'Ownership / Registry Deed Reviewed' },
                { key: 'photographsTaken', label: 'High-Res Photos & Video Captured' },
                { key: 'keysHandled', label: 'Key & Access Handover Coordinated' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                    className="w-4 h-4 text-[#C62828] rounded border-gray-300"
                  />
                  <span>{item.label}</span>
                </label>
              ))}

              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Overall Condition Rating (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setChecklist({ ...checklist, conditionRated: star })}
                      className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                        checklist.conditionRated === star
                          ? 'bg-[#C62828] text-white border-[#C62828]'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" /> {star} Star
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Discrepancies (if any)</label>
              <input
                type="text"
                placeholder="e.g. Actual carpet area 50 sq ft lower than declared"
                value={discrepancies}
                onChange={(e) => setDiscrepancies(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Internal Verification Notes</label>
              <textarea
                rows={2}
                placeholder="Property is well maintained, owner cooperative, high rental appeal..."
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Inspection checklist saved!');
                  setActiveModal('recommend');
                }}
                className="px-5 py-2 text-xs font-bold bg-[#2E7D32] text-white rounded-lg hover:bg-emerald-800"
              >
                Save & Proceed to Recommendation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECOMMENDATION TO ADMIN MODAL */}
      {activeModal === 'recommend' && selectedProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-[#222222]">Submit Recommendation to Admin</h3>
            <p className="text-xs text-[#777777]">
              Submit your formal broker recommendation for <b>{selectedProperty.title}</b>.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Recommendation</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'approved', label: 'Approve Listing', color: 'bg-emerald-600' },
                  { id: 'more_info_needed', label: 'Need Info', color: 'bg-amber-600' },
                  { id: 'rejected', label: 'Reject', color: 'bg-red-600' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRecommendation(r.id)}
                    className={`py-2 px-1 text-center font-bold text-xs rounded-xl border transition-all ${
                      recommendation === r.id
                        ? `${r.color} text-white shadow-md border-transparent`
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Rationale / Remarks for Admin</label>
              <textarea
                rows={3}
                placeholder="Clean property papers, prompt owner cooperation, prime locality appeal..."
                value={recommendationReason}
                onChange={(e) => setRecommendationReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleSubmitRecommendation}
                className="px-5 py-2 text-xs font-bold bg-[#C62828] text-white rounded-lg hover:bg-[#B71C1C]"
              >
                {actionLoading ? 'Submitting...' : 'Submit to Admin ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerVerificationQueue;
