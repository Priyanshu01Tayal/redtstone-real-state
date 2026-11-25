import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize2, MapPin, Shield, Star, Eye, Layers } from 'lucide-react';
import Badge from './Badge';
import { useCompare } from '../../context/CompareContext';
import { useLanguage } from '../../context/LanguageContext';

const formatPrice = (price, listingType) => {
  if (!price) return 'Price on Request';
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lakh`;
  }
  return `₹${price.toLocaleString('en-IN')}${listingType === 'rent' ? '/mo' : ''}`;
};

const PropertyCard = ({ property }) => {
  const { addToCompare, removeFromCompare, isCompared } = useCompare();
  const { t } = useLanguage();
  const compared = isCompared(property?._id);

  if (!property) return null;

  const mainImage =
    property.images && property.images.length > 0
      ? property.images[0].url
      : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

  const broker = property.assignedBrokerId;
  const has360 =
    property.threeDExperience?.status === 'published' ||
    (property.threeDExperience?.panoramaScenes && property.threeDExperience.panoramaScenes.length > 0) ||
    (property.categorizedMedia?.panoramas && property.categorizedMedia.panoramas.length > 0);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#EEEEEE] shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      {/* Property Image Container */}
      <div className="relative h-60 w-full overflow-hidden bg-gray-100">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white ${
              property.listingType === 'sale' ? 'bg-[#C62828]' : 'bg-[#222222]'
            }`}
          >
            FOR {property.listingType?.toUpperCase()}
          </span>

          {property.featured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-gray-900 shadow-sm flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Featured
            </span>
          )}
        </div>

        {/* Property Type Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-black/60 backdrop-blur-md text-white capitalize">
            {property.propertyType?.replace('_', ' ')}
          </span>
        </div>

        {/* Price Tag overlay on bottom */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-md border border-gray-100">
          <span className="text-lg font-black text-[#C62828]">
            {formatPrice(property.price, property.listingType)}
          </span>
          {property.pricePerSqFt && (
            <span className="text-[11px] text-[#777777] font-medium ml-1.5">
              (₹{property.pricePerSqFt.toLocaleString('en-IN')}/{property.areaUnit || 'sq ft'})
            </span>
          )}
        </div>

        {/* 360 Tour Pill Badge */}
        {has360 && (
          <Link
            to={`/properties/${property._id}?tour=360`}
            className="absolute bottom-3 right-3 bg-[#C62828] hover:bg-[#B71C1C] text-white px-3 py-1.5 rounded-xl shadow-lg text-[11px] font-black flex items-center gap-1.5 transition transform hover:scale-105 z-10"
            title="Open 360° Virtual Tour"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>360° Tour</span>
          </Link>
        )}
      </div>

      {/* Property Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center text-xs font-semibold text-[#777777] mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#C62828] mr-1 shrink-0" />
            <span className="truncate">
              {property.locality}, {property.city}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-base text-[#222222] group-hover:text-[#C62828] transition line-clamp-1 mb-3">
            {property.title}
          </h3>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#EEEEEE] text-center my-3 text-xs text-[#777777]">
            {property.bedrooms > 0 ? (
              <div className="flex flex-col items-center">
                <span className="flex items-center font-bold text-[#222222] text-sm">
                  <Bed className="w-4 h-4 mr-1 text-gray-400" />
                  {property.bedrooms} BHK
                </span>
                <span className="text-[10px]">Bedrooms</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="font-bold text-[#222222] text-sm capitalize">
                  {property.category}
                </span>
                <span className="text-[10px]">Category</span>
              </div>
            )}

            {property.bathrooms > 0 ? (
              <div className="flex flex-col items-center border-x border-[#EEEEEE]">
                <span className="flex items-center font-bold text-[#222222] text-sm">
                  <Bath className="w-4 h-4 mr-1 text-gray-400" />
                  {property.bathrooms}
                </span>
                <span className="text-[10px]">Baths</span>
              </div>
            ) : (
              <div className="flex flex-col items-center border-x border-[#EEEEEE]">
                <span className="font-bold text-[#222222] text-sm">Immediate</span>
                <span className="text-[10px]">Possession</span>
              </div>
            )}

            <div className="flex flex-col items-center">
              <span className="flex items-center font-bold text-[#222222] text-sm">
                <Maximize2 className="w-3.5 h-3.5 mr-1 text-gray-400" />
                {property.area}
              </span>
              <span className="text-[10px]">{property.areaUnit || 'sq ft'}</span>
            </div>
          </div>
        </div>

        {/* Assigned Broker Section (CRITICAL PRIVACY RULE: Show assigned broker, NOT owner) */}
        <div className="mt-2 pt-2">
          {broker ? (
            <div className="flex items-center justify-between mb-3 bg-[#F8F8F8] p-2 rounded-xl border border-gray-100">
              <div className="flex items-center space-x-2">
                <img
                  src={broker.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                  alt={broker.name}
                  className="w-7 h-7 rounded-full object-cover border border-white shadow-sm"
                />
                <div className="text-left">
                  <p className="text-[11px] font-bold text-[#222222] truncate max-w-[130px]">
                    {broker.name}
                  </p>
                  <p className="text-[9px] text-[#777777]">In-House Broker</p>
                </div>
              </div>
              <div className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                <Star className="w-3 h-3 fill-current mr-0.5" />
                {broker.rating || '4.8'}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-[11px] text-[#777777] mb-3 bg-gray-50 p-2 rounded-xl">
              <Shield className="w-3.5 h-3.5 text-[#C62828]" />
              <span>Managed by RedStone Advisory Desk</span>
            </div>
          )}

          {/* Action Button & Compare */}
          <div className="flex gap-2">
            <Link
              to={`/properties/${property._id}`}
              className="flex-1 text-center block bg-white hover:bg-[#C62828] text-[#C62828] hover:text-white border-2 border-[#C62828] font-bold text-xs py-2.5 rounded-xl transition shadow-sm group-hover:bg-[#C62828] group-hover:text-white"
            >
              {t('scheduleVisit')}
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                compared ? removeFromCompare(property._id) : addToCompare(property);
              }}
              className={`px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition flex items-center gap-1 ${
                compared
                  ? 'bg-[#222222] text-white border-[#222222]'
                  : 'bg-gray-50 text-gray-700 border-[#EEEEEE] hover:bg-gray-100'
              }`}
              title={compared ? t('removeCompare') : t('compare')}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{compared ? '✓' : '+'} {t('compare')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
