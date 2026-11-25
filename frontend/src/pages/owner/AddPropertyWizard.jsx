import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Home,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Upload,
  IndianRupee,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Layers,
  Camera,
  Compass,
} from 'lucide-react';
import api from '../../services/api';
import PropertyMap from '../../components/map/PropertyMap';
import CategorizedMediaUploader from '../../components/media/CategorizedMediaUploader';

const STEP_LABELS = [
  'Purpose',
  'Category',
  'Type',
  'Specifications',
  'Pricing',
  'Address',
  'Map Pin',
  'Photos & Media',
  'Review & Submit',
];

const NCR_LOCALITY_CENTERS = {
  'Crossing Republik': { lat: 28.629, lng: 77.433 },
  'Indirapuram': { lat: 28.6415, lng: 77.371 },
  'Raj Nagar Extension': { lat: 28.709, lng: 77.447 },
  'Sector 62': { lat: 28.625, lng: 77.362 },
  'Noida Expressway': { lat: 28.535, lng: 77.385 },
  'Greater Noida West': { lat: 28.583, lng: 77.452 },
  'Golf Course Road': { lat: 28.4595, lng: 77.098 },
  'Cyber City': { lat: 28.495, lng: 77.088 },
};

const COMMON_AMENITIES = [
  'Clubhouse',
  'Swimming Pool',
  'Gym',
  'Security',
  'Power Backup',
  'Lift',
  'Visitor Parking',
  'CCTV',
  'Vastu Compliant',
  'Intercom',
  'Fire Fighting System',
  'Rain Water Harvesting',
  'Reserved Parking',
];

const AddPropertyWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    purpose: 'sale',
    category: 'residential',
    propertyType: 'flat',
    title: '',
    description: '',
    bhk: 3,
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    area: 1500,
    areaUnit: 'sq ft',
    builtUpArea: 1650,
    carpetArea: 1350,
    furnishing: 'semi-furnished',
    parking: '1 covered',
    floorNumber: 5,
    totalFloors: 14,
    facing: 'East',
    ageOfProperty: '0-1_years',
    availability: 'immediate',
    amenities: ['Clubhouse', 'Security', 'Power Backup', 'Lift'],
    price: 8500000,
    deposit: 0,
    maintenanceCharges: 3000,
    negotiable: true,
    expectedPrice: 8500000,
    society: '',
    streetAddress: '',
    locality: 'Crossing Republik',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    pincode: '201016',
    coordinates: { lat: 28.629, lng: 77.433 },
    categorizedMedia: {
      exterior: [],
      livingRoom: [
        {
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          caption: 'Living Room',
          isFeatured: true,
          sortOrder: 0,
        },
      ],
      bedrooms: [
        {
          url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
          caption: 'Master Bedroom',
          isFeatured: false,
          sortOrder: 1,
        },
      ],
      kitchen: [],
      bathrooms: [],
      balcony: [],
      other: [],
      walkthroughVideos: [],
      panoramas: [],
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        caption: 'Living Room',
        isFeatured: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
        caption: 'Master Bedroom',
        isFeatured: false,
      },
    ],
    videos: [],
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageCaptionInput, setImageCaptionInput] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocalitySelect = (localityName) => {
    const coords = NCR_LOCALITY_CENTERS[localityName] || { lat: 28.628, lng: 77.3653 };
    setFormData((prev) => ({
      ...prev,
      locality: localityName,
      coordinates: coords,
    }));
  };

  const toggleAmenity = (item) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(item);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== item)
          : [...prev.amenities, item],
      };
    });
  };

  const addImage = () => {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          url: imageUrlInput.trim(),
          caption: imageCaptionInput.trim() || 'Property Photo',
          isFeatured: prev.images.length === 0,
        },
      ],
    }));
    setImageUrlInput('');
    setImageCaptionInput('');
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const nextStep = () => {
    setErrorMsg('');
    if (currentStep === 4 && (!formData.title || !formData.description)) {
      setErrorMsg('Please enter a property title and description.');
      return;
    }
    if (currentStep === 5 && (!formData.price || formData.price <= 0)) {
      setErrorMsg('Please enter a valid price / rent amount.');
      return;
    }
    if (currentStep === 6 && (!formData.locality || !formData.city)) {
      setErrorMsg('Please enter locality and city.');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 9));
  };

  const prevStep = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        ...formData,
        address: `${formData.streetAddress ? formData.streetAddress + ', ' : ''}${formData.society ? formData.society + ', ' : ''}${formData.locality}, ${formData.city}`,
        listingType: formData.purpose,
        location: {
          type: 'Point',
          coordinates: [formData.coordinates.lng, formData.coordinates.lat],
        },
      };

      const res = await api.post('/properties/owner', payload);
      const createdProp = res.data.property;

      // Automatically trigger 3D / Walkthrough reconstruction job
      try {
        await api.post(`/properties/${createdProp._id}/3d-experience/process`);
      } catch (e) {
        console.warn('3D processing auto-start notice:', e);
      }

      setSuccessData(createdProp);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit property. Please check required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-[#222222] mb-3">
          Property Submitted for Verification!
        </h2>
        <p className="text-[#777777] max-w-xl mx-auto mb-8 leading-relaxed">
          Your listing <span className="font-semibold text-[#222222]">"{successData.title}"</span> in{' '}
          <span className="font-semibold text-[#222222]">{successData.locality}</span> has been assigned status{' '}
          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded">
            PENDING_BROKER_VERIFICATION
          </span>.
          An in-house Redstone broker will contact you shortly to coordinate physical inspection.
        </p>

        <div className="bg-white p-6 rounded-2xl border border-[#EEEEEE] max-w-lg mx-auto text-left mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-[#C62828] font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Owner Privacy & Broker Guarantee</span>
          </div>
          <p className="text-xs text-[#777777] leading-relaxed">
            Your personal phone number and email are completely protected and hidden from the public and buyers. All inquiries and site visits are escorted directly by our certified in-house brokers.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/owner/properties')}
            className="px-6 py-3 bg-[#C62828] text-white font-semibold rounded-xl hover:bg-[#B71C1C] transition-colors shadow-md"
          >
            Go to My Properties
          </button>
          <button
            onClick={() => {
              setSuccessData(null);
              setCurrentStep(1);
            }}
            className="px-6 py-3 bg-white border border-[#EEEEEE] text-[#222222] font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Add Another Property
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Wizard Header */}
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFCDD2] text-[#C62828] mb-2 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> 9-Step Guided Submission
        </span>
        <h1 className="text-3xl font-extrabold text-[#222222]">List Your Property on Redstone</h1>
        <p className="text-[#777777] text-sm mt-1">
          Complete the steps below. We verify every listing to guarantee premium quality and verified buyer trust.
        </p>
      </div>

      {/* Progress Bar & Indicators */}
      <div className="mb-8 bg-white p-4 rounded-2xl border border-[#EEEEEE] shadow-sm">
        <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2 text-xs">
          {STEP_LABELS.map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            return (
              <div
                key={label}
                className="flex items-center gap-1.5 shrink-0 cursor-pointer"
                onClick={() => isCompleted && setCurrentStep(stepNum)}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${isCurrent
                      ? 'bg-[#C62828] text-white shadow-md'
                      : isCompleted
                        ? 'bg-[#2E7D32] text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNum}
                </div>
                <span
                  className={`hidden md:inline font-medium ${isCurrent ? 'text-[#C62828] font-bold' : isCompleted ? 'text-[#222222]' : 'text-gray-400'
                    }`}
                >
                  {label}
                </span>
                {idx < STEP_LABELS.length - 1 && (
                  <div className="hidden md:block w-3 h-0.5 bg-gray-200 mx-1"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-[#C62828] rounded-xl text-sm font-semibold flex items-center gap-2">
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      {/* Step Content Container */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EEEEEE] shadow-sm mb-6 min-h-[420px]">
        {/* STEP 1: PURPOSE */}
        {currentStep === 1 && (
          <div>
            <h3 className="text-xl font-bold text-[#222222] mb-2">Step 1 — What is the purpose of this listing?</h3>
            <p className="text-sm text-[#777777] mb-6">Select whether you are putting your property for Sale, Rent, PG or Lease.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'sale', title: 'Sell', desc: 'Outright property transfer' },
                { id: 'rent', title: 'Rent', desc: 'Monthly residential lease' },
                { id: 'pg', title: 'PG', desc: 'Paying guest accommodation' },
                { id: 'lease', title: 'Lease', desc: 'Long-term commercial lease' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleChange('purpose', item.id)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-2 ${formData.purpose === item.id
                      ? 'border-[#C62828] bg-red-50/50 shadow-md text-[#C62828]'
                      : 'border-[#EEEEEE] hover:border-gray-300'
                    }`}
                >
                  <Home className="w-8 h-8" />
                  <div className="font-bold text-lg text-[#222222]">{item.title}</div>
                  <div className="text-xs text-[#777777]">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: CATEGORY */}
        {currentStep === 2 && (
          <div>
            <h3 className="text-xl font-bold text-[#222222] mb-2">Step 2 — Select Property Category</h3>
            <p className="text-sm text-[#777777] mb-6">Is this listing Residential, Commercial or Land?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { id: 'residential', title: 'Residential', icon: Home, desc: 'Apartments, villas, builder floors, houses' },
                { id: 'commercial', title: 'Commercial', icon: Building2, desc: 'Offices, shops, showrooms, warehouses' },
                { id: 'land', title: 'Land / Plots', icon: Layers, desc: 'Residential plots, commercial plots, agricultural' },
              ].map((item) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleChange('category', item.id)}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-3 ${formData.category === item.id
                        ? 'border-[#C62828] bg-red-50/50 shadow-md text-[#C62828]'
                        : 'border-[#EEEEEE] hover:border-gray-300'
                      }`}
                  >
                    <IconComp className="w-10 h-10" />
                    <div className="font-bold text-lg text-[#222222]">{item.title}</div>
                    <div className="text-xs text-[#777777]">{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: PROPERTY TYPE */}
        {currentStep === 3 && (
          <div>
            <h3 className="text-xl font-bold text-[#222222] mb-2">Step 3 — Property Type</h3>
            <p className="text-sm text-[#777777] mb-6">Select the specific type that best describes the asset.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'flat', label: 'Flat / High-Rise Apartment' },
                { id: 'apartment', label: 'Condominium' },
                { id: 'independent_house', label: 'Independent House' },
                { id: 'villa', label: 'Luxury Villa' },
                { id: 'builder_floor', label: 'Independent Builder Floor' },
                { id: 'pg', label: 'PG / Co-Living Space' },
                { id: 'office', label: 'Commercial Office Space' },
                { id: 'shop', label: 'Retail Shop / Showroom' },
                { id: 'warehouse', label: 'Warehouse / Industrial Shed' },
                { id: 'residential_plot', label: 'Residential Plot / Land' },
                { id: 'commercial_plot', label: 'Commercial Plot' },
                { id: 'farmhouse', label: 'Farmhouse' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => handleChange('propertyType', t.id)}
                  className={`p-4 rounded-xl border text-left font-medium text-sm transition-all ${formData.propertyType === t.id
                      ? 'border-[#C62828] bg-[#C62828] text-white font-bold shadow-sm'
                      : 'border-[#EEEEEE] hover:bg-gray-50 text-[#222222]'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: SPECIFICATIONS */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#222222] mb-1">Step 4 — Specifications & Amenities</h3>
              <p className="text-sm text-[#777777]">Provide accurate architectural and dimension details.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">Property Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Panchsheel Wellington - Premium 3BHK with Club View"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EEEEEE] focus:outline-none focus:border-[#C62828] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">Description *</label>
                <textarea
                  rows={3}
                  placeholder="Describe your property layout, unique views, sunlight, modular fittings, and society environment..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EEEEEE] focus:outline-none focus:border-[#C62828] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">BHK Configuration</label>
                  <select
                    value={formData.bhk}
                    onChange={(e) => handleChange('bhk', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#EEEEEE] text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} BHK
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">Bathrooms</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleChange('bathrooms', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#EEEEEE] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">Super Area (sq ft) *</label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => handleChange('area', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#EEEEEE] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">Carpet Area (sq ft)</label>
                  <input
                    type="number"
                    value={formData.carpetArea}
                    onChange={(e) => handleChange('carpetArea', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#EEEEEE] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">Furnishing</label>
                  <select
                    value={formData.furnishing}
                    onChange={(e) => handleChange('furnishing', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EEEEEE] text-sm"
                  >
                    <option value="unfurnished">Unfurnished</option>
                    <option value="semi-furnished">Semi-Furnished</option>
                    <option value="fully-furnished">Fully-Furnished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">Facing</label>
                  <select
                    value={formData.facing}
                    onChange={(e) => handleChange('facing', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EEEEEE] text-sm"
                  >
                    {['North', 'East', 'South', 'West', 'North-East', 'North-West', 'South-East', 'South-West'].map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">Floor No.</label>
                  <input
                    type="number"
                    value={formData.floorNumber}
                    onChange={(e) => handleChange('floorNumber', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#EEEEEE] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">Total Floors</label>
                  <input
                    type="number"
                    value={formData.totalFloors}
                    onChange={(e) => handleChange('totalFloors', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#EEEEEE] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_AMENITIES.map((amenity) => {
                    const isSelected = formData.amenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isSelected
                            ? 'bg-[#C62828] border-[#C62828] text-white'
                            : 'bg-gray-50 border-[#EEEEEE] text-[#222222] hover:bg-gray-100'
                          }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: PRICING */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#222222] mb-1">Step 5 — Financials & Terms</h3>
              <p className="text-sm text-[#777777]">Set your desired pricing structure and monthly dues.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#F8F8F8] border border-[#EEEEEE] space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">
                    {formData.purpose === 'rent' ? 'Monthly Rent (₹) *' : 'Total Price (₹) *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleChange('price', Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#EEEEEE] bg-white font-bold text-lg text-[#C62828] focus:outline-none"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Computed rate: ~₹{formData.area > 0 ? Math.round(formData.price / formData.area) : 0}/sq ft
                  </div>
                </div>

                {formData.purpose === 'rent' && (
                  <div>
                    <label className="block text-xs font-bold text-[#222222] mb-1">Security Deposit (₹)</label>
                    <input
                      type="number"
                      value={formData.deposit}
                      onChange={(e) => handleChange('deposit', Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl border border-[#EEEEEE] bg-white text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">Monthly Maintenance Charges (₹)</label>
                  <input
                    type="number"
                    value={formData.maintenanceCharges}
                    onChange={(e) => handleChange('maintenanceCharges', Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-[#EEEEEE] bg-white text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="negotiable"
                    checked={formData.negotiable}
                    onChange={(e) => handleChange('negotiable', e.target.checked)}
                    className="w-4 h-4 text-[#C62828] rounded border-gray-300"
                  />
                  <label htmlFor="negotiable" className="text-xs font-semibold text-[#222222]">
                    Price is negotiable during broker-assisted discussion
                  </label>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#EEEEEE] space-y-3">
                <div className="flex items-center gap-2 font-bold text-[#222222] text-sm">
                  <ShieldCheck className="w-5 h-5 text-[#2E7D32]" />
                  <span>Redstone Standard Brokerage Policy</span>
                </div>
                <p className="text-xs text-[#777777] leading-relaxed">
                  Redstone charges a standardized 2% brokerage on sale closing or 1 month rent on lease execution upon successful closing. There are <b>zero upfront fees</b> to list or verify your property.
                </p>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs text-[#2E7D32] font-semibold">
                  ✓ Free professional photoshoot by in-house broker team included during verification.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: ADDRESS */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#222222] mb-1">Step 6 — Address & Locality</h3>
              <p className="text-sm text-[#777777]">Where is the property situated?</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">Select Prime Locality *</label>
                  <select
                    value={formData.locality}
                    onChange={(e) => handleLocalitySelect(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EEEEEE] text-sm font-semibold"
                  >
                    {Object.keys(NCR_LOCALITY_CENTERS).map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EEEEEE] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">Society / Project / Tower Name</label>
                <input
                  type="text"
                  placeholder="e.g. Panchsheel Wellington / Windsor Park"
                  value={formData.society}
                  onChange={(e) => handleChange('society', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EEEEEE] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Tower B, Flat 1204, NH-24"
                  value={formData.streetAddress}
                  onChange={(e) => handleChange('streetAddress', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EEEEEE] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EEEEEE] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EEEEEE] text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: INTERACTIVE MAP PIN DROP */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#222222]">Step 7 — Drop Precise Map Pin</h3>
                <p className="text-sm text-[#777777]">
                  Drag the red pin or click the map to position exact coordinates for search filters.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 block">Coordinates</span>
                <span className="font-mono text-xs font-bold text-[#C62828]">
                  {formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lng.toFixed(4)}
                </span>
              </div>
            </div>

            <PropertyMap
              center={[formData.coordinates.lat, formData.coordinates.lng]}
              zoom={14}
              selectablePin={true}
              selectedCoordinates={formData.coordinates}
              onCoordinateSelect={(coords) => handleChange('coordinates', coords)}
              height="380px"
            />
          </div>
        )}

        {/* STEP 8: ORGANIZED CATEGORIZED MEDIA & 360 PANORAMAS */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFCDD2] text-[#C62828] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>3D & Room Walkthrough Engine Ready</span>
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-1">Step 8 — Categorized Media & 360° Panoramas</h3>
              <p className="text-sm text-[#777777]">
                Upload high-resolution room photos, 360° panoramas, and walkthrough video. Our system automatically processes your media into an interactive 3D / 360° room walkthrough.
              </p>
            </div>

            <CategorizedMediaUploader
              media={formData.categorizedMedia}
              onChange={(newMedia) => setFormData((prev) => ({ ...prev, categorizedMedia: newMedia }))}
            />
          </div>
        )}

        {/* STEP 9: REVIEW & SUBMIT */}
        {currentStep === 9 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#222222] mb-1">Step 9 — Final Review & Verification Pledge</h3>
              <p className="text-sm text-[#777777]">Review the summary before submitting to the broker verification queue.</p>
            </div>

            <div className="bg-[#F8F8F8] p-6 rounded-2xl border border-[#EEEEEE] space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C62828]">
                    {formData.purpose} • {formData.propertyType}
                  </span>
                  <h4 className="text-lg font-bold text-[#222222]">{formData.title}</h4>
                  <p className="text-xs text-[#777777]">
                    📍 {formData.society ? formData.society + ', ' : ''}{formData.locality}, {formData.city}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-[#C62828]">
                    ₹{(formData.price / 100000).toFixed(2)} Lakhs
                  </div>
                  <div className="text-xs text-gray-500">
                    ~₹{Math.round(formData.price / (formData.area || 1))}/sq ft
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl text-center text-xs border border-[#EEEEEE]">
                <div>
                  <span className="text-gray-400 block">Area</span>
                  <span className="font-bold">{formData.area} sq ft</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Bedrooms</span>
                  <span className="font-bold">{formData.bhk} BHK</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Furnishing</span>
                  <span className="font-bold capitalize">{formData.furnishing}</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-[#2E7D32] leading-relaxed">
                <b>Verification Process:</b> By submitting, your listing will be immediately placed in our in-house broker verification queue. An assigned representative will inspect property title deeds and condition before live publication.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[#EEEEEE] font-semibold text-sm text-[#222222] hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
        ) : (
          <div></div>
        )}

        {currentStep < 9 ? (
          <button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#C62828] text-white font-bold text-sm hover:bg-[#B71C1C] transition-colors shadow-md"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="flex items-center gap-2 px-10 py-3 rounded-xl bg-[#2E7D32] text-white font-extrabold text-sm hover:bg-emerald-800 transition-colors shadow-lg disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit for Broker Verification ✓'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AddPropertyWizard;
