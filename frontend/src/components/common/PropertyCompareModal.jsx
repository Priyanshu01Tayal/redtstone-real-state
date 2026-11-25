import React from 'react';
import { X, Check, MapPin, Phone, ShieldCheck, IndianRupee, Layers } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import { useLanguage } from '../../context/LanguageContext';

function formatCompactPrice(price) {
  if (!price) return '0';
  if (price >= 10000000) return (price / 10000000).toFixed(2) + ' Cr';
  if (price >= 100000) return (price / 100000).toFixed(1) + ' Lakhs';
  return price.toLocaleString('en-IN');
}

const PropertyCompareModal = () => {
  const { comparedProperties, removeFromCompare, clearCompare, isCompareModalOpen, setIsCompareModalOpen } =
    useCompare();
  const { lang, t } = useLanguage();

  if (!isCompareModalOpen || comparedProperties.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C62828] bg-red-50 px-2 py-0.5 rounded">
              {lang === 'hi' ? 'साइड-बाय-साइड तुलना' : 'Side-by-Side Evaluation'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#222222] mt-1">
              {lang === 'hi' ? 'प्रॉपर्टी की तुलना करें' : 'Compare Selected Properties'} ({comparedProperties.length}/3)
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearCompare}
              className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors"
            >
              {lang === 'hi' ? 'सब हटाएं' : 'Clear All'}
            </button>
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table Comparison Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#EEEEEE]">
                <th className="p-3 w-44 font-bold text-gray-400 uppercase tracking-wider">Features</th>
                {comparedProperties.map((prop) => (
                  <th key={prop._id} className="p-3 min-w-[240px] max-w-[280px]">
                    <div className="relative group rounded-xl overflow-hidden mb-2">
                      <img
                        src={
                          prop.images?.[0]?.url ||
                          'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={prop.title}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <button
                        onClick={() => removeFromCompare(prop._id)}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="font-extrabold text-sm text-[#222222] line-clamp-2 leading-snug">
                      {prop.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C62828]" /> {prop.locality}, {prop.city}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EEEEEE]">
              {/* Price Row */}
              <tr className="bg-red-50/30">
                <td className="p-3 font-bold text-gray-700">Price / Rent</td>
                {comparedProperties.map((prop) => (
                  <td key={prop._id} className="p-3 font-black text-base text-[#C62828]">
                    ₹{formatCompactPrice(prop.price)}
                    <span className="text-xs font-semibold text-gray-500 ml-1">
                      {prop.purpose === 'rent' || prop.listingType === 'rent' ? '/mo' : ''}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Rate per sq ft */}
              <tr>
                <td className="p-3 font-bold text-gray-700">Rate / sq ft</td>
                {comparedProperties.map((prop) => (
                  <td key={prop._id} className="p-3 font-semibold text-gray-800">
                    ₹{prop.area > 0 ? Math.round(prop.price / prop.area) : 0}/sq ft
                  </td>
                ))}
              </tr>

              {/* Purpose & Type */}
              <tr>
                <td className="p-3 font-bold text-gray-700">Purpose & Category</td>
                {comparedProperties.map((prop) => (
                  <td key={prop._id} className="p-3 font-semibold text-gray-800 uppercase">
                    {prop.purpose || prop.listingType} • {prop.propertyType?.replace('_', ' ')}
                  </td>
                ))}
              </tr>

              {/* BHK & Layout */}
              <tr>
                <td className="p-3 font-bold text-gray-700">BHK / Bedrooms</td>
                {comparedProperties.map((prop) => (
                  <td key={prop._id} className="p-3 font-bold text-gray-800">
                    {prop.bhk ? `${prop.bhk} BHK` : `${prop.bedrooms || 0} Beds`} (
                    {prop.bathrooms || 0} Baths)
                  </td>
                ))}
              </tr>

              {/* Super & Carpet Area */}
              <tr>
                <td className="p-3 font-bold text-gray-700">Area Dimensions</td>
                {comparedProperties.map((prop) => (
                  <td key={prop._id} className="p-3 text-gray-800">
                    <b>{prop.area} sq ft</b> (Super)
                    {prop.carpetArea ? <span className="text-gray-500 block">Carpet: {prop.carpetArea} sq ft</span> : ''}
                  </td>
                ))}
              </tr>

              {/* Furnishing */}
              <tr>
                <td className="p-3 font-bold text-gray-700">Furnishing</td>
                {comparedProperties.map((prop) => (
                  <td key={prop._id} className="p-3 font-semibold capitalize text-gray-800">
                    {prop.furnishing || 'Unfurnished'}
                  </td>
                ))}
              </tr>

              {/* Floor & Facing */}
              <tr>
                <td className="p-3 font-bold text-gray-700">Floor & Facing</td>
                {comparedProperties.map((prop) => (
                  <td key={prop._id} className="p-3 text-gray-800">
                    Floor {prop.floorNumber || 1} of {prop.totalFloors || 4} • {prop.facing || 'East'} Facing
                  </td>
                ))}
              </tr>

              {/* Key Amenities */}
              <tr>
                <td className="p-3 font-bold text-gray-700">Amenities</td>
                {comparedProperties.map((prop) => (
                  <td key={prop._id} className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {prop.amenities?.slice(0, 5).map((a, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-semibold text-gray-700">
                          ✓ {a}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Certified In-House Broker */}
              <tr className="bg-gray-50">
                <td className="p-3 font-bold text-gray-700">Assigned Broker</td>
                {comparedProperties.map((prop) => {
                  const broker = prop.assignedBrokerId || {};
                  return (
                    <td key={prop._id} className="p-3">
                      <div className="font-bold text-gray-900">{broker.name || 'Senior In-House Broker'}</div>
                      <div className="text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#C62828]" /> {broker.phone || '+91 98110 00001'}
                      </div>
                      <div className="text-[10px] text-[#2E7D32] font-semibold mt-1">
                        ★ {broker.rating || '4.9'} Certified Agent
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Privacy Guarantee */}
        <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 text-xs text-[#2E7D32]">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>
            {lang === 'hi'
              ? 'रेडस्टोन गारंटी: सभी संपत्तियों का मालिकाना हक सत्यापित है। मालिक का व्यक्तिगत नंबर सुरक्षित रखा जाता है।'
              : 'Redstone Guarantee: All listings are physically verified. Owner contact numbers are shielded from direct solicitation.'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCompareModal;
