import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { DollarSign, CheckCircle2, TrendingUp, PlusCircle } from 'lucide-react';

const BrokerDeals = () => {
  const [deals, setDeals] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Deal Modal
  const [newDealModalOpen, setNewDealModalOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [dealType, setDealType] = useState('sale');
  const [commissionRate, setCommissionRate] = useState(2.0);
  const [terms, setTerms] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [dealsRes, commRes, propsRes] = await Promise.all([
        api.get('/deals'),
        api.get('/deals/commissions'),
        api.get('/broker/properties'),
      ]);
      setDeals(dealsRes.data.deals || []);
      setCommissions(commRes.data.commissions || []);
      setProperties(propsRes.data.properties || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/deals', {
        propertyId: selectedPropertyId,
        clientId: selectedClientId || undefined,
        dealType,
        finalPrice: Number(finalPrice),
        status: 'closed',
        commissionRate: Number(commissionRate),
        termsAndConditions: terms,
      });
      alert('Deal recorded and commission created!');
      setNewDealModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create deal');
    } finally {
      setSubmitting(false);
    }
  };

  const totalCommission = commissions.reduce((sum, c) => sum + (c.brokerCommissionAmount || 0), 0);
  const paidCommission = commissions
    .filter((c) => c.paymentStatus === 'paid')
    .reduce((sum, c) => sum + (c.brokerCommissionAmount || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#222222]">Deals & Broker Commissions</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track closed sales, lease contracts, and your verified commission payout shares.
          </p>
        </div>

        <button
          onClick={() => setNewDealModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-[#C62828] hover:bg-[#B71C1C] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Closed Deal</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <span className="text-xs font-bold text-gray-500">Total Deals Closed</span>
          <p className="text-3xl font-black text-[#222222] mt-1">{deals.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <span className="text-xs font-bold text-emerald-600">Total Broker Commission</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">₹{totalCommission.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <span className="text-xs font-bold text-blue-600">Paid Out</span>
          <p className="text-3xl font-black text-blue-600 mt-1">₹{paidCommission.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Commission Ledger */}
      <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 font-bold text-sm text-[#222222]">
          Broker Commission Payout Ledger
        </div>

        {commissions.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No commission records yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {commissions.map((comm) => (
              <div key={comm._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-[#222222]">{comm.propertyId?.title}</h4>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    Property Deal Value: <strong>₹{comm.propertyValue?.toLocaleString('en-IN')}</strong> ({comm.commissionRate}% total fee)
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Total Brokerage: ₹{comm.totalCommissionAmount?.toLocaleString('en-IN')} • Company Revenue: ₹{comm.companyRevenueAmount?.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-emerald-600 block">
                    Your Share: ₹{comm.brokerCommissionAmount?.toLocaleString('en-IN')}
                  </span>
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase mt-1 ${
                    comm.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {comm.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Deal Modal */}
      <Modal
        isOpen={newDealModalOpen}
        onClose={() => setNewDealModalOpen(false)}
        title="Record Closed Deal & Commission"
      >
        <form onSubmit={handleCreateDeal} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Select Property</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-gray-200"
            >
              <option value="">Select an assigned property</option>
              {properties.map((p) => (
                <option key={p._id} value={p._id}>{p.title} (₹{p.price?.toLocaleString('en-IN')})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Final Agreed Price (₹)</label>
              <input
                type="number"
                required
                placeholder="e.g. 48000000"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Total Commission Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Deal Terms / Paperwork Notes</label>
            <textarea
              rows="3"
              placeholder="e.g. Agreement to sell executed. Registry scheduled for next month."
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#C62828] text-white rounded-xl font-bold text-xs"
          >
            {submitting ? 'Recording...' : 'Close Deal & Generate Commission Share'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default BrokerDeals;
