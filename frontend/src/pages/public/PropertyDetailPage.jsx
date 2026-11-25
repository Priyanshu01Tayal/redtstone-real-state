import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import PropertyMediaExperienceViewer from '../../components/media/PropertyMediaExperienceViewer';
import { useCompare } from '../../context/CompareContext';
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
  Mail,
  Building,
  Compass,
  Layers,
  Clock,
  Car,
  Eye,
  Sparkles,
  Scale,
  Video,
} from 'lucide-react';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCompare, removeFromCompare, isCompared } = useCompare();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showMediaTour, setShowMediaTour] = useState(false);
  const [tourInitialMode, setTourInitialMode] = useState('auto');
  const [reviewActionLoading, setReviewActionLoading] = useState(false);

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

  // Enquiry form state
  const [enquiryMessage, setEnquiryMessage] = useState(
    'Hi, I am interested in this property and would like more details regarding terms and availability.'
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
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        setProperty(res.data.property);
        if (res.data.property?.price) {
          setClientBudget(res.data.property.price.toString());
        }
      } catch (err) {
        console.error('Failed to load property details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
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
      alert('Please select a preferred visit date');
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-[#C62828] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-gray-500">Loading verified property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-[#222222]">Property Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">The property may have been sold or unlisted.</p>
        <Link to="/" className="inline-block mt-4 text-[#C62828] font-bold">
          ← Return to Home
        </Link>
      </div>
    );
  }

  const broker = property.assignedBrokerId;
  const images = property.images && property.images.length > 0 ? property.images : [{ url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' }];

  // 3D / 360 / Walkthrough Experience Capabilities Detection
  const has3DModel = property.threeDExperience?.experienceType === '3d_mesh' && !!property.threeDExperience?.modelUrl;
  const has360Pano = (property.threeDExperience?.experienceType === '360_tour') ||
    (property.threeDExperience?.panoramaScenes?.length > 0) ||
    (property.categorizedMedia?.panoramas?.length > 0) ||
    (property.images?.some((img) => img.isPanorama));
  const hasPhotoTour = (property.threeDExperience?.walkthroughRooms?.length > 0) ||
    (property.images && property.images.length > 0);
  const hasVideoWalkthrough = (property.videos && property.videos.length > 0) ||
    (property.categorizedMedia?.walkthroughVideos && property.categorizedMedia.walkthroughVideos.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500">
          <Link to="/" className="hover:text-[#C62828]">Home</Link>
          <span>/</span>
          <Link to={`/${property.listingType === 'sale' ? 'buy' : 'rent'}`} className="hover:text-[#C62828] capitalize">
            {property.listingType}
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-xs">{property.title}</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Compare Property Button */}
          <button
            onClick={() => {
              isCompared?.(property._id)
                ? removeFromCompare?.(property._id)
                : addToCompare?.(property);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
              isCompared?.(property._id)
                ? 'bg-red-50 text-[#C62828] border-red-200 shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-[#C62828]" />
            <span>{isCompared?.(property._id) ? 'Added to Compare ✓' : '+ Compare'}</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Property link copied to clipboard!');
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Broker / Admin 3D Experience Management Bar */}
      {(user?.role === 'admin' || user?.role === 'broker') && (
        <div className="bg-gradient-to-r from-gray-900 to-[#222222] text-white p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center space-x-3 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E53935] animate-ping" />
            <div>
              <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">
                Interactive Media Experience Lifecycle
              </span>
              <span className="font-extrabold text-white">
                Status: <span className="text-[#E53935] uppercase">{property.threeDExperience?.status || 'NOT_REQUESTED'}</span>
                {' '}({property.threeDExperience?.experienceType || 'Standard Media'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowMediaTour(true);
              }}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> Preview Tour
            </button>

            {property.threeDExperience?.status === 'ready_for_review' && (
              <button
                disabled={reviewActionLoading}
                onClick={async () => {
                  setReviewActionLoading(true);
                  try {
                    await api.put(`/properties/${property._id}/3d-experience/review`, { action: 'approve' });
                    setProperty((prev) => ({
                      ...prev,
                      threeDExperience: { ...prev.threeDExperience, status: 'approved' },
                    }));
                    alert('Experience approved! You can now publish it.');
                  } catch (e) {
                    alert('Action failed: ' + e.message);
                  } finally {
                    setReviewActionLoading(false);
                  }
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
              >
                ✓ Approve Experience
              </button>
            )}

            {(property.threeDExperience?.status === 'approved' || property.threeDExperience?.status === 'ready_for_review') && (
              <button
                disabled={reviewActionLoading}
                onClick={async () => {
                  setReviewActionLoading(true);
                  try {
                    await api.put(`/properties/${property._id}/3d-experience/review`, { action: 'publish' });
                    setProperty((prev) => ({
                      ...prev,
                      threeDExperience: { ...prev.threeDExperience, status: 'published' },
                    }));
                    alert('Experience published to public property page!');
                  } catch (e) {
                    alert('Publish failed: ' + e.message);
                  } finally {
                    setReviewActionLoading(false);
                  }
                }}
                className="px-3 py-1.5 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl text-xs font-bold transition"
              >
                Publish Experience
              </button>
            )}
          </div>
        </div>
      )}

      {/* Title & Price Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EEEEEE] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#C62828] text-white">
              FOR {property.listingType?.toUpperCase()}
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-800 capitalize">
              {property.propertyType?.replace('_', ' ')}
            </span>
            {property.featured && (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Verified Exclusive
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#222222]">{property.title}</h1>
          <div className="flex items-center text-xs font-medium text-gray-500 mt-2">
            <MapPin className="w-4 h-4 text-[#C62828] mr-1 shrink-0" />
            <span>{property.address}, {property.locality}, {property.city}, {property.state} - {property.pincode}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="lg:text-right border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
          <div className="text-3xl sm:text-4xl font-black text-[#C62828]">
            {property.price >= 10000000
              ? `₹${(property.price / 10000000).toFixed(2)} Cr`
              : `₹${property.price.toLocaleString('en-IN')}`}
            {property.listingType === 'rent' && <span className="text-sm font-semibold text-gray-500"> / month</span>}
          </div>
          {property.pricePerSqFt && (
            <p className="text-xs text-gray-500 mt-1 font-semibold">
              ₹{property.pricePerSqFt.toLocaleString('en-IN')} per {property.areaUnit || 'sq ft'}
            </p>
          )}
        </div>
      </div>

      {/* Media Gallery & Interactive Experience Controls */}
      <div className="space-y-4">
        {/* Experience Switcher Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EEEEEE] shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {/* 3D Model Tour Button (ONLY rendered when valid 3D model exists) */}
            {has3DModel && (
              <button
                onClick={() => {
                  setTourInitialMode('3d');
                  setShowMediaTour(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-[#C62828] text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>3D Spatial Tour</span>
              </button>
            )}

            {/* 360 Panorama Tour Button (ONLY rendered when panoramic media exists) */}
            {has360Pano && (
              <button
                onClick={() => {
                  setTourInitialMode('360');
                  setShowMediaTour(true);
                }}
                className="px-4 py-2 bg-[#222222] hover:bg-[#C62828] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5"
              >
                <Compass className="w-4 h-4 text-[#E53935]" />
                <span>360° Virtual Tour</span>
              </button>
            )}

            {/* Photo Walkthrough Tour Button */}
            {hasPhotoTour && (
              <button
                onClick={() => {
                  setTourInitialMode('walkthrough');
                  setShowMediaTour(true);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Eye className="w-4 h-4 text-gray-600" />
                <span>Photo Walkthrough</span>
              </button>
            )}

            {/* Video Walkthrough Button */}
            {hasVideoWalkthrough && (
              <a
                href="#video-section"
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Video className="w-4 h-4 text-[#C62828]" />
                <span>Video Tour</span>
              </a>
            )}
          </div>

          <div className="text-xs text-gray-400 font-semibold hidden md:block">
            {images.length} High-Res Verified Photos
          </div>
        </div>

        {/* Interactive Experience Modal / Drawer Viewport */}
        {showMediaTour && (
          <div className="mb-6 animate-fade-in">
            <PropertyMediaExperienceViewer
              property={property}
              onClose={() => setShowMediaTour(false)}
            />
          </div>
        )}

        {/* Main Photo Viewport */}
        {!showMediaTour && (
          <div className="relative h-[380px] sm:h-[500px] w-full rounded-3xl overflow-hidden bg-gray-900 border border-[#EEEEEE] shadow-md group">
            <img
              src={images[activeImageIndex]?.url}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
            />
            {images[activeImageIndex]?.caption && (
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-xl text-white text-xs font-bold">
                {images[activeImageIndex].caption}
              </div>
            )}

            {/* Floating 360/Tour CTA on Top-Right of Main Photo */}
            {(has360Pano || hasPhotoTour) && (
              <button
                onClick={() => {
                  setTourInitialMode(has360Pano ? '360' : 'walkthrough');
                  setShowMediaTour(true);
                }}
                className="absolute top-4 right-4 bg-[#C62828]/95 hover:bg-[#B71C1C] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center space-x-1.5 transition transform hover:scale-105"
              >
                <Compass className="w-4 h-4" />
                <span>{has360Pano ? 'Launch 360° Tour' : 'Launch Walkthrough'}</span>
              </button>
            )}
          </div>
        )}

        {/* Thumbnail Selector */}
        {!showMediaTour && images.length > 1 && (
          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                  activeImageIndex === idx ? 'border-[#C62828] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Details on Left, Broker & Actions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Overview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Specs Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#EEEEEE] shadow-sm text-center">
              <span className="text-xs text-gray-500 font-semibold block">Total Area</span>
              <div className="flex items-center justify-center space-x-1 font-black text-lg text-[#222222] mt-1">
                <Maximize2 className="w-4 h-4 text-[#C62828]" />
                <span>{property.area} {property.areaUnit || 'sq ft'}</span>
              </div>
            </div>

            {property.bedrooms > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-[#EEEEEE] shadow-sm text-center">
                <span className="text-xs text-gray-500 font-semibold block">Bedrooms</span>
                <div className="flex items-center justify-center space-x-1 font-black text-lg text-[#222222] mt-1">
                  <Bed className="w-4 h-4 text-[#C62828]" />
                  <span>{property.bedrooms} BHK</span>
                </div>
              </div>
            )}

            {property.bathrooms > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-[#EEEEEE] shadow-sm text-center">
                <span className="text-xs text-gray-500 font-semibold block">Bathrooms</span>
                <div className="flex items-center justify-center space-x-1 font-black text-lg text-[#222222] mt-1">
                  <Bath className="w-4 h-4 text-[#C62828]" />
                  <span>{property.bathrooms} Baths</span>
                </div>
              </div>
            )}

            <div className="bg-white p-4 rounded-2xl border border-[#EEEEEE] shadow-sm text-center">
              <span className="text-xs text-gray-500 font-semibold block">Furnishing</span>
              <div className="flex items-center justify-center space-x-1 font-black text-sm text-[#222222] mt-1 capitalize">
                <span>{property.furnishing?.replace('-', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Detailed Specifications */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EEEEEE] shadow-sm">
            <h3 className="text-lg font-black text-[#222222] mb-4">Property Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-gray-400 font-semibold">Floor</span>
                <p className="font-bold text-gray-800 text-sm mt-0.5">{property.floorNumber} of {property.totalFloors}</p>
              </div>
              <div>
                <span className="text-gray-400 font-semibold">Facing</span>
                <p className="font-bold text-gray-800 text-sm mt-0.5">{property.facing || 'East'}</p>
              </div>
              <div>
                <span className="text-gray-400 font-semibold">Parking</span>
                <p className="font-bold text-gray-800 text-sm mt-0.5 capitalize">{property.parking || '1 Covered'}</p>
              </div>
              <div>
                <span className="text-gray-400 font-semibold">Availability</span>
                <p className="font-bold text-gray-800 text-sm mt-0.5 capitalize">{property.availability?.replace('_', ' ') || 'Immediate'}</p>
              </div>
              <div>
                <span className="text-gray-400 font-semibold">Age of Property</span>
                <p className="font-bold text-gray-800 text-sm mt-0.5 capitalize">{property.ageOfProperty?.replace('_', ' ') || '0-1 Years'}</p>
              </div>
              <div>
                <span className="text-gray-400 font-semibold">Balconies</span>
                <p className="font-bold text-gray-800 text-sm mt-0.5">{property.balconies || 0}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EEEEEE] shadow-sm">
            <h3 className="text-lg font-black text-[#222222] mb-4">About this Property</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EEEEEE] shadow-sm">
              <h3 className="text-lg font-black text-[#222222] mb-4">Amenities & Features</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center space-x-2 p-2.5 rounded-xl bg-[#F8F8F8] border border-gray-100 text-xs font-semibold text-gray-700">
                    <CheckCircle className="w-4 h-4 text-[#C62828] shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Walkthrough if present */}
          {hasVideoWalkthrough && (
            <div id="video-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EEEEEE] shadow-sm">
              <h3 className="text-lg font-black text-[#222222] mb-4">Video Walkthrough</h3>
              <div className="rounded-2xl overflow-hidden aspect-video bg-black">
                <video controls className="w-full h-full object-cover">
                  <source
                    src={
                      property.videos?.[0]?.url ||
                      property.categorizedMedia?.walkthroughVideos?.[0]?.url
                    }
                    type="video/mp4"
                  />
                  Your browser does not support video playback.
                </video>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Broker Representation & Actions */}
        <div className="space-y-6">
          {/* Assigned In-House Broker Card (CRITICAL PRIVACY RULE: Client communicates ONLY with broker) */}
          <div className="bg-white rounded-3xl p-6 border border-[#EEEEEE] shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-0" />

            <div className="relative z-10">
              <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#C62828] mb-3">
                <ShieldCheck className="w-4 h-4" />
                <span>Assigned In-House Broker</span>
              </div>

              {broker ? (
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={broker.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                      alt={broker.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C62828] shadow-md"
                    />
                    <div>
                      <h4 className="font-bold text-base text-[#222222]">{broker.name}</h4>
                      <p className="text-xs text-gray-500 font-medium">Licensed Brokerage Consultant</p>
                      <div className="flex items-center text-xs text-amber-600 font-bold mt-1">
                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                        <span>{broker.rating || '4.9'} / 5.0 Rating</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F8F8F8] p-3 rounded-2xl border border-gray-100 text-xs space-y-1 mb-6 text-gray-600">
                    <p><strong>License:</strong> {broker.licenseNumber || 'DL-REA-2021-9872'}</p>
                    <p><strong>Experience:</strong> {broker.experienceYears || '8'} Years in Real Estate</p>
                    {broker.specialization && (
                      <p>
                        <strong>Expertise:</strong>{' '}
                        {Array.isArray(broker.specialization)
                          ? broker.specialization.join(', ')
                          : broker.specialization}
                      </p>
                    )}
                    {broker.serviceAreas && (
                      <p>
                        <strong>Areas:</strong>{' '}
                        {Array.isArray(broker.serviceAreas)
                          ? broker.serviceAreas.join(', ')
                          : broker.serviceAreas}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 rounded-2xl bg-[#F8F8F8] text-xs text-gray-600">
                  <p className="font-bold text-[#222222] mb-1">RedStone In-House Advisory Desk</p>
                  <p>A senior brokerage consultant is assigned to this listing to guide your inspection and negotiation.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setVisitModalOpen(true)}
                  className="w-full py-3.5 px-4 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Property Visit</span>
                </button>

                <button
                  onClick={() => setEnquiryModalOpen(true)}
                  className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-[#222222] border-2 border-gray-200 rounded-2xl font-bold text-sm transition flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4 text-[#C62828]" />
                  <span>Send Direct Enquiry</span>
                </button>
              </div>

              {/* Privacy Notice */}
              <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-400 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Protected:</strong> All communications flow exclusively through our assigned in-house broker. Zero third-party spam.
                </span>
              </div>
            </div>
          </div>

          {/* Quick Help Box */}
          <div className="bg-[#222222] text-white rounded-3xl p-6 text-xs">
            <h5 className="font-bold text-sm mb-2">Need Immediate Assistance?</h5>
            <p className="text-gray-400 leading-relaxed mb-4">
              Call our central brokerage concierge hotline for expedited physical site tours.
            </p>
            <div className="flex items-center space-x-2 text-[#E53935] font-bold text-sm">
              <Phone className="w-4 h-4" />
              <span>+91 (0124) 480-9900</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      <Modal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        title="Send Enquiry to Assigned Broker"
      >
        {enquirySuccess ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-[#222222]">Enquiry Submitted Successfully!</h4>
            <p className="text-xs text-gray-500">
              The assigned broker and property owner have been notified. Our broker will connect with you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleEnquirySubmit} className="space-y-4">
            <div className="p-3 bg-red-50 rounded-xl text-xs text-[#C62828] font-medium">
              Property: <strong>{property.title}</strong>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Your Message</label>
              <textarea
                rows="4"
                value={enquiryMessage}
                onChange={(e) => setEnquiryMessage(e.target.value)}
                required
                className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#C62828]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Preferred Call Time</label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none"
                >
                  <option value="Anytime">Anytime</option>
                  <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                  <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                  <option value="Weekends Only">Weekends Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Target Budget (₹)</label>
                <input
                  type="number"
                  value={clientBudget}
                  onChange={(e) => setClientBudget(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none"
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

      {/* Schedule Visit Modal */}
      <Modal
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        title="Schedule Property Visit"
      >
        {visitSuccess ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-[#222222]">Visit Scheduled Successfully!</h4>
            <p className="text-xs text-gray-500">
              The property owner has received an automatic notification to confirm availability. Your broker will escort you.
            </p>
          </div>
        ) : (
          <form onSubmit={handleVisitSubmit} className="space-y-4">
            <div className="p-3 bg-red-50 rounded-xl text-xs text-[#C62828] font-medium">
              Scheduling physical visit for: <strong>{property.title}</strong>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Visit Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Preferred Time Slot</label>
                <select
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none"
                >
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                  <option value="06:30 PM">06:30 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Special Requirements / Notes (Optional)</label>
              <textarea
                rows="3"
                placeholder="e.g. Bringing family architect, require parking for 2 cars..."
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={visitSubmitting}
              className="w-full py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              {visitSubmitting ? 'Confirming with Owner & Broker...' : 'Request Visit Confirmation'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default PropertyDetailPage;
