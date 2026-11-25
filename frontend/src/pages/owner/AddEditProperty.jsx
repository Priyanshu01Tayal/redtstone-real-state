import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { Building2, UploadCloud, Plus, X, CheckCircle, ArrowLeft } from 'lucide-react';

const AddEditProperty = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [listingType, setListingType] = useState('sale');
  const [propertyType, setPropertyType] = useState('apartment');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('sq ft');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Gurgaon');
  const [state, setState] = useState('Haryana');
  const [pincode, setPincode] = useState('122002');
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(3);
  const [balconies, setBalconies] = useState(2);
  const [furnishing, setFurnishing] = useState('semi-furnished');
  const [parking, setParking] = useState('1 covered');
  const [floorNumber, setFloorNumber] = useState(5);
  const [totalFloors, setTotalFloors] = useState(15);
  const [facing, setFacing] = useState('East');
  const [availability, setAvailability] = useState('immediate');
  const [ownerRequirements, setOwnerRequirements] = useState('');
  const [amenities, setAmenities] = useState(['Security', 'Power Backup', 'Lift']);
  const [imageUrl, setImageUrl] = useState('');
  const [imagesList, setImagesList] = useState([]);

  const allAmenities = [
    'Clubhouse', 'Swimming Pool', 'Gym', 'Security', 'Power Backup',
    'Lift', 'Visitor Parking', 'CCTV', 'Vastu Compliant', 'Intercom',
    'Fire Fighting System', 'Rain Water Harvesting', 'Reserved Parking'
  ];

  useEffect(() => {
    if (isEdit) {
      const fetchProperty = async () => {
        try {
          const res = await api.get(`/properties/${id}`);
          const p = res.data.property;
          setTitle(p.title || '');
          setListingType(p.listingType || 'sale');
          setPropertyType(p.propertyType || 'apartment');
          setDescription(p.description || '');
          setPrice(p.price || '');
          setArea(p.area || '');
          setAreaUnit(p.areaUnit || 'sq ft');
          setAddress(p.address || '');
          setLocality(p.locality || '');
          setCity(p.city || '');
          setState(p.state || '');
          setPincode(p.pincode || '');
          setBedrooms(p.bedrooms || 0);
          setBathrooms(p.bathrooms || 0);
          setBalconies(p.balconies || 0);
          setFurnishing(p.furnishing || 'unfurnished');
          setParking(p.parking || '1 covered');
          setFloorNumber(p.floorNumber || 1);
          setTotalFloors(p.totalFloors || 4);
          setFacing(p.facing || 'East');
          setAvailability(p.availability || 'immediate');
          setOwnerRequirements(p.ownerRequirements || '');
          setAmenities(p.amenities || []);
          setImagesList(p.images || []);
        } catch (err) {
          setError('Failed to load property');
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    }
  }, [id, isEdit]);

  const toggleAmenity = (item) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter((a) => a !== item));
    } else {
      setAmenities([...amenities, item]);
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrl) {
      setImagesList([...imagesList, { url: imageUrl, caption: 'Property Photo' }]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setImagesList(imagesList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      title,
      listingType,
      propertyType,
      description,
      price: Number(price),
      area: Number(area),
      areaUnit,
      address,
      locality,
      city,
      state,
      pincode,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      balconies: Number(balconies),
      furnishing,
      parking,
      floorNumber: Number(floorNumber),
      totalFloors: Number(totalFloors),
      facing,
      availability,
      ownerRequirements,
      amenities,
      images: imagesList.length > 0 ? imagesList : [
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', caption: 'Living Space' }
      ],
    };

    try {
      if (isEdit) {
        await api.put(`/properties/owner/${id}`, payload);
      } else {
        await api.post('/properties/owner', payload);
      }
      navigate('/owner/properties');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit property');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-500">Loading property editor...</div>;
  }

  const isLand = ['agricultural_land', 'residential_plot', 'commercial_plot'].includes(propertyType);
  const isCommercial = ['shop', 'office', 'commercial_building', 'industrial'].includes(propertyType);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/owner/properties')}
        className="flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-[#C62828] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Properties</span>
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EEEEEE] shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h1 className="text-2xl font-black text-[#222222]">
            {isEdit ? 'Edit Property Listing' : 'List a New Property'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Fill in the specifications below. Our admin team will verify details and assign an in-house broker.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#C62828] font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Listing & Property Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Listing Type</label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 font-semibold text-gray-800 focus:outline-none"
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 font-semibold text-gray-800 focus:outline-none"
              >
                <optgroup label="Residential">
                  <option value="apartment">Apartment</option>
                  <option value="flat">Flat</option>
                  <option value="villa">Luxury Villa</option>
                  <option value="independent_house">Independent House</option>
                </optgroup>
                <optgroup label="Commercial">
                  <option value="shop">Retail Shop</option>
                  <option value="office">Corporate Office</option>
                  <option value="commercial_building">Commercial Building</option>
                  <option value="industrial">Industrial Shed</option>
                </optgroup>
                <optgroup label="Land & Plots">
                  <option value="residential_plot">Residential Plot</option>
                  <option value="commercial_plot">Commercial Plot</option>
                  <option value="agricultural_land">Agricultural Land</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Property Title</label>
            <input
              type="text"
              required
              placeholder="e.g. 3BHK Luxury High-Rise with Panoramic Lake View"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-semibold text-gray-800 focus:outline-none focus:border-[#C62828]"
            />
          </div>

          {/* Price & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                {listingType === 'sale' ? 'Expected Sale Price (₹)' : 'Expected Monthly Rent (₹)'}
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 45000000"
                className="w-full p-2.5 rounded-xl border border-gray-200 font-semibold text-gray-800 focus:outline-none focus:border-[#C62828]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Total Area</label>
              <input
                type="number"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. 2400"
                className="w-full p-2.5 rounded-xl border border-gray-200 font-semibold text-gray-800 focus:outline-none focus:border-[#C62828]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Area Unit</label>
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 font-semibold text-gray-800 focus:outline-none"
              >
                <option value="sq ft">sq ft</option>
                <option value="sq yd">sq yd</option>
                <option value="acre">acre</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3 p-4 bg-[#F8F8F8] rounded-2xl border border-gray-100">
            <h4 className="font-bold text-gray-800">Property Location</h4>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Exact Address</label>
              <input
                type="text"
                required
                placeholder="Tower, Flat/Plot No., Street Name"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#C62828]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Locality</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Golf Course Road"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Specifications (Hide bedroom/baths for land/plots) */}
          {!isLand && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {!isCommercial && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              )}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  min="0"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Furnishing</label>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                >
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi-furnished">Semi-Furnished</option>
                  <option value="fully-furnished">Fully-Furnished</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Parking</label>
                <select
                  value={parking}
                  onChange={(e) => setParking(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                >
                  <option value="none">None</option>
                  <option value="1 covered">1 Covered</option>
                  <option value="2 covered">2 Covered</option>
                  <option value="open">Open</option>
                  <option value="multiple">Multiple</option>
                </select>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Detailed Description</label>
            <textarea
              rows="4"
              required
              placeholder="Highlight architecture, fittings, view, natural light, security..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#C62828]"
            />
          </div>

          {/* Amenities selection */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">Amenities & Features</label>
            <div className="flex flex-wrap gap-2">
              {allAmenities.map((item) => {
                const selected = amenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition text-xs border ${
                      selected
                        ? 'bg-[#FFEBEE] text-[#C62828] border-red-300'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {item} {selected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photos Management */}
          <div className="p-4 bg-[#F8F8F8] rounded-2xl border border-gray-100 space-y-3">
            <h4 className="font-bold text-gray-800">Property Photos</h4>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste high-res image URL (e.g. Unsplash or Cloudinary)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 p-2.5 rounded-xl border border-gray-200 bg-white"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-[#222222] text-white rounded-xl font-bold hover:bg-black transition"
              >
                Add Image
              </button>
            </div>

            {imagesList.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {imagesList.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-2xl font-black text-sm shadow-md transition"
          >
            {submitting ? 'Submitting Property...' : isEdit ? 'Save Property Updates' : 'Submit Property for Admin Approval'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEditProperty;
