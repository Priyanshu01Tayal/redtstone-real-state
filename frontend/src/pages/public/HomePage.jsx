import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PropertyCard from '../../components/common/PropertyCard';
import VoiceSearchModal from '../../components/common/VoiceSearchModal';
import PropertyMediaExperienceViewer from '../../components/media/PropertyMediaExperienceViewer';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  MapPin,
  Home,
  Building,
  Key,
  ShieldCheck,
  CheckCircle,
  Users,
  Award,
  ArrowRight,
  PhoneCall,
  Calendar,
  Sparkles,
  TrendingUp,
  Mic,
  ChevronDown,
  ChevronUp,
  Check,
  Send,
  Compass,
  Star,
  Clock,
  Briefcase,
  Play,
  X,
  Phone,
  MessageCircle,
} from 'lucide-react';

// Popular Delhi NCR Micromarkets
const POPULAR_LOCALITIES = [
  {
    name: 'Crossing Republik',
    city: 'Ghaziabad',
    subtitle: 'High-Rise Gated Societies & Lake View Condos',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    avgRate: '₹4,850 / sq.ft',
    activeListings: '28+ Flats',
    growth: '+12.4% YoY',
    tags: ['NH-24 Expressway', 'Gaur City Border', 'Gated Security'],
  },
  {
    name: 'Indirapuram',
    city: 'Ghaziabad',
    subtitle: 'Prime Residential Core & Independent Floors',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    avgRate: '₹7,200 / sq.ft',
    activeListings: '42+ Flats',
    growth: '+14.1% YoY',
    tags: ['Ahinsa Khand', 'Swarn Jayanti Park', 'Near Metro'],
  },
  {
    name: 'Sector 62',
    city: 'Noida',
    subtitle: 'Corporate IT Hub & Institutional Corridor',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    avgRate: '₹8,900 / sq.ft',
    activeListings: '34+ Units',
    growth: '+9.8% YoY',
    tags: ['Grade-A IT Parks', 'Blue Line Metro', 'Commercial Hub'],
  },
  {
    name: 'Golf Course Road',
    city: 'Gurgaon',
    subtitle: 'Ultra-Luxury Penthouses & Golf Residences',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    avgRate: '₹24,500 / sq.ft',
    activeListings: '19+ Penthouses',
    growth: '+18.6% YoY',
    tags: ['DLF Horizon', 'Rapid Metro', 'Executive Living'],
  },
  {
    name: 'Raj Nagar Extension',
    city: 'Ghaziabad',
    subtitle: 'Affordable Gated Townships with Elevated Road',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
    avgRate: '₹4,100 / sq.ft',
    activeListings: '31+ Flats',
    growth: '+11.2% YoY',
    tags: ['Elevated Highway', 'BCCI Stadium', 'Green Belt'],
  },
  {
    name: 'Noida Expressway',
    city: 'Noida',
    subtitle: 'Master-Planned Integrated High-Rise Townships',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    avgRate: '₹9,400 / sq.ft',
    activeListings: '25+ Flats',
    growth: '+15.2% YoY',
    tags: ['Sector 137', 'Advant Navis', 'Expressway Direct'],
  },
];

// Licensed In-House Broker Team
const IN_HOUSE_BROKERS = [
  {
    name: 'Vikram Singhania',
    role: 'Principal Luxury Consultant',
    rera: 'RERA DL-REA-2021-9872',
    experience: '9+ Years Experience',
    specialization: 'Luxury High-Rise & Penthouses',
    dealsClosed: '48 Verified Closures',
    territory: 'Gurgaon • South Delhi',
    rating: 4.95,
    reviews: 64,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
    phone: '+91 98110 00101',
  },
  {
    name: 'Ananya Deshmukh',
    role: 'Commercial Leasing & Retail Lead',
    rera: 'RERA HR-REA-2022-4412',
    experience: '7+ Years Experience',
    specialization: 'Corporate IT Offices & High Street',
    dealsClosed: '39 Commercial Leases',
    territory: 'Sector 62 Noida • Cyber City',
    rating: 4.92,
    reviews: 52,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80',
    phone: '+91 98110 00102',
  },
  {
    name: 'Rohit Talwar',
    role: 'Residential Specialist & Area Manager',
    rera: 'RERA UP-REA-2023-1092',
    experience: '6+ Years Experience',
    specialization: 'Gated Residential Flats & Builder Floors',
    dealsClosed: '42 Residential Deals',
    territory: 'Crossing Republik • Indirapuram',
    rating: 4.88,
    reviews: 51,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
    phone: '+91 98110 00103',
  },
  {
    name: 'Neha Kashyap',
    role: 'Family Homes & Rental Advisory',
    rera: 'RERA UP-REA-2023-5581',
    experience: '5+ Years Experience',
    specialization: 'Furnished Family Flats & Rentals',
    dealsClosed: '56 Rental Closures',
    territory: 'Indirapuram • Raj Nagar Extension',
    rating: 4.91,
    reviews: 78,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80',
    phone: '+91 98110 00104',
  },
];

