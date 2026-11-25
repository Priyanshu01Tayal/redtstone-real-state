import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Flame,
  Layers,
  Search,
  Filter,
  Eye,
  SlidersHorizontal,
  Home,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Mic,
} from 'lucide-react';
import api from '../../services/api';
import PropertyMap from '../../components/map/PropertyMap';
import PropertyCard from '../../components/common/PropertyCard';
import VoiceSearchModal from '../../components/common/VoiceSearchModal';
import { useLanguage } from '../../context/LanguageContext';

const NCR_LOCALITIES = [
  { name: 'Crossing Republik', city: 'Ghaziabad', lat: 28.629, lng: 77.433 },
  { name: 'Indirapuram', city: 'Ghaziabad', lat: 28.6415, lng: 77.371 },
  { name: 'Raj Nagar Extension', city: 'Ghaziabad', lat: 28.709, lng: 77.447 },
  { name: 'Sector 62', city: 'Noida', lat: 28.625, lng: 77.362 },
  { name: 'Noida Expressway', city: 'Noida', lat: 28.535, lng: 77.385 },
  { name: 'Greater Noida West', city: 'Greater Noida', lat: 28.583, lng: 77.452 },
  { name: 'Golf Course Road', city: 'Gurgaon', lat: 28.4595, lng: 77.098 },
];

