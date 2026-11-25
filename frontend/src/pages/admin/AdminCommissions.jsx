import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react';

const AdminCommissions = () => {
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  // Payment update modal
  const [selectedComm, setSelectedComm] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [paymentRef, setPaymentRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCommissions = async () => {
    try {
      const res = await api.get('/deals/commissions');
      setCommissions(res.data.commissions || []);
      setSummary(res.data.summary || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    if (!selectedComm) return;
    setSubmitting(true);

    try {
      await api.put(`/deals/commissions/${selectedComm._id}/payment`, {
        paymentStatus,
        paymentReference: paymentRef,
      });
      alert('Commission payment status updated and broker notified!');
      setModalOpen(false);
      fetchCommissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#222222]">Brokerage & Commission Management</h1>
        <p className="text-xs text-gray-500 mt-1">
          Track property transaction value, brokerage percentage or fixed fees, payment status, broker share vs company revenue.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <span className="text-xs font-bold text-gray-500">Gross Commission</span>
          <p className="text-2xl sm:text-3xl font-black text-[#222222] mt-1">
            ₹{((summary.totalCommission || 0) / 100000).toFixed(2)}L
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">Total fee volume</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <span className="text-xs font-bold text-emerald-600">Company Revenue</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
            ₹{((summary.companyRevenue || 0) / 100000).toFixed(2)}L
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">Retained by brokerage</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <span className="text-xs font-bold text-blue-600">Broker Incentive Share</span>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">
            ₹{((summary.brokerEarnings || 0) / 100000).toFixed(2)}L
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">Allocated to in-house brokers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <span className="text-xs font-bold text-[#C62828]">Pending Collections</span>
          <p className="text-2xl sm:text-3xl font-black text-[#C62828] mt-1">
            ₹{((summary.pendingCommission || 0) / 100000).toFixed(2)}L
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">Awaiting settlement</span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading commission ledger...</div>
        ) : commissions.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No commission records found.</div>
        ) : (
          commissions.map((comm) => (
            <div key={comm._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition">
              <div className="space-y-1.5 flex-1 text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full ${
                    comm.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {comm.paymentStatus}
                  </span>
                  <span className="text-gray-400 font-semibold">
                    Deal Date: {new Date(comm.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#222222]">{comm.propertyId?.title}</h3>
                <p className="text-gray-500">
                  Deal Value: <strong>₹{comm.propertyValue?.toLocaleString('en-IN')}</strong> ({comm.commissionRate}% total rate • Paid by: {comm.commissionPayer})
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <span className="text-[10px] text-gray-400 block font-bold">Total Commission</span>
                    <p className="font-bold text-[#222222]">₹{comm.totalCommissionAmount?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <span className="text-[10px] text-emerald-700 block font-bold">Company Revenue (60%)</span>
                    <p className="font-bold text-emerald-800">₹{comm.companyRevenueAmount?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <span className="text-[10px] text-blue-700 block font-bold">
                      Broker Share (40% - {comm.brokerId?.name})
                    </span>
                    <p className="font-bold text-blue-800">₹{comm.brokerCommissionAmount?.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {comm.paymentReference && (
                  <p className="text-[11px] text-gray-500">
                    Payment Reference: <strong>{comm.paymentReference}</strong> (Paid on {new Date(comm.paymentDate).toLocaleDateString()})
                  </p>
                )}
              </div>

              {/* Action */}
              <div className="shrink-0">
                <button
                  onClick={() => {
                    setSelectedComm(comm);
                    setPaymentStatus(comm.paymentStatus);
                    setPaymentRef(comm.paymentReference || '');
                    setModalOpen(true);
                  }}
                  className="px-4 py-2 border border-gray-200 hover:border-[#C62828] text-xs font-bold text-gray-800 rounded-xl transition"
                >
                  Update Payment Status
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Update Commission Payment Status"
      >
        <form onSubmit={handleUpdatePayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-bold"
            >
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid & Disbursed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Transaction / Reference ID</label>
            <input
              type="text"
              placeholder="e.g. NEFT-REDSTONE-TXN88910"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#C62828] text-white rounded-xl font-bold text-xs"
          >
            {submitting ? 'Updating...' : 'Save Payment Status'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCommissions;
