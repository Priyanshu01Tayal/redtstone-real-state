import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PropertyCard from '../../components/common/PropertyCard';
import CategoryBar from '../../components/common/CategoryBar';
import FilterModal from '../../components/common/FilterModal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  MapPin,
  Building2,
  Home,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  PlusCircle,
  Compass,
} from 'lucide-react';

// Popular Delhi NCR Micromarkets with authentic coordinates & imagery
const POPULAR_LOCALITIES = [
  {
    name: 'Crossing Republik',
    city: 'Ghaziabad',
    subtitle: 'Gated Societies & High-Rises',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    query: 'Crossing Republik',
  },
  {
    name: 'Indirapuram',
    city: 'Ghaziabad',
    subtitle: 'Prime Residential & Builder Floors',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    query: 'Indirapuram',
  },
  {
    name: 'Sector 62',
    city: 'Noida',
    subtitle: 'IT Corridor & Metro Connectivity',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    query: 'Sector 62',
  },
  {
    name: 'Golf Course Road',
    city: 'Gurgaon',
    subtitle: 'Ultra-Luxury Penthouses & Condos',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    query: 'Golf Course Road',
  },
  {
    name: 'Raj Nagar Extension',
    city: 'Ghaziabad',
    subtitle: 'Modern Affordable Townships',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80',
    query: 'Raj Nagar Extension',
  },
  {
    name: 'Noida Expressway',
    city: 'Noida',
    subtitle: 'Integrated High-Rise Living',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
    query: 'Noida Expressway',
  },
];

