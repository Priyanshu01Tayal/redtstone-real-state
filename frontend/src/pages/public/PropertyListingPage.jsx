import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import PropertyCard from '../../components/common/PropertyCard';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const PropertyListingPage = ({ defaultListingType = '', defaultCategory = '', title = 'Properties' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [locality, setLocality] = useState(searchParams.get('locality') || '');
  const [listingType, setListingType] = useState(defaultListingType || searchParams.get('listingType') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [category, setCategory] = useState(defaultCategory || searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
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
      if (furnishing) params.furnishing = furnishing;
      if (sort) params.sort = sort;
      params.page = page;
      params.limit = 9;

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
  }, [page, sort, listingType, category]);

  const handleApplyFilters = (e) => {
    e?.preventDefault();
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
    setFurnishing('');
    setSort('latest');
    setPage(1);
    fetchProperties();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EEEEEE] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#222222]">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Found {total} verified properties managed exclusively by RedStone In-House Brokers
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-3">
          <label className="text-xs font-bold text-gray-500">Sort By:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-[#F8F8F8] border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#222222] focus:outline-none"
          >
            <option value="latest">Latest Properties</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="area_desc">Area: Largest First</option>
            <option value="featured">Featured First</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="bg-white p-6 rounded-3xl border border-[#EEEEEE] shadow-sm h-fit space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#EEEEEE]">
            <span className="font-black text-sm text-[#222222] flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#C62828]" /> Filters
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-[#C62828] flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-4 text-xs">
            {/* Search Keyword */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Keywords / Title</label>
              <input
                type="text"
                placeholder="e.g. Golf Course, Camellias"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#C62828]"
              />
            </div>

            {/* Locality */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Locality</label>
              <input
                type="text"
                placeholder="e.g. Sector 54, DLF Phase 2"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#C62828]"
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="flat">Flat</option>
                <option value="villa">Luxury Villa</option>
                <option value="shop">Retail Shop</option>
                <option value="office">Corporate Office</option>
                <option value="commercial_building">Commercial Building</option>
                <option value="residential_plot">Residential Plot</option>
                <option value="agricultural_land">Land Parcel</option>
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Bedrooms</label>
              <div className="grid grid-cols-4 gap-1.5">
                {['', '2', '3', '4'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBedrooms(b)}
                    className={`py-1.5 rounded-lg font-bold border transition ${
                      bedrooms === b
                        ? 'bg-[#C62828] text-white border-[#C62828]'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {b === '' ? 'Any' : `${b} BHK`}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Price Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full p-2 rounded-xl border border-gray-200 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full p-2 rounded-xl border border-gray-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Furnishing */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Furnishing</label>
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none"
              >
                <option value="">Any</option>
                <option value="unfurnished">Unfurnished</option>
                <option value="semi-furnished">Semi-Furnished</option>
                <option value="fully-furnished">Fully-Furnished</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Property Grid Results */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-[#EEEEEE]" />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-bold text-gray-700 px-4">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#EEEEEE]">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#222222]">No Properties Match Your Search</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Try widening your price filters, selecting a different locality, or resetting your criteria.
              </p>
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 bg-[#C62828] text-white text-xs font-bold rounded-xl"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyListingPage;