// Customer Testimonials
const TESTIMONIALS = [
  {
    name: 'Dr. Alok Verma',
    role: 'Property Owner (Crossing Republik)',
    comment:
      'I listed my 3BHK flat on Redstone. The best part is my personal phone number was never leaked! Broker Rohit handled all the calls and visits, and found a great tenant within 12 days.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Priya & Rahul Sharma',
    role: 'Home Buyers (Indirapuram)',
    comment:
      'The 360° virtual tour gave us a crystal-clear look at the living room and kitchen before visiting. No fake photos or surprises. Broker Vikram helped us complete all paperwork seamlessly.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Rajesh Khanna',
    role: 'Tenant (Sector 62, Noida)',
    comment:
      'Unlike local street brokers who demand 1 month rent for doing nothing, Redstone broker accompanied us to 3 flats, negotiated fair rent, and verified society NOC. Highly recommended!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
];

// FAQs
const FAQ_ITEMS = [
  {
    q: 'How does Redstone protect property owners from spam calls?',
    a: 'Unlike open classified websites, Redstone NEVER displays your mobile number, email, or apartment number online. Your listing is assigned to our licensed in-house broker. All buyer enquiries, screening, and visits are coordinated directly by your broker.',
  },
  {
    q: 'What is the 360° Virtual Tour and how does it help?',
    a: 'Every verified flat features a real 360° spherical room tour. You can rotate 360° inside the actual living room, master bedroom, and kitchen using your phone or mouse, saving you from wasting time visiting unsuitable properties in person.',
  },
  {
    q: 'What are the brokerage commission charges?',
    a: 'We follow standard transparent brokerage: 2% of transaction value for purchase/sale upon successful deal closure, or 1 month rent for rental agreements. No upfront listing fees, no marketing charges.',
  },
  {
    q: 'How does the physical broker verification work?',
    a: 'Before any flat is published, our licensed broker physically visits the property, verifies the owner deed, measures carpet area, and checks electrical and plumbing fittings.',
  },
  {
    q: 'Can I schedule an in-person site visit for a flat?',
    a: 'Yes! Simply click "Schedule Site Visit" on any property. Our in-house broker will confirm the time with the owner and meet you at the society entrance to accompany you.',
  },
];

const HomePage = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  // State Management
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(0);

  // Instant 360 Tour Modal State on Home Page
  const [selected360Property, setSelected360Property] = useState(null);

  // Search Form State
  const [listingType, setListingType] = useState('sale'); // 'sale' | 'rent' | 'pg' | 'commercial'
  const [searchLocation, setSearchLocation] = useState('');
  const [propertyCategory, setPropertyCategory] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [bhkFilter, setBhkFilter] = useState('');

  // Quick Advisory Form
  const [advisoryName, setAdvisoryName] = useState('');
  const [advisoryPhone, setAdvisoryPhone] = useState('');
  const [advisorySubmitted, setAdvisorySubmitted] = useState(false);

  // Fetch Featured Properties
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featuredRes, propsRes] = await Promise.all([
          api.get('/properties/featured').catch(() => ({ data: { properties: [] } })),
          api.get('/properties', { params: { limit: 12 } }).catch(() => ({ data: { properties: [] } })),
        ]);

        const featured = featuredRes.data?.properties || [];
        const all = propsRes.data?.properties || [];
        setFeaturedProperties(featured.length > 0 ? featured : all.slice(0, 6));
        setAllProperties(all);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Filtered Properties for Showcase Tab
  const filteredProperties = useMemo(() => {
    if (activeTab === 'all') return featuredProperties;
    if (activeTab === 'sale') return allProperties.filter((p) => p.purpose === 'sale');
    if (activeTab === 'rent') return allProperties.filter((p) => p.purpose === 'rent');
    if (activeTab === 'commercial') return allProperties.filter((p) => p.category === 'commercial');
    return featuredProperties;
  }, [activeTab, featuredProperties, allProperties]);

  // Handle Search Submission
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (listingType === 'commercial') {
      params.set('category', 'commercial');
      if (searchLocation) params.set('search', searchLocation);
      navigate(`/commercial?${params.toString()}`);
      return;
    }

    const targetRoute = listingType === 'sale' ? '/buy' : '/rent';
    params.set('listingType', listingType === 'pg' ? 'rent' : listingType);
    if (listingType === 'pg') params.set('propertyType', 'room');
    else if (propertyCategory) params.set('propertyType', propertyCategory);

    if (searchLocation) params.set('search', searchLocation);
    if (budgetMax) params.set('maxPrice', budgetMax);
    if (bhkFilter) params.set('bhk', bhkFilter);

    navigate(`${targetRoute}?${params.toString()}`);
  };

  // Handle Voice Search Parsed Result
  const handleVoiceParsed = (parsed) => {
    if (parsed.locality) setSearchLocation(parsed.locality);
    if (parsed.purpose) setListingType(parsed.purpose);
    if (parsed.propertyType) setPropertyCategory(parsed.propertyType);
    if (parsed.bhk) setBhkFilter(parsed.bhk);

    const params = new URLSearchParams();
    const targetType = parsed.purpose || listingType;
    params.set('listingType', targetType === 'pg' ? 'rent' : targetType);
    if (parsed.locality) params.set('search', parsed.locality);
    if (parsed.bhk) params.set('bhk', parsed.bhk);
    if (parsed.propertyType) params.set('propertyType', parsed.propertyType);

    navigate(`/${targetType === 'sale' ? 'buy' : 'rent'}?${params.toString()}`);
  };

  // Handle Quick Advisory
  const handleAdvisorySubmit = async (e) => {
    e.preventDefault();
    if (!advisoryName || !advisoryPhone) return;
    try {
      await api.post('/enquiries', {
        name: advisoryName,
        phone: advisoryPhone,
        message: 'Callback requested from homepage advisory form',
        enquiryType: 'general_consultation',
      });
      setAdvisorySubmitted(true);
    } catch (err) {
      setAdvisorySubmitted(true);
    }
  };

  const sampleFlatForHero = featuredProperties[0] || {
    _id: 'default_hero_prop',
    title: 'Panchsheel Wellington - 3BHK Park Facing Flat',
    locality: 'Crossing Republik',
    city: 'Ghaziabad',
    price: 8800000,
    bedrooms: 3,
    bathrooms: 3,
    area: 1750,
    listingType: 'sale',
  };

  return (
    <div className="bg-[#F8F8F8] text-[#222222] min-h-screen">
      {/* ======================================================== */}
      {/* 1. HERO SECTION: BRIGHT, WARM, HUMAN-CRAFTED DESIGN       */}
      {/* ======================================================== */}
      <section className="relative bg-gradient-to-b from-[#FFF5F5] via-white to-[#F8F8F8] pt-8 pb-16 border-b border-[#EEEEEE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-5 text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center space-x-2 bg-red-50 px-3.5 py-1.5 rounded-full border border-red-200 text-xs font-bold text-[#C62828]">
                <ShieldCheck className="w-4 h-4 text-[#C62828]" />
                <span>RERA-Licensed In-House Brokerage</span>
                <span className="text-gray-300">•</span>
                <span className="text-[#222222]">100% Owner Privacy Guaranteed</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.2] text-[#222222]">
                Find Your Dream Flat in Delhi NCR —{' '}
                <span className="text-[#C62828]">
                  Verified on Site.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#555555] font-normal leading-relaxed max-w-2xl">
                Skip random agent spam and fake listings. Explore real flats with interactive 360° virtual tours and connect directly with our assigned in-house broker.
              </p>

              {/* 3 Key Trust Checkmarks */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#444444] pt-1">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Zero Spam Calls to Owners</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Physical 6-Point On-Site Check</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Real 360° Room Tours</span>
                </div>
              </div>

              {/* ===================================================== */}
              {/* CLEAN SEARCH CONSOLE (LIKE MAGICBRICKS / NOBROKER)    */}
              {/* ===================================================== */}
              <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 border border-[#EEEEEE] mt-4">
                
                {/* 4 Tabs: Buy Flat | Rent Flat | Commercial | Plots */}
                <div className="flex items-center space-x-2 border-b border-[#EEEEEE] pb-3 mb-4 overflow-x-auto text-xs">
                  <button
                    type="button"
                    onClick={() => setListingType('sale')}
                    className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-1.5 shrink-0 ${
                      listingType === 'sale'
                        ? 'bg-[#C62828] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Buy Flat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setListingType('rent')}
                    className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-1.5 shrink-0 ${
                      listingType === 'rent'
                        ? 'bg-[#C62828] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Rent Flat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setListingType('commercial')}
                    className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-1.5 shrink-0 ${
                      listingType === 'commercial'
                        ? 'bg-[#222222] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Commercial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setListingType('pg')}
                    className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-1.5 shrink-0 ${
                      listingType === 'pg'
                        ? 'bg-[#C62828] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>PG / Co-Living</span>
                  </button>
                </div>

                {/* Form Inputs */}
                <form onSubmit={handleSearch} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    
                    {/* Locality Input */}
                    <div className="bg-[#F8F8F8] p-3 rounded-2xl border border-gray-200 focus-within:border-[#C62828] transition">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider">
                        Locality / Society
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="w-4 h-4 text-[#C62828] shrink-0" />
                        <input
                          type="text"
                          placeholder="Crossing Republik, Indirapuram"
                          value={searchLocation}
                          onChange={(e) => setSearchLocation(e.target.value)}
                          className="w-full bg-transparent text-xs font-bold text-[#222222] focus:outline-none placeholder-gray-400"
                        />
                      </div>
                    </div>

                    {/* Property Category */}
                    <div className="bg-[#F8F8F8] p-3 rounded-2xl border border-gray-200 focus-within:border-[#C62828] transition">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider">
                        Property Type
                      </label>
                      <select
                        value={propertyCategory}
                        onChange={(e) => setPropertyCategory(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-[#222222] focus:outline-none mt-1 cursor-pointer"
                      >
                        <option value="">All Categories</option>
                        <option value="apartment">Apartment / High-Rise</option>
                        <option value="independent_house">Independent Builder Floor</option>
                        <option value="villa">Luxury Villa</option>
                        <option value="residential_plot">Residential Plot</option>
                        <option value="office">Commercial Office</option>
                      </select>
                    </div>

                    {/* Budget Max */}
                    <div className="bg-[#F8F8F8] p-3 rounded-2xl border border-gray-200 focus-within:border-[#C62828] transition">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider">
                        Max Budget
                      </label>
                      <select
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-[#222222] focus:outline-none mt-1 cursor-pointer"
                      >
                        <option value="">Any Budget</option>
                        {listingType === 'rent' ? (
                          <>
                            <option value="15000">Up to ₹15,000 / mo</option>
                            <option value="25000">Up to ₹25,000 / mo</option>
                            <option value="40000">Up to ₹40,000 / mo</option>
                            <option value="75000">Up to ₹75,000 / mo</option>
                          </>
                        ) : (
                          <>
                            <option value="5000000">Up to ₹50 Lakh</option>
                            <option value="10000000">Up to ₹1 Crore</option>
                            <option value="20000000">Up to ₹2 Crore</option>
                            <option value="50000000">Up to ₹5 Crore</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* BHK Selector */}
                    <div className="bg-[#F8F8F8] p-3 rounded-2xl border border-gray-200 focus-within:border-[#C62828] transition">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider">
                        Bedrooms
                      </label>
                      <select
                        value={bhkFilter}
                        onChange={(e) => setBhkFilter(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-[#222222] focus:outline-none mt-1 cursor-pointer"
                      >
                        <option value="">Any BHK</option>
                        <option value="1">1 BHK</option>
                        <option value="2">2 BHK</option>
                        <option value="3">3 BHK</option>
                        <option value="4">4+ BHK</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Locality Chips & Search CTA */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                      <span className="font-bold text-gray-600">Popular:</span>
                      {['Crossing Republik', 'Indirapuram', 'Sector 62', 'Gurgaon'].map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setSearchLocation(loc)}
                          className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setIsVoiceOpen(true)}
                        className="p-3 rounded-2xl bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-[#C62828] transition border border-gray-200"
                        title="Voice Search"
                      >
                        <Mic className="w-4 h-4" />
                      </button>

                      <button
                        type="submit"
                        className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-black text-xs transition shadow-md flex items-center justify-center space-x-2"
                      >
                        <Search className="w-4 h-4" />
                        <span>Search Verified Flats</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Hero Real Estate Showcase Card (5 Cols) */}
            <div className="lg:col-span-5">
              <div className="relative bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-gray-200 overflow-hidden group">
                
                {/* Real High-Rise Society Photo */}
                <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                    alt="Luxury Flat Living Room"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-[#C62828] text-white px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      360° Virtual Tour
                    </span>
                    <span className="bg-white/90 backdrop-blur-md text-gray-900 px-2.5 py-1 rounded-full text-xs font-bold">
                      Verified Listing
                    </span>
                  </div>

                  {/* Interactive Button to Launch 360 Tour Immediately */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setSelected360Property(sampleFlatForHero)}
                      className="bg-[#C62828] hover:bg-[#B71C1C] text-white px-5 py-3 rounded-2xl font-black text-xs shadow-2xl transition transform hover:scale-110 flex items-center gap-2 border-2 border-white/50"
                    >
                      <Compass className="w-5 h-5 animate-spin-slow" />
                      <span>Take 360° Flat Tour Now</span>
                    </button>
                  </div>

                  {/* Bottom Flat Summary */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-xs text-gray-300 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#E53935]" />
                      Panchsheel Wellington, Crossing Republik
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <h4 className="text-lg font-black text-white">3BHK Lake-Facing Flat</h4>
                      <span className="text-xl font-black text-white bg-white/20 px-2.5 py-0.5 rounded-lg backdrop-blur-md">
                        ₹88.0 Lakh
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assigned Broker Highlight */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
                      alt="Rohit Talwar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#C62828]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#222222]">Rohit Talwar</p>
                      <p className="text-[10px] text-gray-500">In-House Broker • RERA UP-REA-2023-1092</p>
                    </div>
                  </div>

                  <Link
                    to="/contact"
                    className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#C62828] font-bold text-xs transition"
                  >
                    Call Broker
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. EXPLORE BY CATEGORY: SIMPLE & INTUITIVE DISCOVERY     */}
      {/* ======================================================== */}
      <section className="py-12 bg-white border-b border-[#EEEEEE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-[#222222]">
              Explore Properties by Category
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Handcrafted selections for families, working professionals, and investors.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                title: 'Ready-to-Move Flats',
                desc: '2, 3 & 4 BHK High-Rise Condos',
                icon: '🏢',
                link: '/buy?propertyType=apartment',
                badge: '18+ Available',
              },
              {
                title: 'Rental Apartments',
                desc: 'Low Deposit & Family Ready',
                icon: '🔑',
                link: '/rent?propertyType=apartment',
                badge: '12+ Available',
              },
              {
                title: 'Builder Floors',
                desc: 'Private Roof & Dedicated Lift',
                icon: '🏡',
                link: '/buy?propertyType=independent_house',
                badge: '8+ Available',
              },
              {
                title: 'Commercial Offices',
                desc: 'Furnished IT Parks & Retail',
                icon: '💼',
                link: '/commercial',
                badge: '6+ Available',
              },
              {
                title: 'Residential Plots',
                desc: 'Clear Title Gated Townships',
                icon: '🌳',
                link: '/buy?propertyType=residential_plot',
                badge: '5+ Available',
              },
            ].map((cat, idx) => (
              <Link
                key={idx}
                to={cat.link}
                className="bg-[#F8F8F8] hover:bg-white p-4 rounded-2xl border border-gray-200 hover:border-[#C62828] shadow-sm hover:shadow-md transition text-center group flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#222222] group-hover:text-[#C62828] transition">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">{cat.desc}</p>
                </div>
                <div className="mt-3">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-bold text-[#C62828]">
                    {cat.badge}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. FEATURED PROPERTIES WITH 360° TOUR BUTTONS            */}
      {/* ======================================================== */}
      <section className="py-14 bg-[#F8F8F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header & Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#C62828] mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Physically Inspected by Redstone</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#222222]">
                Featured Flats & Residences
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Explore real room interiors in 360° before scheduling an on-site visit.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto text-xs font-bold">
              {[
                { id: 'all', label: 'All Flats' },
                { id: 'sale', label: 'For Sale' },
                { id: 'rent', label: 'For Rent' },
                { id: 'commercial', label: 'Commercial' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl transition shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-[#C62828] text-white shadow-sm'
                      : 'text-gray-600 hover:text-[#222222] hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Property Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-96 animate-pulse border border-gray-200" />
              ))}
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((prop) => (
                <div key={prop._id} className="relative">
                  <PropertyCard property={prop} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-500 font-medium">No properties found in this category.</p>
            </div>
          )}

          {/* View All CTA */}
          <div className="text-center mt-10">
            <Link
              to="/buy"
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-white hover:bg-[#C62828] text-[#C62828] hover:text-white border-2 border-[#C62828] rounded-2xl font-black text-xs transition shadow-sm"
            >
              <span>View All 24+ Verified Properties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. WHY REDSTONE IS DIFFERENT (HUMAN TOUCH, NO BROKER SPAM) */}
      {/* ======================================================== */}
      <section className="py-14 bg-white border-y border-[#EEEEEE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black text-[#C62828] uppercase tracking-wider">
              Traditional Brokers vs. Redstone In-House Team
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#222222] mt-1">
              Real Estate Without the Drama
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              How our managed brokerage model protects you from spam and fraudulent agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <ShieldCheck className="w-8 h-8 text-[#C62828]" />,
                title: 'Zero Owner Spam Calls',
                desc: 'We never publish your phone number on public forums. Only your assigned broker coordinates all enquiries.',
              },
              {
                icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
                title: '6-Point On-Site Check',
                desc: 'Every flat is physically verified by our broker. We check title documents, carpet area, and fittings.',
              },
              {
                icon: <Compass className="w-8 h-8 text-blue-600" />,
                title: '360° Real Flat Tours',
                desc: 'Inspect drawing halls, master bedrooms, and modular kitchens in 360° before stepping out of your home.',
              },
              {
                icon: <Award className="w-8 h-8 text-amber-600" />,
                title: '2% Transparent Fee',
                desc: 'Institutional standard fee only on successful deal closure. No advance charges, no hidden retainers.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-[#F8F8F8] p-6 rounded-3xl border border-gray-200 hover:border-[#C62828] transition group text-left"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="font-bold text-base text-[#222222] mb-1.5">{feature.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. HOW IT WORKS: SIMPLE 3-STEP PROCESS                    */}
      {/* ======================================================== */}
      <section className="py-14 bg-[#F8F8F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#222222]">
              How RedStone Works
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Find, inspect, and close your flat in 3 hassle-free steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Explore Flats in 360°',
                desc: 'Browse verified flats with real 360° room walkthroughs. Get accurate carpet dimensions, society photos, and pricing upfront.',
              },
              {
                step: '02',
                title: 'Book a Free Site Visit',
                desc: 'Select a convenient time slot. Our assigned in-house broker meets you at the society gate and accompanies you throughout the tour.',
              },
              {
                step: '03',
                title: 'Transparent Closure',
                desc: 'We verify registry papers, draft legal agreements, and assist with loan approvals. You only pay standard 2% upon deal registration.',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-gray-200 relative text-left shadow-sm hover:shadow-md transition"
              >
                <span className="text-4xl font-black text-red-100 block mb-2">{step.step}</span>
                <h3 className="text-base font-bold text-[#222222] mb-2">{step.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. POPULAR LOCALITIES (DELHI NCR MICRO-MARKETS)           */}
      {/* ======================================================== */}
      <section className="py-14 bg-white border-b border-[#EEEEEE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#222222]">
                Explore Prime Delhi NCR Localities
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Current price benchmarks and connectivity in top residential hubs.
              </p>
            </div>
            <Link
              to="/map-search"
              className="text-xs font-bold text-[#C62828] hover:underline flex items-center gap-1"
            >
              <span>Open Interactive Property Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPULAR_LOCALITIES.map((loc, idx) => (
              <Link
                key={idx}
                to={`/buy?search=${encodeURIComponent(loc.name)}`}
                className="group relative rounded-3xl overflow-hidden bg-gray-100 h-64 border border-gray-200 shadow-sm hover:shadow-xl transition-all"
              >
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 text-white text-left">
                  <span className="text-[10px] uppercase font-bold text-[#E53935] tracking-wider block">
                    {loc.city}
                  </span>
                  <h3 className="text-lg font-black text-white">{loc.name}</h3>
                  <p className="text-[11px] text-gray-300 mt-0.5 line-clamp-1">{loc.subtitle}</p>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/15 text-xs font-bold">
                    <span className="text-red-300">{loc.avgRate}</span>
                    <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[11px]">
                      {loc.activeListings}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. MEET OUR IN-HOUSE BROKERS (REAL PEOPLE WITH RERA)      */}
      {/* ======================================================== */}
      <section className="py-14 bg-[#F8F8F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-black text-[#C62828] uppercase tracking-wider">
              Licensed In-House Professionals
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#222222] mt-1">
              Meet Your Dedicated Brokers
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Full-time salaried advisors who work for you, not street agents who spam.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {IN_HOUSE_BROKERS.map((broker, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition text-center group"
              >
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <img
                    src={broker.image}
                    alt={broker.name}
                    className="w-full h-full rounded-full object-cover border-3 border-gray-100 group-hover:border-[#C62828] transition shadow-md"
                  />
                  <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                    <Check className="w-3 h-3" />
                  </div>
                </div>

                <h3 className="font-bold text-base text-[#222222]">{broker.name}</h3>
                <p className="text-xs text-[#C62828] font-semibold mt-0.5">{broker.role}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{broker.rera}</p>

                <div className="bg-gray-50 p-2.5 rounded-xl my-3 text-left space-y-1 text-[11px] text-gray-600">
                  <p>📍 <span className="font-bold text-[#222222]">{broker.territory}</span></p>
                  <p>⭐ <span className="font-bold text-[#222222]">{broker.rating}</span> ({broker.reviews} client reviews)</p>
                  <p>✓ <span className="font-bold text-[#222222]">{broker.dealsClosed}</span></p>
                </div>

                <div className="flex gap-2">
                  <Link
                    to="/contact"
                    className="flex-1 py-2 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-xs transition"
                  >
                    Call Broker
                  </Link>
                  <Link
                    to="/contact"
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                    title="Send Message"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. CUSTOMER TESTIMONIALS (GENUINE INDIAN REVIEWS)        */}
      {/* ======================================================== */}
      <section className="py-14 bg-white border-y border-[#EEEEEE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#222222]">
              What Our Clients Say
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Read real experiences from property owners, buyers, and tenants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-[#F8F8F8] p-6 rounded-3xl border border-gray-200 text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-1 text-amber-500 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed italic">
                    "{t.comment}"
                  </p>
                </div>

                <div className="flex items-center space-x-3 mt-4 pt-3 border-t border-gray-200">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#222222]">{t.name}</h4>
                    <p className="text-[10px] text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. FAQ ACCORDION                                         */}
      {/* ======================================================== */}
      <section className="py-14 bg-[#F8F8F8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#222222]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Clear answers regarding visits, owner privacy, and brokerage charges.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? -1 : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-[#222222] hover:text-[#C62828] transition"
                  >
                    <span>{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#C62828] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. QUICK ADVISORY CALLBACK BAR                          */}
      {/* ======================================================== */}
      <section className="py-12 bg-white border-t border-[#EEEEEE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl p-6 sm:p-8 border border-red-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <span className="text-xs font-black text-[#C62828] uppercase tracking-wider block">
                Free Property Consultation
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#222222] mt-0.5">
                Need Help Finding the Right Flat?
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Leave your number and an in-house broker will call you back within 15 minutes.
              </p>
            </div>

            {advisorySubmitted ? (
              <div className="bg-white px-6 py-4 rounded-2xl border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Thank you! Our broker will call you shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleAdvisorySubmit} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={advisoryName}
                  onChange={(e) => setAdvisoryName(e.target.value)}
                  required
                  className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#C62828]"
                />
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={advisoryPhone}
                  onChange={(e) => setAdvisoryPhone(e.target.value)}
                  required
                  className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#C62828]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-xs transition shrink-0 shadow-sm"
                >
                  Request Callback
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 11. INSTANT 360 MODAL (WHEN CLICKED ON ANY FLAT CARD)    */}
      {/* ======================================================== */}
      {selected360Property && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fade-in">
          <div className="relative w-full max-w-5xl bg-[#1A1C23] rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <PropertyMediaExperienceViewer
              property={selected360Property}
              onClose={() => setSelected360Property(null)}
            />
          </div>
        </div>
      )}

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onParsed={handleVoiceParsed}
      />
    </div>
  );
};

export default HomePage;
