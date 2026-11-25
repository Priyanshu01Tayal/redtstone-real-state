const Property = require('../models/Property');
const ClientRequirement = require('../models/ClientRequirement');
const redactOwner = require('../utils/redactOwner');

/**
 * Compute Haversine distance in meters between two lat/lng coordinates
 */
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Match properties against a client requirement with weighted scoring algorithm
 *
 * Weight Distribution:
 * - Location: 30%
 * - Budget: 25%
 * - Purpose & Category / Property Type: 20%
 * - Area: 10%
 * - Amenities & Specs (BHK, Furnishing, Amenities): 10%
 * - Immediate Availability / Negotiation: 5%
 *
 * @param {Object|String} requirementOrId
 * @param {Object} options { limit, minScore }
 */
async function findMatchingProperties(requirementOrId, options = {}) {
  let req = requirementOrId;
  if (typeof requirementOrId === 'string') {
    req = await ClientRequirement.findById(requirementOrId);
    if (!req) throw new Error('Client requirement not found');
  }

  const limit = options.limit || 20;
  const minScoreThreshold = options.minScore || 35; // default 35% match

  // Base query: only approved, active listings
  const query = {
    approvalStatus: 'approved',
    listingStatus: { $in: ['active', 'under_negotiation'] },
  };

  // Purpose filter (sale vs rent vs pg)
  if (req.purpose) {
    query.purpose = req.purpose;
  }

  // Pre-filter candidate properties in city or within general price envelope
  if (req.city) {
    query.city = new RegExp(req.city, 'i');
  }

  // Allow up to 25% budget stretch for candidates to compute scores
  if (req.budget && req.budget.max) {
    query.price = { $lte: req.budget.max * 1.3 };
  }

  const candidateProperties = await Property.find(query)
    .populate('assignedBrokerId', 'name email phone avatar rating')
    .lean();

  const reqLng = req.location?.coordinates?.[0] || 77.3653;
  const reqLat = req.location?.coordinates?.[1] || 28.628;
  const reqRadius = req.searchRadius || 7000; // 7 km default

  const scoredResults = candidateProperties.map((prop) => {
    let score = 0;
    const matchReasons = [];

    // 1. LOCATION SCORE (30 Points Max)
    let locationScore = 0;
    const propLng = prop.location?.coordinates?.[0] || prop.coordinates?.lng;
    const propLat = prop.location?.coordinates?.[1] || prop.coordinates?.lat;

    const isLocalityExact =
      req.preferredLocalities &&
      req.preferredLocalities.some(
        (loc) => loc.toLowerCase() === (prop.locality || '').toLowerCase()
      );

    if (isLocalityExact) {
      locationScore = 30;
      matchReasons.push('Preferred locality match');
    } else if (propLat && propLng && reqLat && reqLng) {
      const dist = getDistanceMeters(reqLat, reqLng, propLat, propLng);
      if (dist <= reqRadius) {
        // Linear scale between 28 and 14 points depending on proximity
        const factor = Math.max(0, 1 - dist / reqRadius);
        locationScore = Math.round(14 + factor * 14);
        matchReasons.push(`Within ${(dist / 1000).toFixed(1)} km of target location`);
      } else if (dist <= reqRadius * 1.5) {
        locationScore = 8;
      }
    } else {
      locationScore = 10; // Same city baseline
    }
    score += locationScore;

    // 2. BUDGET SCORE (25 Points Max)
    let budgetScore = 0;
    const price = prop.price;
    const maxBudget = req.budget?.max || 0;
    const minBudget = req.budget?.min || 0;

    if (maxBudget > 0) {
      if (price <= maxBudget && price >= minBudget) {
        budgetScore = 25;
        matchReasons.push('Within exact budget range');
      } else if (price < minBudget) {
        // Below min budget: still good value!
        budgetScore = 22;
        matchReasons.push('Under budget (high value)');
      } else if (price <= maxBudget * 1.1) {
        budgetScore = 15;
        matchReasons.push('Within 10% of budget');
      } else if (price <= maxBudget * 1.25) {
        budgetScore = 8;
      }
    } else {
      budgetScore = 15;
    }
    score += budgetScore;

    // 3. PROPERTY TYPE & CATEGORY (20 Points Max)
    let typeScore = 0;
    if (req.category && prop.category === req.category) {
      typeScore += 8;
    }
    if (
      req.propertyTypes &&
      req.propertyTypes.length > 0 &&
      req.propertyTypes.includes(prop.propertyType)
    ) {
      typeScore += 12;
      matchReasons.push(`${prop.propertyType.replace('_', ' ').toUpperCase()} match`);
    } else if (!req.propertyTypes || req.propertyTypes.length === 0) {
      typeScore += 8;
    }
    score += typeScore;

    // 4. AREA SCORE (10 Points Max)
    let areaScore = 0;
    if (req.area && req.area.max && prop.area) {
      if (prop.area >= (req.area.min || 0) && prop.area <= req.area.max) {
        areaScore = 10;
        matchReasons.push('Desired area dimensions');
      } else if (prop.area > req.area.max && prop.area <= req.area.max * 1.2) {
        areaScore = 7;
      } else {
        areaScore = 4;
      }
    } else {
      areaScore = 7; // neutral
    }
    score += areaScore;

    // 5. AMENITIES & SPECS (10 Points Max)
    let specsScore = 0;
    // BHK match (4 pts)
    if (req.bhk && req.bhk.length > 0) {
      if (req.bhk.includes(prop.bhk) || req.bhk.includes(prop.bedrooms)) {
        specsScore += 4;
        matchReasons.push(`${prop.bhk || prop.bedrooms} BHK fit`);
      }
    } else {
      specsScore += 2;
    }

    // Furnishing match (3 pts)
    if (req.furnishingPreference && req.furnishingPreference !== 'any') {
      if (req.furnishingPreference === prop.furnishing) {
        specsScore += 3;
        matchReasons.push('Furnishing preference match');
      }
    } else {
      specsScore += 2;
    }

    // Amenities overlap (3 pts)
    if (req.amenitiesPreference && req.amenitiesPreference.length > 0 && prop.amenities) {
      const common = req.amenitiesPreference.filter((a) =>
        prop.amenities.some((pa) => pa.toLowerCase() === a.toLowerCase())
      );
      if (common.length >= 2) {
        specsScore += 3;
        matchReasons.push(`Key amenities (${common.slice(0, 2).join(', ')})`);
      } else if (common.length === 1) {
        specsScore += 1.5;
      }
    } else {
      specsScore += 2;
    }
    score += Math.min(10, Math.round(specsScore));

    // 6. IMMEDIATE AVAILABILITY / NEGOTIABLE (5 Points Max)
    let extraScore = 0;
    if (prop.availability === 'immediate') extraScore += 3;
    if (prop.negotiable) extraScore += 2;
    score += extraScore;

    const finalMatchScore = Math.min(100, Math.round(score));

    return {
      property: redactOwner(prop),
      matchScore: finalMatchScore,
      matchReasons,
    };
  });

  // Filter by min threshold and sort descending
  const filtered = scoredResults
    .filter((res) => res.matchScore >= minScoreThreshold)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return filtered;
}

module.exports = {
  findMatchingProperties,
  getDistanceMeters,
};
