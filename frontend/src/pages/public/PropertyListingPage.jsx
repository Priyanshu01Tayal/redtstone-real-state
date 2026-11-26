import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import PropertyCard from '../../components/common/PropertyCard';
import CategoryBar from '../../components/common/CategoryBar';
import FilterModal from '../../components/common/FilterModal';
import {
  Search,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Home,
  X,
} from 'lucide-react';

const PropertyListingPage = ({
  defaultListingType = '',
  defaultCategory = '',
  title = 'Properties',
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [locality, setLocality] = useState(searchParams.get('locality') || '');
  const [listingType, setListingType] = useState(defaultListingType || searchParams.get('listingType') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [category, setCategory] = useState(defaultCategory || searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [bathrooms, setBathrooms] = useState(searchParams.get('bathrooms') || '');
  const [furnishing, setFurnishing] = useState(searchParams.get('furnishing') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (locality) params.locality = locality;
      if (listingType) params.listingType = listingType;
      if (propertyType) params.propertyType = propertyType;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (bedrooms) params.bedrooms = bedrooms;
      if (bathrooms) params.bathrooms = bathrooms;
      if (furnishing) params.furnishing = furnishing;
      if (sort) params.sort = sort;
      params.page = page;
      params.limit = 12;

      const res = await api.get('/properties', { params });
      setProperties(res.data.properties || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page, sort, listingType, category, propertyType]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchProperties();
  };

  const handleReset = () => {
    setSearch('');
    setLocality('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setFurnishing('');
    setSort('latest');
    setPage(1);
    setTimeout(fetchProperties, 50);
  };

  const activeFiltersList = [
    search && { key: 'search', label: `Keyword: ${search}`, clear: () => setSearch('') },
    locality && { key: 'locality', label: `Locality: ${locality}`, clear: () => setLocality('') },
    propertyType && { key: 'propertyType', label: propertyType.replace('_', ' '), clear: () => setPropertyType('') },
    minPrice && { key: 'minPrice', label: `Min ₹${minPrice}`, clear: () => setMinPrice('') },
    maxPrice && { key: 'maxPrice', label: `Max ₹${maxPrice}`, clear: () => setMaxPrice('') },
    bedrooms && { key: 'bedrooms', label: `${bedrooms} BHK`, clear: () => setBedrooms('') },
    furnishing && { key: 'furnishing', label: furnishing, clear: () => setFurnishing('') },
  ].filter(Boolean);

  const filterObject = {
    listingType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    furnishing,
    sort,
  };

  const handleFilterChange = (key, val) => {
    if (key === 'listingType') setListingType(val);
    else if (key === 'minPrice') setMinPrice(val);
    else if (key === 'maxPrice') setMaxPrice(val);
    else if (key === 'bedrooms') setBedrooms(val);
    else if (key === 'bathrooms') setBathrooms(val);
    else if (key === 'furnishing') setFurnishing(val);
    else if (key === 'sort') setSort(val);
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#222222]">
      {/* Category Bar */}
      <CategoryBar
        selectedCategory={propertyType}
        onSelectCategory={(cat) => {
          setPropertyType(cat);
          setPage(1);
        }}
        onOpenFilters={() => setIsFilterModalOpen(true)}
        activeFilterCount={activeFiltersList.length}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EBEBEB]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight">{title}</h1>
            <p className="text-xs text-[#717171] mt-1">
              Found {total} verified properties managed exclusively by RedStone In-House Brokers
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            {/* Quick Keyword Search Input */}
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#717171] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search location, society..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                className="w-full pl-8 pr-3 py-2 bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl text-xs font-semibold text-[#222222] focus:outline-none"
              />
            </div>

            {/* Filter Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-[#EBEBEB] hover:border-gray-400 font-bold text-xs transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3 py-2 text-xs font-bold text-[#222222] focus:outline-none cursor-pointer"
            >
              <option value="latest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="featured">Featured First</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersList.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] font-bold text-[#717171] uppercase mr-1">Active Filters:</span>
            {activeFiltersList.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100 text-[#222222] font-semibold text-xs border border-gray-200"
              >
                <span>{f.label}</span>
                <button
                  type="button"
                  onClick={() => {
                    f.clear();
                    setTimeout(fetchProperties, 50);
                  }}
                  className="hover:text-[#C62828] p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-[#C62828] hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="space-y-3 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-2xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#EBEBEB] max-w-lg mx-auto space-y-4 my-8">
            <div className="w-14 h-14 bg-red-50 text-[#C62828] rounded-full flex items-center justify-center mx-auto">
              <Home className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#222222]">No properties found</h3>
            <p className="text-xs text-[#717171] leading-relaxed">
              We couldn't find any listings matching your search. Try resetting your filters to see more homes.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 bg-[#222222] hover:bg-[#C62828] text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Property Grid (Airbnb 4-column responsive) */}
        {!loading && properties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {properties.map((prop) => (
              <PropertyCard key={prop._id} property={prop} />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-8 pb-4 border-t border-[#EBEBEB]">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-2 rounded-xl border border-[#EBEBEB] text-[#222222] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F7F7F7] transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx + 1}
                type="button"
                onClick={() => {
                  setPage(idx + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                  page === idx + 1
                    ? 'bg-[#222222] text-white'
                    : 'text-[#222222] hover:bg-[#F7F7F7] border border-[#EBEBEB]'
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-2 rounded-xl border border-[#EBEBEB] text-[#222222] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F7F7F7] transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filterObject}
        onChangeFilter={handleFilterChange}
        onResetFilters={handleReset}
        onApplyFilters={fetchProperties}
        totalResults={total}
      />
    </div>
  );
};

export default PropertyListingPage;
