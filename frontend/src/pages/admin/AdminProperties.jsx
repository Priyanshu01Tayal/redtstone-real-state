import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { Home, CheckCircle, XCircle, UserCheck, Shield, ExternalLink, AlertTriangle } from 'lucide-react';

const AdminProperties = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('approvalStatus') || 'all';

  const [properties, setProperties] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialStatus);

  // Approval modal state
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedBrokerId, setSelectedBrokerId] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchProperties = async () => {
    try {
      const [propsRes, brokersRes] = await Promise.all([
        api.get('/admin/properties'),
        api.get('/admin/users?role=broker'),
      ]);
      setProperties(propsRes.data.properties || []);
      setBrokers(brokersRes.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!selectedBrokerId) {
      alert('Please select an in-house broker to assign to this property');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/admin/properties/${selectedProperty._id}/approve`, {
        brokerId: selectedBrokerId,
        notes: approvalNotes,
      });
      alert('Property approved and broker assigned! Now public.');
      setApproveModalOpen(false);
      fetchProperties();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason) {
      alert('Please specify the reason for rejection');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/admin/properties/${selectedProperty._id}/reject`, {
        rejectionReason,
      });
      alert('Property rejected and feedback sent to the owner.');
      setRejectModalOpen(false);
      fetchProperties();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = properties.filter((p) => {
    if (filter === 'all') return true;
    return p.approvalStatus === filter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#222222]">Property Master Control & Approvals</h1>
        <p className="text-xs text-gray-500 mt-1">
          Review owner submissions, assign in-house brokers, and publish verified properties to the public marketplace.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 pb-2 text-xs font-bold">
        {[
          { key: 'all', label: `All (${properties.length})` },
          { key: 'pending', label: `Pending Approvals (${properties.filter((p) => p.approvalStatus === 'pending').length})` },
          { key: 'approved', label: `Published (${properties.filter((p) => p.approvalStatus === 'approved').length})` },
          { key: 'rejected', label: `Rejected (${properties.filter((p) => p.approvalStatus === 'rejected').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === tab.key ? 'bg-[#C62828] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Properties List */}
      <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading properties...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No properties in this category.</div>
        ) : (
          filtered.map((prop) => (
            <div key={prop._id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-gray-50/50 transition">
              <div className="flex items-start space-x-4 flex-1">
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
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                      prop.approvalStatus === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : prop.approvalStatus === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {prop.approvalStatus}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#222222]">{prop.title}</h3>
                  <p className="text-xs text-gray-500">{prop.address}, {prop.locality}, {prop.city} • ₹{prop.price?.toLocaleString('en-IN')}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
                    <span>Owner: <strong>{prop.ownerId?.name || 'Unknown'}</strong> ({prop.ownerId?.phone})</span>
                    {prop.assignedBrokerId ? (
                      <span className="text-[#C62828] font-bold">
                        Assigned Broker: {prop.assignedBrokerId.name}
                      </span>
                    ) : (
                      <span className="text-amber-600 font-bold">No Broker Assigned Yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 shrink-0">
                {prop.approvalStatus === 'pending' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedProperty(prop);
                        setSelectedBrokerId(brokers[0]?._id || '');
                        setApproveModalOpen(true);
                      }}
                      className="px-4 py-2 bg-[#2E7D32] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                    >
                      Approve & Assign Broker
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProperty(prop);
                        setRejectModalOpen(true);
                      }}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {prop.approvalStatus === 'approved' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedProperty(prop);
                        setSelectedBrokerId(prop.assignedBrokerId?._id || brokers[0]?._id || '');
                        setApproveModalOpen(true);
                      }}
                      className="px-3 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold rounded-xl"
                    >
                      Reassign Broker
                    </button>
                    <a
                      href={`/properties/${prop._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 border border-gray-200 text-gray-600 hover:text-[#C62828] rounded-xl"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Approve & Assign Broker Modal */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Approve Property & Assign In-House Broker"
      >
        <form onSubmit={handleApprove} className="space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800">
            Approving: <strong>{selectedProperty?.title}</strong>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Select In-House Broker to Represent this Property
            </label>
            <select
              value={selectedBrokerId}
              onChange={(e) => setSelectedBrokerId(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-gray-200 font-bold focus:outline-none"
            >
              <option value="">Choose an In-House Broker</option>
              {brokers.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.licenseNumber || 'License verified'} • {Array.isArray(b.specialization) ? b.specialization.join(', ') : b.specialization || 'Residential'})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400 mt-1">
              All client enquiries for this property will be routed exclusively to the selected broker.
            </p>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Assignment / Verification Notes</label>
            <textarea
              rows="3"
              placeholder="e.g. Title deed verified with local sub-registrar. High priority listing."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#2E7D32] text-white rounded-xl font-bold text-xs shadow-md"
          >
            {submitting ? 'Publishing...' : 'Approve, Assign Broker & Publish Publicly'}
          </button>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Property Submission"
      >
        <form onSubmit={handleReject} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Reason for Rejection</label>
            <textarea
              rows="3"
              required
              placeholder="e.g. Property price exceeds circle rate by 80%, or blurred deed photos provided. Please upload clear photos."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#C62828]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#C62828] text-white rounded-xl font-bold text-xs"
          >
            {submitting ? 'Rejecting...' : 'Confirm Rejection & Send Feedback to Owner'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProperties;
