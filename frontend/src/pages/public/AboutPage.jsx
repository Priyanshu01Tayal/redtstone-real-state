import React from 'react';
import { Building2, ShieldCheck, Users, Award, CheckCircle, Phone, Mail, MapPin } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 bg-red-50 text-[#C62828] font-bold text-xs uppercase rounded-full">
          About RedStone Realty
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#222222]">
          Reinventing Real Estate Brokerage in India
        </h1>
        <p className="text-gray-600 text-base leading-relaxed">
          Founded on the conviction that property owners deserve complete privacy and buyers deserve unbiased, professional guidance, RedStone is an institutional managed brokerage.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-[#EEEEEE] shadow-sm text-center">
          <div className="w-14 h-14 bg-red-50 text-[#C62828] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-[#222222] mb-2">Owner Privacy Shield</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            We never publish owner phone numbers or private details. Our in-house brokers act as the single dedicated point of contact.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#EEEEEE] shadow-sm text-center">
          <div className="w-14 h-14 bg-red-50 text-[#C62828] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-[#222222] mb-2">Dedicated In-House Team</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Unlike aggregators who sell leads to random third-party agents, all RedStone brokers are licensed, salaried professionals.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#EEEEEE] shadow-sm text-center">
          <div className="w-14 h-14 bg-red-50 text-[#C62828] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-[#222222] mb-2">Verified RERA Legalities</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Every property undergoes physical inspection and title deed clearance by our legal compliance team before publication.
          </p>
        </div>
      </div>

      {/* Leadership */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EEEEEE] shadow-sm">
        <h2 className="text-2xl font-black text-[#222222] text-center mb-8">Executive Leadership</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
              alt="Devraj Chauhan"
              className="w-28 h-28 rounded-2xl object-cover mx-auto mb-3 border-2 border-[#C62828]"
            />
            <h4 className="font-bold text-sm text-[#222222]">Devraj Chauhan</h4>
            <p className="text-xs text-[#C62828] font-semibold">Managing Director & Principal Broker</p>
            <p className="text-[11px] text-gray-400 mt-1">18+ years in commercial & luxury advisory</p>
          </div>

          <div className="text-center">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
              alt="Vikram Singhania"
              className="w-28 h-28 rounded-2xl object-cover mx-auto mb-3 border-2 border-[#C62828]"
            />
            <h4 className="font-bold text-sm text-[#222222]">Vikram Singhania</h4>
            <p className="text-xs text-[#C62828] font-semibold">Head of Residential & Luxury Sales</p>
            <p className="text-[11px] text-gray-400 mt-1">Lead advisor for high-net-worth portfolios</p>
          </div>

          <div className="text-center">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
              alt="Ananya Deshmukh"
              className="w-28 h-28 rounded-2xl object-cover mx-auto mb-3 border-2 border-[#C62828]"
            />
            <h4 className="font-bold text-sm text-[#222222]">Ananya Deshmukh</h4>
            <p className="text-xs text-[#C62828] font-semibold">Head of Commercial Leasing & Retail</p>
            <p className="text-[11px] text-gray-400 mt-1">Grade-A IT parks & corporate relocations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