const HomePage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // State Management
  const [properties, setProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [listingType, setListingType] = useState('all'); // 'all' | 'sale' | 'rent'
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [furnishing, setFurnishing] = useState('');
  const [sort, setSort] = useState('latest');

  // Active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (listingType !== 'all') count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (bedrooms) count++;
    if (bathrooms) count++;
    if (furnishing) count++;
    if (sort !== 'latest') count++;
    return count;
  }, [listingType, minPrice, maxPrice, bedrooms, bathrooms, furnishing, sort]);

  // Fetch properties from backend API
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchLocation) params.search = searchLocation;
      if (listingType && listingType !== 'all') params.listingType = listingType;
      if (selectedCategory) params.propertyType = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (bedrooms) params.bedrooms = bedrooms;
      if (furnishing) params.furnishing = furnishing;
      if (sort) params.sort = sort;
      params.limit = 24;

      const [propsRes, featRes] = await Promise.all([
        api.get('/properties', { params }),
        api.get('/properties/featured').catch(() => ({ data: { properties: [] } })),
      ]);

      setProperties(propsRes.data?.properties || []);
      setFeaturedProperties(featRes.data?.properties || []);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [selectedCategory, listingType, sort]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    fetchProperties();
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchLocation('');
    setListingType('all');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setFurnishing('');
    setSort('latest');
    setTimeout(() => {
      fetchProperties();
    }, 50);
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
  };

  const handleLocationClick = (locQuery) => {
    setSearchLocation(locQuery);
    setTimeout(() => {
      fetchProperties();
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }, 50);
  };

  // Filter dictionary for FilterModal
  const filterObject = {
    listingType: listingType === 'all' ? '' : listingType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    furnishing,
    sort,
  };

  const handleFilterChange = (key, value) => {
    if (key === 'listingType') setListingType(value || 'all');
    else if (key === 'minPrice') setMinPrice(value);
    else if (key === 'maxPrice') setMaxPrice(value);
    else if (key === 'bedrooms') setBedrooms(value);
    else if (key === 'bathrooms') setBathrooms(value);
    else if (key === 'furnishing') setFurnishing(value);
    else if (key === 'sort') setSort(value);
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#222222]">
      {/* 1. Category Bar (Airbnb-Style Horizontally Scrollable) */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        onOpenFilters={() => setIsFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* 2. Airbnb-Style Search Experience Hero Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#EBEBEB] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Where */}
              <div className="p-3 bg-[#F7F7F7] hover:bg-gray-100/80 rounded-2xl transition border border-transparent focus-within:border-gray-300">
                <label className="block text-[10px] font-extrabold uppercase text-[#717171] tracking-wider">
                  Where
                </label>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C62828] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Locality or City"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full bg-transparent font-bold text-xs text-[#222222] focus:outline-none placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Purpose (Buy / Rent / All) */}
              <div className="p-3 bg-[#F7F7F7] hover:bg-gray-100/80 rounded-2xl transition border border-transparent focus-within:border-gray-300">
                <label className="block text-[10px] font-extrabold uppercase text-[#717171] tracking-wider">
                  Type
                </label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="w-full bg-transparent font-bold text-xs text-[#222222] focus:outline-none mt-1 cursor-pointer"
                >
                  <option value="all">Buy or Rent</option>
                  <option value="sale">Buy Property</option>
                  <option value="rent">Rent Home</option>
                </select>
              </div>

              {/* Bedrooms (BHK) */}
              <div className="p-3 bg-[#F7F7F7] hover:bg-gray-100/80 rounded-2xl transition border border-transparent focus-within:border-gray-300">
                <label className="block text-[10px] font-extrabold uppercase text-[#717171] tracking-wider">
                  Bedrooms
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full bg-transparent font-bold text-xs text-[#222222] focus:outline-none mt-1 cursor-pointer"
                >
                  <option value="">Any Bedrooms</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4+ BHK</option>
                </select>
              </div>

              {/* Max Budget */}
              <div className="p-3 bg-[#F7F7F7] hover:bg-gray-100/80 rounded-2xl transition border border-transparent focus-within:border-gray-300">
                <label className="block text-[10px] font-extrabold uppercase text-[#717171] tracking-wider">
                  Budget
                </label>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-transparent font-bold text-xs text-[#222222] focus:outline-none mt-1 cursor-pointer"
                >
                  <option value="">Any Budget</option>
                  <option value="3000000">Up to ₹30 Lakh</option>
                  <option value="6000000">Up to ₹60 Lakh</option>
                  <option value="10000000">Up to ₹1 Crore</option>
                  <option value="25000000">Up to ₹2.5 Crore</option>
                  <option value="50000000">Up to ₹5 Crore+</option>
                </select>
              </div>

              {/* Search Action Button */}
              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  className="flex-1 h-full py-3 px-4 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(true)}
                  className="h-full px-3 py-3 rounded-2xl border border-[#EBEBEB] hover:border-gray-400 bg-white text-[#222222] transition flex items-center justify-center"
                  title="Open advanced filters"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Filter Pills Row */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                <span className="text-[11px] font-bold text-[#717171] uppercase tracking-wider hidden sm:inline">
                  Quick:
                </span>
                <button
                  type="button"
                  onClick={() => setListingType('sale')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                    listingType === 'sale'
                      ? 'border-[#222222] bg-[#222222] text-white'
                      : 'border-[#EBEBEB] bg-white text-[#717171] hover:border-gray-400'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setListingType('rent')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                    listingType === 'rent'
                      ? 'border-[#222222] bg-[#222222] text-white'
                      : 'border-[#EBEBEB] bg-white text-[#717171] hover:border-gray-400'
                  }`}
                >
                  Rent
                </button>
                <button
                  type="button"
                  onClick={() => setBedrooms('3')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                    bedrooms === '3'
                      ? 'border-[#222222] bg-[#222222] text-white'
                      : 'border-[#EBEBEB] bg-white text-[#717171] hover:border-gray-400'
                  }`}
                >
                  3 BHK Flats
                </button>
                <button
                  type="button"
                  onClick={() => setMaxPrice('10000000')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                    maxPrice === '10000000'
                      ? 'border-[#222222] bg-[#222222] text-white'
                      : 'border-[#EBEBEB] bg-white text-[#717171] hover:border-gray-400'
                  }`}
                >
                  Under ₹1 Crore
                </button>

                {(searchLocation || listingType !== 'all' || maxPrice || bedrooms || selectedCategory) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex items-center space-x-1 text-xs text-[#C62828] font-bold px-2 py-1 hover:underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="text-xs font-semibold text-[#717171] hidden md:block shrink-0">
                {properties.length} verified listings available
              </div>
            </div>
          </form>
        </div>

        {/* 3. Section B: Featured Verified Properties (If Available) */}
        {featuredProperties && featuredProperties.length > 0 && !selectedCategory && !searchLocation && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight">
                  Featured Exclusive Listings
                </h2>
                <p className="text-xs text-[#717171] mt-0.5">
                  Handpicked premium residences with verified ownership and accompanied broker site tours
                </p>
              </div>

              <Link
                to="/buy"
                className="text-xs font-extrabold text-[#222222] hover:text-[#C62828] flex items-center space-x-1 transition"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProperties.slice(0, 4).map((prop) => (
                <PropertyCard key={prop._id} property={prop} />
              ))}
            </div>
          </section>
        )}

        {/* 4. Section C: Explore Properties (Airbnb 4-Column Responsive Grid) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight">
                {selectedCategory
                  ? `${selectedCategory.toUpperCase().replace('_', ' ')} IN DELHI NCR`
                  : 'Explore Verified Properties'}
              </h2>
              <p className="text-xs text-[#717171] mt-0.5">
                Physical broker inspection completed • 100% Owner Contact Privacy Protected
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="text-[#717171] hidden sm:inline">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#222222] focus:outline-none cursor-pointer"
              >
                <option value="latest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="featured">Featured First</option>
              </select>
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
            <div className="bg-white rounded-3xl p-12 text-center border border-[#EBEBEB] max-w-lg mx-auto space-y-4">
              <div className="w-14 h-14 bg-red-50 text-[#C62828] rounded-full flex items-center justify-center mx-auto">
                <Home className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#222222]">No properties found</h3>
              <p className="text-xs text-[#717171] leading-relaxed">
                We couldn't find any listings matching your active filters. Try expanding your budget or clearing filters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-[#222222] hover:bg-[#C62828] text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Actual Property Cards Grid */}
          {!loading && properties.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {properties.map((prop) => (
                <PropertyCard key={prop._id} property={prop} />
              ))}
            </div>
          )}
        </section>

        {/* 5. Section D: Popular Locations (Delhi NCR Micromarkets) */}
        <section className="space-y-4 pt-6 border-t border-[#EBEBEB]">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight">
              Popular Delhi NCR Micromarkets
            </h2>
            <p className="text-xs text-[#717171] mt-0.5">
              Explore in-demand residential societies and commercial business parks
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_LOCALITIES.map((loc) => (
              <button
                key={loc.name}
                type="button"
                onClick={() => handleLocationClick(loc.query)}
                className="group flex flex-col text-left rounded-2xl overflow-hidden border border-[#EBEBEB] hover:shadow-md transition duration-200"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  <img
                    src={loc.image}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-3 bg-white">
                  <h4 className="font-extrabold text-xs text-[#222222] group-hover:text-[#C62828] transition truncate">
                    {loc.name}
                  </h4>
                  <p className="text-[10px] text-[#717171] truncate">{loc.city}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 6. Section G: List Your Property CTA (Owner Portal Gateway) */}
        <section className="pt-6 border-t border-[#EBEBEB]">
          <div className="bg-[#F7F7F7] rounded-3xl p-8 sm:p-12 border border-[#EBEBEB] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl text-left">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-100 text-[#C62828] text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Owner Privacy Protection</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight">
                Own a property in Delhi NCR? List with Redstone
              </h3>
              <p className="text-xs sm:text-sm text-[#717171] leading-relaxed">
                Zero spam calls from random agents. Your phone and email are never shown publicly.
                A dedicated licensed broker handles physical inspections, 360° virtual tours, buyer screening, and escorted site visits.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <Link
                to={user?.role === 'owner' ? '/owner/properties/add' : '/welcome'}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List Your Property</span>
              </Link>

              <Link
                to="/about"
                className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-gray-100 text-[#222222] border border-[#EBEBEB] rounded-2xl font-bold text-xs transition text-center"
              >
                Learn How It Works
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Advanced Airbnb-Style Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filterObject}
        onChangeFilter={handleFilterChange}
        onResetFilters={handleResetFilters}
        onApplyFilters={fetchProperties}
        totalResults={properties.length}
      />
    </div>
  );
};

export default HomePage;
