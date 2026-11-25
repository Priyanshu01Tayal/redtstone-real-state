const Property = require('../models/Property');
const redactOwner = require('../utils/redactOwner');

/**
 * NCR Reference Coordinates for fallbacks and locality centering
 */
const NCR_LOCALITIES = [
  { name: 'Crossing Republik', city: 'Ghaziabad', coordinates: [77.433, 28.629] },
  { name: 'Indirapuram', city: 'Ghaziabad', coordinates: [77.371, 28.6415] },
  { name: 'Raj Nagar Extension', city: 'Ghaziabad', coordinates: [77.447, 28.709] },
  { name: 'Sector 62', city: 'Noida', coordinates: [77.362, 28.625] },
  { name: 'Noida Expressway', city: 'Noida', coordinates: [77.385, 28.535] },
  { name: 'Greater Noida West', city: 'Greater Noida', coordinates: [77.452, 28.583] },
  { name: 'Golf Course Road', city: 'Gurgaon', coordinates: [77.098, 28.4595] },
  { name: 'Cyber City', city: 'Gurgaon', coordinates: [77.088, 28.495] },
  { name: 'South Delhi', city: 'Delhi', coordinates: [77.225, 28.54] },
];

/**
 * Search properties within map bounding box coordinates
 * @param {Array<Array<Number>>} box [[swLng, swLat], [neLng, neLat]]
 * @param {Object} filters
 */
async function searchPropertiesInBounds(box, filters = {}) {
  const query = {
    approvalStatus: 'approved',
    listingStatus: { $in: ['active', 'under_negotiation'] },
    'location.coordinates': {
      $geoWithin: {
        $box: box,
      },
    },
  };

  if (filters.purpose) query.purpose = filters.purpose;
  if (filters.category) query.category = filters.category;
  if (filters.propertyType) query.propertyType = filters.propertyType;
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
  }
  if (filters.bhk) query.bhk = Number(filters.bhk);

  const properties = await Property.find(query)
    .populate('assignedBrokerId', 'name email phone avatar rating')
    .sort('-createdAt')
    .limit(filters.limit ? Number(filters.limit) : 100);

  // Redact owner info for public/client safety
  return properties.map((p) => redactOwner(p));
}

/**
 * Search properties near coordinate with max distance
 * @param {Number} lng
 * @param {Number} lat
 * @param {Number} maxDistanceMeters
 * @param {Object} filters
 */
async function searchPropertiesNear(lng, lat, maxDistanceMeters = 10000, filters = {}) {
  const query = {
    approvalStatus: 'approved',
    listingStatus: { $in: ['active', 'under_negotiation'] },
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: maxDistanceMeters,
      },
    },
  };

  if (filters.purpose) query.purpose = filters.purpose;
  if (filters.category) query.category = filters.category;
  if (filters.propertyType) query.propertyType = filters.propertyType;
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
  }

  const properties = await Property.find(query)
    .populate('assignedBrokerId', 'name email phone avatar rating')
    .limit(filters.limit ? Number(filters.limit) : 50);

  return properties.map((p) => redactOwner(p));
}

module.exports = {
  NCR_LOCALITIES,
  searchPropertiesInBounds,
  searchPropertiesNear,
};
