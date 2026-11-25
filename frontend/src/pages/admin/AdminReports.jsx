import React from 'react';
import { BarChart3, TrendingUp, Award, DollarSign } from 'lucide-react';

const AdminReports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#222222]">Brokerage Analytics & Reports</h1>
        <p className="text-xs text-gray-500 mt-1">Platform volume, conversion ratios, and broker leaderboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#EEEEEE] shadow-sm text-center">
          <TrendingUp className="w-8 h-8 text-[#C62828] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-gray-700">Enquiry-to-Visit Conversion</h3>
          <p className="text-3xl font-black text-[#222222] mt-2">68.4%</p>
          <span className="text-xs text-emerald-600 font-bold mt-1 block">↑ 12% vs last quarter</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#EEEEEE] shadow-sm text-center">
          <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-gray-700">Top Broker of Month</h3>
          <p className="text-xl font-black text-[#222222] mt-2">Vikram Singhania</p>
          <span className="text-xs text-gray-500 font-semibold mt-1 block">₹9.35 Cr deal volume closed</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#EEEEEE] shadow-sm text-center">
          <DollarSign className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-gray-700">Average Transaction Size</h3>
          <p className="text-3xl font-black text-[#222222] mt-2">₹4.2 Cr</p>
          <span className="text-xs text-gray-500 font-semibold mt-1 block">Across luxury & commercial</span>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
