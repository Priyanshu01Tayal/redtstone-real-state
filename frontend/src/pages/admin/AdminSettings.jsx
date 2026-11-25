import React, { useState } from 'react';
import { Settings, Save, ShieldCheck } from 'lucide-react';

const AdminSettings = () => {
  const [commissionRate, setCommissionRate] = useState(2.0);
  const [brokerShare, setBrokerShare] = useState(40);
  const [autoAssignment, setAutoAssignment] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#222222]">Brokerage Rules & Platform Settings</h1>
        <p className="text-xs text-gray-500 mt-1">Configure commission formulas, broker compensation models, and workflow rules.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EEEEEE] shadow-sm">
        {saved && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold">
            Brokerage rules updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#222222] border-b border-gray-100 pb-2">
              Default Commission Structure
            </h3>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Standard Brokerage Fee (%)</label>
              <input
                type="number"
                step="0.1"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 font-bold focus:outline-none focus:border-[#C62828]"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Standard baseline fee charged across property sales. Brokers can customize per negotiation.
              </p>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">In-House Broker Payout Share (%)</label>
              <input
                type="number"
                value={brokerShare}
                onChange={(e) => setBrokerShare(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 font-bold focus:outline-none focus:border-[#C62828]"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Percentage of gross commission allocated to the lead broker (e.g. 40% broker / 60% company).
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="font-bold text-sm text-[#222222] border-b border-gray-100 pb-2">
              Owner Privacy Rules
            </h3>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <span className="font-bold text-gray-800 block">Strict Owner Privacy Shield</span>
                <span className="text-[11px] text-gray-500">Prevent client API calls from ever returning owner contact numbers</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                ENFORCED
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl font-bold text-xs shadow-md transition"
          >
            Save Brokerage Configuration
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
