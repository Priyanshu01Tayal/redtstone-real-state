import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import Modal from '../../components/common/Modal';
import PropertyCard from '../../components/common/PropertyCard';
import PropertyMediaExperienceViewer from '../../components/media/PropertyMediaExperienceViewer';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Star,
  CheckCircle,
  Share2,
  Heart,
  Phone,
  Compass,
  Layers,
  Sparkles,
  Scale,
  Video,
  Eye,
  Check,
  Clock,
  Car,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Home,
  Building2,
} from 'lucide-react';

const formatPrice = (price, listingType) => {
  if (!price) return 'Price on Request';
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lakh`;
  }
  return `₹${price.toLocaleString('en-IN')}${listingType === 'rent' ? '/mo' : ''}`;
};

const PropertyDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCompare, removeFromCompare, isCompared } = useCompare();

  const [property, setProperty] = useState(null);
  const [relatedProperties, setRelatedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showMediaTour, setShowMediaTour] = useState(false);
  const [tourInitialMode, setTourInitialMode] = useState('auto');
  const [isFavorited, setIsFavorited] = useState(false);

  // Auto-open 360 tour if ?tour=360 in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tour') === '360') {
      setShowMediaTour(true);
      setTourInitialMode('360');
    }
  }, [location.search]);

  // Modals state
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);

  // Enquiry form state
  const [enquiryMessage, setEnquiryMessage] = useState(
    'Hi, I am interested in this property and would like to schedule an escorted inspection with the assigned in-house broker.'
  );
  const [preferredTime, setPreferredTime] = useState('Anytime');
  const [clientBudget, setClientBudget] = useState('');
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Visit form state
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('11:00 AM');
  const [visitNotes, setVisitNotes] = useState('');
  const [visitSubmitting, setVisitSubmitting] = useState(false);
  const [visitSuccess, setVisitSuccess] = useState(false);

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/properties/${id}`);
        const prop = res.data.property;
        setProperty(prop);
        if (prop?.price) {
          setClientBudget(prop.price.toString());
        }

        // Fetch related properties in same locality or city
        if (prop?.locality || prop?.city) {
          api
            .get('/properties', {
              params: { locality: prop.locality || prop.city, limit: 5 },
            })
            .then((relRes) => {
              const rel = (relRes.data?.properties || []).filter((p) => p._id !== prop._id);
              setRelatedProperties(rel.slice(0, 4));
            })
            .catch(() => {});
        }
      } catch (err) {
        console.error('Failed to load property details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setEnquirySubmitting(true);
    try {
      await api.post('/enquiries', {
        propertyId: property._id,
        message: enquiryMessage,
        preferredTime,
        budget: Number(clientBudget) || property.price,
      });
      setEnquirySuccess(true);
      setTimeout(() => {
        setEnquirySuccess(false);
        setEnquiryModalOpen(false);
      }, 2500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit enquiry');
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!visitDate) {
      alert('Please select a visit date');
      return;
    }

    setVisitSubmitting(true);
    try {
      await api.post('/visits', {
        propertyId: property._id,
        scheduledDate: visitDate,
        scheduledTime: visitTime,
        brokerNotes: visitNotes,
      });
      setVisitSuccess(true);
      setTimeout(() => {
        setVisitSuccess(false);
        setVisitModalOpen(false);
      }, 2500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule visit');
    } finally {
      setVisitSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    alert('Property link copied to clipboard!');
  };

  const handleToggleFavorite = async () => {
    setIsFavorited(!isFavorited);
    try {
      await api.post(`/client/favorites/${property._id}`);
    } catch (err) {
      setIsFavorited(isFavorited);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#C62828] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-bold text-[#717171]">Loading verified property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-[#222222]">Property Not Found</h2>
        <p className="text-xs text-[#717171]">The property listing may have expired or been unlisted.</p>
        <Link
          to="/marketplace"
          className="inline-block px-5 py-2.5 bg-[#C62828] text-white rounded-xl text-xs font-bold"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const broker = typeof property.assignedBrokerId === 'object' && property.assignedBrokerId !== null
    ? property.assignedBrokerId
    : null;

  const rawImages = Array.isArray(property.images) ? property.images : [];
  const images = rawImages.length > 0
    ? rawImages.map((img) =>
        typeof img === 'string'
          ? { url: img }
          : img && img.url
          ? img
          : { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' }
      )
    : [{ url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' }];

  const amenitiesList = Array.isArray(property.amenities)
    ? property.amenities
    : typeof property.amenities === 'string'
    ? property.amenities.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const has360 =
    property.threeDExperience?.status === 'published' ||
    (property.threeDExperience?.panoramaScenes?.length > 0) ||
    (property.categorizedMedia?.panoramas?.length > 0);

  const hasWalkthroughVideo =
    (property.videos && property.videos.length > 0) ||
    (property.categorizedMedia?.walkthroughVideos && property.categorizedMedia.walkthroughVideos.length > 0);

  const compared = isCompared?.(property._id);

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 1. Header: Title, Location & Quick Actions (Airbnb Style) */}
        <div className="space-y-2">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-[#C62828] uppercase tracking-wider mb-1">
                <span>FOR {property.listingType?.toUpperCase()}</span>
                <span>•</span>
                <span className="capitalize">{property.propertyType?.replace('_', ' ')}</span>
                {property.featured && (
                  <>
                    <span>•</span>
                    <span className="text-amber-600 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Exclusive
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight">
                {property.title}
              </h1>
              <div className="flex items-center space-x-2 text-xs text-[#717171] mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#C62828] shrink-0" />
                <span>
                  {property.address ? `${property.address}, ` : ''}
                  {property.locality}, {property.city} - {property.pincode}
                </span>
              </div>
            </div>

            {/* Action Buttons: Share, Favorite, Compare */}
            <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-[#EBEBEB] hover:bg-[#F7F7F7] text-xs font-bold text-[#222222] transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={handleToggleFavorite}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-[#EBEBEB] hover:bg-[#F7F7F7] text-xs font-bold text-[#222222] transition"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    isFavorited ? 'fill-[#C62828] text-[#C62828]' : 'text-[#222222]'
                  }`}
                />
                <span>{isFavorited ? 'Saved' : 'Save'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  compared ? removeFromCompare?.(property._id) : addToCompare?.(property);
                }}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full border text-xs font-bold transition ${
                  compared
                    ? 'border-[#C62828] bg-red-50 text-[#C62828]'
                    : 'border-[#EBEBEB] hover:bg-[#F7F7F7] text-[#222222]'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-[#C62828]" />
                <span>{compared ? 'Compared ✓' : '+ Compare'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Interactive 3D / 360 Tour Experience Viewport (When Active) */}
        {showMediaTour && (
          <div className="rounded-3xl overflow-hidden border border-[#EBEBEB] shadow-xl animate-fade-in mb-6">
            <ErrorBoundary>
              <PropertyMediaExperienceViewer
                property={property}
                onClose={() => setShowMediaTour(false)}
              />
            </ErrorBoundary>
          </div>
        )}

        {/* 3. Airbnb Signature 5-Photo Gallery Grid (Desktop) / Carousel (Mobile) */}
        {!showMediaTour && (
          <div className="relative">
            {/* Desktop 5-Photo Grid */}
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[420px] rounded-3xl overflow-hidden">
              {/* Main Large Hero Image (Cols 1-2, Rows 1-2) */}
              <div
                onClick={() => setGalleryModalOpen(true)}
                className="col-span-2 row-span-2 relative group overflow-hidden cursor-pointer bg-gray-100"
              >
                <img
                  src={images[0]?.url}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                />
              </div>

              {/* Grid Photo 2 */}
              <div
                onClick={() => setGalleryModalOpen(true)}
                className="col-span-1 row-span-1 relative group overflow-hidden cursor-pointer bg-gray-100"
              >
                <img
                  src={images[1]?.url || images[0]?.url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              {/* Grid Photo 3 */}
              <div
                onClick={() => setGalleryModalOpen(true)}
                className="col-span-1 row-span-1 relative group overflow-hidden cursor-pointer bg-gray-100"
              >
                <img
                  src={images[2]?.url || images[0]?.url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              {/* Grid Photo 4 */}
              <div
                onClick={() => setGalleryModalOpen(true)}
                className="col-span-1 row-span-1 relative group overflow-hidden cursor-pointer bg-gray-100"
              >
                <img
                  src={images[3]?.url || images[0]?.url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              {/* Grid Photo 5 */}
              <div
                onClick={() => setGalleryModalOpen(true)}
                className="col-span-1 row-span-1 relative group overflow-hidden cursor-pointer bg-gray-100"
              >
                <img
                  src={images[4]?.url || images[0]?.url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
            </div>

            {/* Mobile Single Photo Carousel */}
            <div className="md:hidden relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={images[activeImageIndex]?.url}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-bold">
                  {activeImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Floating Action Badges on Gallery */}
            <div className="absolute bottom-4 right-4 flex items-center space-x-2 z-10">
              {has360 && (
                <button
                  type="button"
                  onClick={() => {
                    setTourInitialMode('360');
                    setShowMediaTour(true);
                  }}
                  className="px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center space-x-1.5"
                >
                  <Compass className="w-4 h-4 animate-spin-slow" />
                  <span>360° Virtual Tour</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setGalleryModalOpen(true)}
                className="px-3.5 py-2 bg-white/95 hover:bg-white text-[#222222] rounded-xl text-xs font-bold shadow-md border border-[#EBEBEB] transition flex items-center space-x-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Show all {images.length} photos</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. Two-Column Main Layout: Details on Left (8 Cols), Sticky Booking Card on Right (4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          {/* LEFT COLUMN: Overview, Host Broker, Specs, Description, Amenities */}
          <div className="lg:col-span-8 space-y-8">
            {/* Overview Headline */}
            <div className="pb-6 border-b border-[#EBEBEB]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#222222]">
                    Entire {property.propertyType?.replace('_', ' ')} in {property.locality}
                  </h2>
                  <div className="flex items-center space-x-2 text-xs text-[#717171] mt-1 font-semibold">
                    {property.bedrooms > 0 && <span>{property.bedrooms} Bedrooms</span>}
                    {property.bedrooms > 0 && <span>•</span>}
                    {property.bathrooms > 0 && <span>{property.bathrooms} Bathrooms</span>}
                    {property.bathrooms > 0 && <span>•</span>}
                    <span>{property.area} {property.areaUnit || 'sq ft'}</span>
                    <span>•</span>
                    <span className="capitalize">{property.furnishing?.replace('-', ' ')}</span>
                  </div>
                </div>

                {broker && (
                  <img
                    src={broker.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                    alt={broker.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#C62828] shadow-sm shrink-0"
                  />
                )}
              </div>
            </div>

            {/* In-House Broker Representation & Trust Highlights */}
            <div className="space-y-4 pb-6 border-b border-[#EBEBEB]">
              <div className="flex items-start space-x-4">
                <ShieldCheck className="w-6 h-6 text-[#C62828] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#222222]">Dedicated Licensed In-House Broker</h4>
                  <p className="text-xs text-[#717171] mt-0.5 leading-relaxed">
                    Assigned broker {broker?.name || 'Redstone Team'} has physically inspected this property, verified documents, and will escort your site visit.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#222222]">100% Owner Contact Privacy Protection</h4>
                  <p className="text-xs text-[#717171] mt-0.5 leading-relaxed">
                    Zero spam or unsolicited phone calls. All scheduling and negotiations flow through our licensed brokerage team.
                  </p>
                </div>
              </div>

              {has360 && (
                <div className="flex items-start space-x-4">
                  <Compass className="w-6 h-6 text-[#C62828] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-[#222222]">360° Spherical Virtual Tour Available</h4>
                    <p className="text-xs text-[#717171] mt-0.5 leading-relaxed">
                      Inspect the living room, bedrooms, and kitchen virtually in 360° before booking your physical site visit.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Property Specifications Grid */}
            <div className="space-y-3 pb-6 border-b border-[#EBEBEB]">
              <h3 className="text-base font-extrabold text-[#222222]">Property Specifications</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#F7F7F7] rounded-2xl">
                  <span className="text-[#717171] text-[10px] font-bold uppercase">Floor Level</span>
                  <p className="font-extrabold text-[#222222] mt-0.5">
                    {property.floorNumber ? `${property.floorNumber} of ${property.totalFloors}` : 'Mid Floor'}
                  </p>
                </div>

                <div className="p-3 bg-[#F7F7F7] rounded-2xl">
                  <span className="text-[#717171] text-[10px] font-bold uppercase">Facing</span>
                  <p className="font-extrabold text-[#222222] mt-0.5">{property.facing || 'East'}</p>
                </div>

                <div className="p-3 bg-[#F7F7F7] rounded-2xl">
                  <span className="text-[#717171] text-[10px] font-bold uppercase">Reserved Parking</span>
                  <p className="font-extrabold text-[#222222] mt-0.5 capitalize">{property.parking || '1 Covered Slot'}</p>
                </div>

                <div className="p-3 bg-[#F7F7F7] rounded-2xl">
                  <span className="text-[#717171] text-[10px] font-bold uppercase">Availability</span>
                  <p className="font-extrabold text-[#222222] mt-0.5 capitalize">
                    {property.availability?.replace('_', ' ') || 'Ready to Move'}
                  </p>
                </div>

                <div className="p-3 bg-[#F7F7F7] rounded-2xl">
                  <span className="text-[#717171] text-[10px] font-bold uppercase">Age of Property</span>
                  <p className="font-extrabold text-[#222222] mt-0.5 capitalize">
                    {property.ageOfProperty?.replace('_', ' ') || '0-2 Years'}
                  </p>
                </div>

                <div className="p-3 bg-[#F7F7F7] rounded-2xl">
                  <span className="text-[#717171] text-[10px] font-bold uppercase">Balconies</span>
                  <p className="font-extrabold text-[#222222] mt-0.5">{property.balconies || 2} Open Balconies</p>
                </div>
              </div>
            </div>

            {/* Description / About this Property */}
            <div className="space-y-3 pb-6 border-b border-[#EBEBEB]">
              <h3 className="text-base font-extrabold text-[#222222]">About this Property</h3>
              <p className="text-xs sm:text-sm text-[#717171] leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            {amenitiesList.length > 0 && (
              <div className="space-y-4 pb-6 border-b border-[#EBEBEB]">
                <h3 className="text-base font-extrabold text-[#222222]">What this property offers</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenitiesList.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2.5 p-3 rounded-2xl border border-[#EBEBEB] text-xs font-semibold text-[#222222]"
                    >
                      <Check className="w-4 h-4 text-[#C62828] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assigned In-House Broker Profile */}
            {broker && (
              <div className="p-6 rounded-3xl border border-[#EBEBEB] bg-[#F7F7F7] space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={broker.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
                    alt={broker.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C62828] shadow-sm"
                  />
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#C62828] tracking-wider">
                      Assigned Licensed In-House Broker
                    </span>
                    <h4 className="text-base font-extrabold text-[#222222]">{broker.name}</h4>
                    <p className="text-xs text-[#717171]">
                      {broker.experienceYears || '7+'} Years Experience • {broker.licenseNumber || 'DL-REA-2021-9872'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 bg-white rounded-xl border border-[#EBEBEB]">
                    <span className="text-[#717171] text-[10px] font-bold">Specialization</span>
                    <p className="font-bold text-[#222222]">
                      {Array.isArray(broker.specialization) ? broker.specialization.join(', ') : broker.specialization || 'Residential Flats'}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#EBEBEB]">
                    <span className="text-[#717171] text-[10px] font-bold">Consultant Rating</span>
                    <p className="font-bold text-amber-700 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {broker.rating || '4.95'} / 5.0 (Verified Closures)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sticky Booking / Enquiry Panel (Airbnb Style) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-3xl p-6 border border-[#EBEBEB] shadow-[0_6px_24px_rgba(0,0,0,0.08)] space-y-5">
              {/* Price Display */}
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-[#222222]">
                    {formatPrice(property.price, property.listingType)}
                  </span>
                  {property.listingType === 'rent' && (
                    <span className="text-xs font-semibold text-[#717171]">/ month</span>
                  )}
                </div>
                {property.pricePerSqFt && (
                  <p className="text-xs text-[#717171] mt-0.5">
                    ₹{Number(property.pricePerSqFt) ? Number(property.pricePerSqFt).toLocaleString('en-IN') : property.pricePerSqFt} per {property.areaUnit || 'sq ft'}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => setVisitModalOpen(true)}
                  className="w-full py-3.5 px-4 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Accompanied Visit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEnquiryModalOpen(true)}
                  className="w-full py-3.5 px-4 bg-white hover:bg-[#F7F7F7] text-[#222222] border-2 border-[#222222] rounded-2xl font-bold text-xs transition flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4 text-[#C62828]" />
                  <span>Send Direct Enquiry</span>
                </button>
              </div>

              {/* Verified Privacy Note */}
              <div className="p-4 bg-[#F7F7F7] rounded-2xl border border-[#EBEBEB] text-[11px] text-[#717171] space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-[#222222]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Zero Spam Guarantee</span>
                </div>
                <p className="leading-relaxed">
                  Your contact details are strictly protected. Only our assigned licensed broker contacts you to arrange visits.
                </p>
              </div>

              {/* Brokerage Transparency */}
              <div className="flex items-center justify-between text-xs text-[#717171] pt-2 border-t border-[#EBEBEB]">
                <span>Brokerage Rate</span>
                <span className="font-bold text-[#222222]">Standard 2% on Closure</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Related Properties Section */}
        {relatedProperties && relatedProperties.length > 0 && (
          <section className="pt-10 border-t border-[#EBEBEB] space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight">
              Similar Verified Properties in {property.locality || property.city}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProperties.map((relProp) => (
                <PropertyCard key={relProp._id} property={relProp} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Schedule Visit Modal */}
      <Modal
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        title="Schedule Property Visit"
      >
        {visitSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-base text-[#222222]">Visit Request Confirmed!</h4>
            <p className="text-xs text-[#717171]">
              Assigned broker {broker?.name || 'Redstone Team'} will coordinate with the owner and confirm your time slot.
            </p>
          </div>
        ) : (
          <form onSubmit={handleVisitSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-[#F7F7F7] rounded-xl text-xs font-semibold text-[#222222]">
              Property: <strong>{property.title}</strong>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#717171] mb-1">Visit Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-[#EBEBEB] bg-[#F7F7F7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717171] mb-1">Time Slot</label>
                <select
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#EBEBEB] bg-[#F7F7F7] focus:outline-none"
                >
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:30 PM">05:30 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#717171] mb-1">Special Notes</label>
              <textarea
                rows="3"
                placeholder="e.g. Bringing family members, parking required..."
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#EBEBEB] bg-[#F7F7F7] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={visitSubmitting}
              className="w-full py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              {visitSubmitting ? 'Submitting Request...' : 'Confirm Visit Booking'}
            </button>
          </form>
        )}
      </Modal>

      {/* Direct Enquiry Modal */}
      <Modal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        title="Send Enquiry to Assigned Broker"
      >
        {enquirySuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-base text-[#222222]">Enquiry Dispatched!</h4>
            <p className="text-xs text-[#717171]">
              Our in-house broker will review your budget and reply directly via phone or dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleEnquirySubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-[#717171] mb-1">Your Message</label>
              <textarea
                rows="4"
                value={enquiryMessage}
                onChange={(e) => setEnquiryMessage(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-[#EBEBEB] bg-[#F7F7F7] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#717171] mb-1">Preferred Time</label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#EBEBEB] bg-[#F7F7F7] focus:outline-none"
                >
                  <option value="Anytime">Anytime</option>
                  <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                  <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717171] mb-1">Your Target Budget (₹)</label>
                <input
                  type="number"
                  value={clientBudget}
                  onChange={(e) => setClientBudget(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#EBEBEB] bg-[#F7F7F7] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={enquirySubmitting}
              className="w-full py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              {enquirySubmitting ? 'Sending Enquiry...' : 'Submit Enquiry'}
            </button>
          </form>
        )}
      </Modal>

      {/* Full Photo Gallery Modal */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 animate-fade-in text-white">
          <div className="flex items-center justify-between pb-4">
            <span className="text-xs font-bold text-gray-400">
              {activeImageIndex + 1} of {images.length} Photos
            </span>
            <button
              type="button"
              onClick={() => setGalleryModalOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
            >
              Close ✕
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center max-w-5xl mx-auto w-full overflow-hidden">
            <img
              src={images[activeImageIndex]?.url}
              alt=""
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                  }
                  className="absolute left-2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                  }
                  className="absolute right-2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="flex items-center justify-center space-x-2 overflow-x-auto py-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                  activeImageIndex === idx ? 'border-[#C62828] scale-105' : 'border-transparent opacity-60'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;
