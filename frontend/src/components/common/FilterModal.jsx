import React from 'react';
import { X, Check, SlidersHorizontal, RotateCcw } from 'lucide-react';

const FilterModal = ({
  isOpen,
  onClose,
  filters,
  onChangeFilter,
  onResetFilters,
  onApplyFilters,
  totalResults = 0,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#EBEBEB] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EBEBEB] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-[#717171] hover:text-[#222222] transition"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-extrabold text-base text-[#222222]">Filters</h3>
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-bold text-[#717171] hover:text-[#C62828] underline transition"
          >
            Clear all
          </button>
        </div>

        {/* Filter Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#222222]">
          {/* Type of Place (Buy vs Rent) */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#222222]">Type of Place</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChangeFilter('listingType', 'sale')}
                className={`py-3 px-4 rounded-2xl border font-bold text-xs transition ${
                  filters.listingType === 'sale'
                    ? 'border-[#222222] bg-[#222222] text-white shadow'
                    : 'border-[#EBEBEB] hover:border-gray-300 bg-white text-[#222222]'
                }`}
              >
                🏠 Buy Property
              </button>
              <button
                type="button"
                onClick={() => onChangeFilter('listingType', 'rent')}
                className={`py-3 px-4 rounded-2xl border font-bold text-xs transition ${
                  filters.listingType === 'rent'
                    ? 'border-[#222222] bg-[#222222] text-white shadow'
                    : 'border-[#EBEBEB] hover:border-gray-300 bg-white text-[#222222]'
                }`}
              >
                🔑 Rent / Lease
              </button>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 pt-4 border-t border-[#EBEBEB]">
            <h4 className="font-bold text-sm text-[#222222]">Price Range</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl border border-[#EBEBEB] bg-[#F7F7F7]">
                <label className="block text-[10px] font-bold text-[#717171] uppercase">Minimum Price (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 2000000"
                  value={filters.minPrice || ''}
                  onChange={(e) => onChangeFilter('minPrice', e.target.value)}
                  className="w-full bg-transparent font-bold text-[#222222] text-sm focus:outline-none mt-1"
                />
              </div>
              <div className="p-3 rounded-2xl border border-[#EBEBEB] bg-[#F7F7F7]">
                <label className="block text-[10px] font-bold text-[#717171] uppercase">Maximum Price (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 15000000"
                  value={filters.maxPrice || ''}
                  onChange={(e) => onChangeFilter('maxPrice', e.target.value)}
                  className="w-full bg-transparent font-bold text-[#222222] text-sm focus:outline-none mt-1"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms */}
          <div className="space-y-3 pt-4 border-t border-[#EBEBEB]">
            <h4 className="font-bold text-sm text-[#222222]">Bedrooms (BHK)</h4>
            <div className="flex flex-wrap gap-2">
              {['', '1', '2', '3', '4', '5'].map((bhk) => (
                <button
                  key={bhk || 'any'}
                  type="button"
                  onClick={() => onChangeFilter('bedrooms', bhk)}
                  className={`px-4 py-2.5 rounded-full border text-xs font-bold transition ${
                    filters.bedrooms === bhk
                      ? 'border-[#222222] bg-[#222222] text-white'
                      : 'border-[#EBEBEB] hover:border-gray-400 bg-white text-[#222222]'
                  }`}
                >
                  {bhk === '' ? 'Any' : `${bhk} BHK`}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div className="space-y-3 pt-4 border-t border-[#EBEBEB]">
            <h4 className="font-bold text-sm text-[#222222]">Bathrooms</h4>
            <div className="flex flex-wrap gap-2">
              {['', '1', '2', '3', '4'].map((bath) => (
                <button
                  key={bath || 'any'}
                  type="button"
                  onClick={() => onChangeFilter('bathrooms', bath)}
                  className={`px-4 py-2.5 rounded-full border text-xs font-bold transition ${
                    filters.bathrooms === bath
                      ? 'border-[#222222] bg-[#222222] text-white'
                      : 'border-[#EBEBEB] hover:border-gray-400 bg-white text-[#222222]'
                  }`}
                >
                  {bath === '' ? 'Any' : `${bath}+ Baths`}
                </button>
              ))}
            </div>
          </div>

          {/* Furnishing */}
          <div className="space-y-3 pt-4 border-t border-[#EBEBEB]">
            <h4 className="font-bold text-sm text-[#222222]">Furnishing Status</h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '', label: 'Any' },
                { id: 'furnished', label: 'Furnished' },
                { id: 'semi-furnished', label: 'Semi-Furnished' },
                { id: 'unfurnished', label: 'Unfurnished' },
              ].map((item) => (
                <button
                  key={item.id || 'any'}
                  type="button"
                  onClick={() => onChangeFilter('furnishing', item.id)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition text-center ${
                    filters.furnishing === item.id
                      ? 'border-[#222222] bg-[#222222] text-white'
                      : 'border-[#EBEBEB] hover:border-gray-300 bg-white text-[#222222]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-3 pt-4 border-t border-[#EBEBEB]">
            <h4 className="font-bold text-sm text-[#222222]">Sort Listings</h4>
            <select
              value={filters.sort || 'latest'}
              onChange={(e) => onChangeFilter('sort', e.target.value)}
              className="w-full p-3 rounded-2xl border border-[#EBEBEB] font-bold text-xs bg-[#F7F7F7] focus:outline-none"
            >
              <option value="latest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="featured">Featured First</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#EBEBEB] bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-bold text-[#717171] hover:text-[#C62828] underline"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() => {
              onApplyFilters();
              onClose();
            }}
            className="px-6 py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-2xl font-bold text-xs shadow-md transition"
          >
            Show Properties {totalResults > 0 ? `(${totalResults})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
