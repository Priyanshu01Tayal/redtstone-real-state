import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Scale,
  Sparkles,
  ShieldCheck,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Compass,
} from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import api from '../../services/api';

const formatPrice = (price, listingType) => {
  if (!price) return 'Price on Request';
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lakh`;
  }
  return `₹${price.toLocaleString('en-IN')}${listingType === 'rent' ? '/mo' : ''}`;
};

const PropertyCard = ({ property, onFavoriteToggle }) => {
  const { addToCompare, removeFromCompare, isCompared } = useCompare();
  const [isFavorited, setIsFavorited] = useState(property?.isFavorited || false);
  const [favLoading, setFavLoading] = useState(false);

  if (!property) return null;

  const compared = isCompared?.(property._id);

  const images = property.images && property.images.length > 0
    ? property.images
    : [{ url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' }];

  const mainImage = images[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

  const has360 =
    property.threeDExperience?.status === 'published' ||
    (property.threeDExperience?.panoramaScenes && property.threeDExperience.panoramaScenes.length > 0) ||
    (property.categorizedMedia?.panoramas && property.categorizedMedia.panoramas.length > 0);

  const isVerified = property.verificationStatus === 'VERIFIED' || property.approvalStatus === 'approved';

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);

    try {
      setFavLoading(true);
      await api.post(`/client/favorites/${property._id}`);
      if (onFavoriteToggle) onFavoriteToggle(property._id, !isFavorited);
    } catch (err) {
      // Revert if API fails
      setIsFavorited(isFavorited);
    } finally {
      setFavLoading(false);
    }
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (compared) {
      removeFromCompare?.(property._id);
    } else {
      addToCompare?.(property);
    }
  };

  return (
    <div className="group flex flex-col cursor-pointer transition-all duration-300">
      {/* 4:3 Aspect Ratio Image Container (Airbnb Style) */}
      <Link to={`/properties/${property._id}`} className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100">
        <img
          src={mainImage}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          {property.featured && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/95 backdrop-blur-md text-[#222222] shadow-sm flex items-center gap-1 border border-gray-100">
              <Sparkles className="w-3 h-3 text-[#C62828] fill-current" />
              Verified Exclusive
            </span>
          )}

          {has360 && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#C62828] text-white shadow-md flex items-center gap-1">
              <Compass className="w-3 h-3 animate-spin-slow" />
              360° Tour
            </span>
          )}
        </div>

        {/* Favorite Heart Button (Top Right) */}
        <button
          type="button"
          onClick={handleHeartClick}
          disabled={favLoading}
          className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 active:scale-95 transition-transform duration-200 z-10"
          aria-label="Save to favorites"
        >
          <Heart
            className={`w-5 h-5 transition-colors duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${
              isFavorited
                ? 'fill-[#C62828] text-[#C62828]'
                : 'fill-black/30 text-white hover:fill-black/50'
            }`}
          />
        </button>

        {/* Compare Quick Toggle (Bottom Right Hover) */}
        <button
          type="button"
          onClick={handleCompareClick}
          className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md transition-all shadow-sm flex items-center space-x-1 z-10 ${
            compared
              ? 'bg-[#C62828] text-white'
              : 'bg-white/90 text-[#222222] hover:bg-white border border-gray-200'
          }`}
          title="Compare property"
        >
          <Scale className="w-3 h-3" />
          <span>{compared ? 'Compared ✓' : '+ Compare'}</span>
        </button>

        {/* Listing Type Tag (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white">
            For {property.listingType === 'rent' ? 'Rent' : 'Sale'}
          </span>
        </div>
      </Link>

      {/* Property Details (Airbnb Minimalist Clean Hierarchy) */}
      <Link to={`/properties/${property._id}`} className="mt-3 flex flex-col text-left space-y-1">
        {/* Row 1: Location & Rating/Verification */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-[#222222] truncate">
            {property.locality}, {property.city}
          </span>
          {isVerified && (
            <span className="flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0 ml-1">
              <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-600" />
              Verified
            </span>
          )}
        </div>

        {/* Row 2: Property Title / Description */}
        <h4 className="text-xs text-[#717171] truncate group-hover:text-[#222222] transition">
          {property.title}
        </h4>

        {/* Row 3: Specs (BHK • Baths • Area) */}
        <div className="flex items-center space-x-1.5 text-[11px] text-[#717171]">
          {property.bedrooms > 0 && <span>{property.bedrooms} BHK</span>}
          {property.bedrooms > 0 && <span>•</span>}
          {property.bathrooms > 0 && <span>{property.bathrooms} Baths</span>}
          {property.bathrooms > 0 && <span>•</span>}
          <span>{property.area} {property.areaUnit || 'sq ft'}</span>
        </div>

        {/* Row 4: Price & Rate */}
        <div className="pt-1 flex items-baseline space-x-1.5">
          <span className="text-sm font-extrabold text-[#222222]">
            {formatPrice(property.price, property.listingType)}
          </span>
          {property.listingType === 'rent' && (
            <span className="text-[11px] text-[#717171]">/ month</span>
          )}
          {property.pricePerSqFt && property.listingType !== 'rent' && (
            <span className="text-[10px] text-[#717171]">
              (₹{property.pricePerSqFt.toLocaleString('en-IN')}/sq.ft)
            </span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;