const MapSearchPage = () => {
  const [properties, setProperties] = useState([]);
  const [availabilityHeatmap, setAvailabilityHeatmap] = useState([]);
  const [demandHeatmap, setDemandHeatmap] = useState([]);
  const [localitySummary, setLocalitySummary] = useState([]);

  const { lang, t } = useLanguage();
  const [activeLayer, setActiveLayer] = useState('pins'); // 'pins' | 'availability' | 'demand' | 'gaps'
  const [selectedLocality, setSelectedLocality] = useState(NCR_LOCALITIES[0]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Filters
  const [purpose, setPurpose] = useState('');
  const [category, setCategory] = useState('');
  const [bhk, setBhk] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  // Two-way scroll synchronization: when property is selected from map marker, scroll its card into view
  const handlePropertySelectFromMap = (prop) => {
    setSelectedProperty(prop);
    const cardEl = document.getElementById(`prop-card-${prop._id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleResetMap = () => {
    setSelectedLocality(NCR_LOCALITIES[0]);
    setPurpose('');
    setCategory('');
    setBhk('');
    setMaxPrice('');
    setVerifiedOnly(true);
    setSelectedProperty(null);
    fetchInitialData();
  };

  const handleVoiceParsed = (parsed) => {
    if (parsed.locality) {
      const match = NCR_LOCALITIES.find(
        (l) => l.name.toLowerCase() === parsed.locality.toLowerCase()
      );
      if (match) setSelectedLocality(match);
    }
    if (parsed.purpose) setPurpose(parsed.purpose);
    if (parsed.bhk) setBhk(parsed.bhk);
    if (parsed.propertyType) {
      setCategory(parsed.propertyType === 'office' ? 'commercial' : 'residential');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [propsRes, availRes, demandRes, summaryRes] = await Promise.all([
        api.get('/maps/properties', {
          params: {
            lng: selectedLocality.lng,
            lat: selectedLocality.lat,
            radius: 12000,
          },
        }),
        api.get('/maps/availability-heatmap'),
        api.get('/maps/demand-heatmap'),
        api.get('/maps/locality-summary'),
      ]);

      setProperties(propsRes.data.properties || []);
      setAvailabilityHeatmap(availRes.data.data || []);
      setDemandHeatmap(demandRes.data.data || []);
      setLocalitySummary(summaryRes.data.summary || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Called when map pan/zoom changes viewport bounds
  const handleBoundsChange = async (bounds) => {
    if (activeLayer !== 'pins') return;
    try {
      const res = await api.get('/maps/properties', {
        params: {
          swLng: bounds.swLng,
          swLat: bounds.swLat,
          neLng: bounds.neLng,
          neLat: bounds.neLat,
          purpose: purpose || undefined,
          category: category || undefined,
          bhk: bhk || undefined,
        },
      });
      setProperties(res.data.properties || []);
    } catch (err) {
      console.error(err);
    }
  };

  const flyToLocality = (loc) => {
    setSelectedLocality(loc);
    api
      .get('/maps/properties', {
        params: {
          lng: loc.lng,
          lat: loc.lat,
          radius: 8000,
          purpose: purpose || undefined,
          category: category || undefined,
          bhk: bhk || undefined,
        },
      })
      .then((res) => {
        setProperties(res.data.properties || []);
      })
      .catch(console.error);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Banner & Layer Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FFCDD2] text-[#C62828] mb-1">
            Geospatial Intelligence Engine
          </span>
          <h1 className="text-2xl font-black text-[#222222]">
            Interactive Map & Dual Heatmap Explorer
          </h1>
          <p className="text-xs text-[#777777]">
            Toggle between verified property pins, supply density, and anonymized buyer demand heatmaps.
          </p>
        </div>

        {/* Layer Mode Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-[#F8F8F8] p-1.5 rounded-xl border border-[#EEEEEE]">
          <button
            onClick={() => setActiveLayer('pins')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeLayer === 'pins'
                ? 'bg-[#C62828] text-white shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Property Pins ({properties.length})
          </button>

          <button
            onClick={() => setActiveLayer('availability')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeLayer === 'availability'
                ? 'bg-[#E53935] text-white shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Layer A: Availability Heatmap
          </button>

          <button
            onClick={() => setActiveLayer('demand')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeLayer === 'demand'
                ? 'bg-[#1565C0] text-white shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Layer B: Demand Heatmap
          </button>

          <button
            onClick={() => setActiveLayer('gaps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeLayer === 'gaps'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Market Gaps & Ratios
          </button>
        </div>
      </div>

      {/* Locality Quick Flight Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 text-xs">
        <span className="font-bold text-gray-500 shrink-0">Quick Navigate:</span>
        {NCR_LOCALITIES.map((loc) => {
          const isSelected = selectedLocality.name === loc.name;
          return (
            <button
              key={loc.name}
              onClick={() => flyToLocality(loc)}
              className={`px-3 py-1 rounded-full shrink-0 font-semibold border transition-all ${
                isSelected
                  ? 'bg-[#222222] text-white border-[#222222] shadow-sm'
                  : 'bg-white text-gray-700 border-[#EEEEEE] hover:bg-gray-100'
              }`}
            >
              📍 {loc.name}
            </button>
          );
        })}
      </div>

      {/* Main Split Layout: Properties List on Left, Leaflet Map on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#EEEEEE] shadow-sm flex items-center gap-3 text-xs">
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#EEEEEE] font-semibold text-gray-700"
            >
              <option value="">All Purpose</option>
              <option value="sale">Buy / Sale</option>
              <option value="rent">Rent / Lease</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#EEEEEE] font-semibold text-gray-700"
            >
              <option value="">All Categories</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>

            <select
              value={bhk}
              onChange={(e) => setBhk(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#EEEEEE] font-semibold text-gray-700"
            >
              <option value="">Any BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>

            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#EEEEEE] font-semibold text-gray-700"
            >
              <option value="">Max Budget</option>
              <option value="5000000">Up to ₹50 Lakh</option>
              <option value="10000000">Up to ₹1.00 Cr</option>
              <option value="20000000">Up to ₹2.00 Cr</option>
              <option value="50000000">Up to ₹5.00 Cr</option>
              <option value="150000000">₹15 Cr+</option>
            </select>

            <button
              type="button"
              onClick={() => setIsVoiceOpen(true)}
              className="p-2 rounded-xl bg-red-50 text-[#C62828] hover:bg-red-100 transition-colors flex items-center justify-center border border-red-200"
              title={lang === 'hi' ? 'बोलकर खोजें' : 'Voice Search (Hindi / English)'}
            >
              <Mic className="w-4 h-4 text-[#C62828]" />
            </button>

            <button
              onClick={() => flyToLocality(selectedLocality)}
              className="px-3 py-1.5 bg-[#C62828] text-white rounded-lg font-bold"
            >
              Filter
            </button>

            <button
              onClick={handleResetMap}
              className="ml-auto px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-[11px] transition"
              title="Reset map view and filters"
            >
              Reset Map
            </button>
          </div>

          {/* MARKET GAPS VIEW */}
          {activeLayer === 'gaps' ? (
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-[#222222]">
                Supply vs Demand Locality Analysis
              </h3>
              {localitySummary.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl border border-[#EEEEEE] shadow-sm space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-[#222222]">📍 {item.locality}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        item.demandCount > item.availableCount
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-[#2E7D32]'
                      }`}
                    >
                      {item.marketStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl text-center">
                    <div>
                      <span className="text-gray-400 block">Active Listings</span>
                      <span className="font-bold text-[#C62828]">{item.availableCount} Units</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Buyer Leads</span>
                      <span className="font-bold text-blue-600">{item.demandCount} Buyers</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">D/S Ratio</span>
                      <span className="font-bold">{item.demandSupplyRatio}x</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* PROPERTY CARDS SCROLLABLE CONTAINER */
            <div className="space-y-4 max-h-[680px] overflow-y-auto pr-1">
              <div className="flex justify-between items-center text-xs text-gray-500 font-semibold px-1">
                <span>Showing {properties.length} verified listings in view</span>
                <span>Pan or zoom map to auto-update</span>
              </div>

              {properties.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#EEEEEE]">
                  <p className="text-sm font-semibold text-gray-500">
                    No approved properties found in this viewport.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Try zooming out or moving the map.</p>
                </div>
              ) : (
                properties.map((prop) => (
                  <div
                    key={prop._id}
                    id={`prop-card-${prop._id}`}
                    onClick={() => setSelectedProperty(prop)}
                    onMouseEnter={() => setSelectedProperty(prop)}
                    className={`transition-all rounded-2xl cursor-pointer ${
                      selectedProperty?._id === prop._id ? 'ring-2 ring-[#C62828] shadow-md' : ''
                    }`}
                  >
                    <PropertyCard property={prop} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Column (7 Cols) - Interactive Map */}
        <div className="lg:col-span-7 sticky top-24 self-start">
          <PropertyMap
            properties={properties}
            availabilityHeatmap={availabilityHeatmap}
            demandHeatmap={demandHeatmap}
            activeLayer={activeLayer}
            center={[selectedLocality.lat, selectedLocality.lng]}
            zoom={13}
            onBoundsChange={handleBoundsChange}
            onPropertySelect={handlePropertySelectFromMap}
            selectedPropertyId={selectedProperty?._id}
            height="720px"
          />
        </div>
      </div>

      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onParsed={handleVoiceParsed}
      />
    </div>
  );
};

export default MapSearchPage;
