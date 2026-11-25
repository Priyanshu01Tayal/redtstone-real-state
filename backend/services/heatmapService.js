const Property = require('../models/Property');
const ClientRequirement = require('../models/ClientRequirement');
const { NCR_LOCALITIES } = require('./geospatialService');

/**
 * Aggregate real property availability data for Layer A
 * Grouped by locality & rounded coordinates to form geospatial heatmap clusters
 */
async function getAvailabilityHeatmap(filters = {}) {
  const matchStage = {
    approvalStatus: 'approved',
    listingStatus: { $in: ['active', 'under_negotiation'] },
  };

  if (filters.city) matchStage.city = new RegExp(filters.city, 'i');
  if (filters.purpose) matchStage.purpose = filters.purpose;
  if (filters.category) matchStage.category = filters.category;

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          locality: '$locality',
          city: '$city',
          lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 2] },
          lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 2] },
        },
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        residentialCount: {
          $sum: { $cond: [{ $eq: ['$category', 'residential'] }, 1, 0] },
        },
        commercialCount: {
          $sum: { $cond: [{ $eq: ['$category', 'commercial'] }, 1, 0] },
        },
        landCount: {
          $sum: { $cond: [{ $eq: ['$category', 'land'] }, 1, 0] },
        },
        forSaleCount: {
          $sum: { $cond: [{ $eq: ['$purpose', 'sale'] }, 1, 0] },
        },
        forRentCount: {
          $sum: { $cond: [{ $eq: ['$purpose', 'rent'] }, 1, 0] },
        },
        forPgCount: {
          $sum: { $cond: [{ $eq: ['$purpose', 'pg'] }, 1, 0] },
        },
      },
    },
    { $sort: { count: -1 } },
  ];

  const results = await Property.aggregate(pipeline);

  // Normalize density weights from 0.1 to 1.0 for heatmap display
  const maxCount = results.length > 0 ? Math.max(...results.map((r) => r.count), 1) : 1;

  const heatmapPoints = results.map((item) => {
    // If coordinates are missing or zero, lookup NCR center
    let lng = item._id.lng;
    let lat = item._id.lat;
    if (!lng || !lat) {
      const found = NCR_LOCALITIES.find(
        (loc) => loc.name.toLowerCase() === item._id.locality.toLowerCase()
      );
      if (found) {
        lng = found.coordinates[0];
        lat = found.coordinates[1];
      } else {
        lng = 77.3653;
        lat = 28.628;
      }
    }

    const weight = Number(Math.min(1.0, Math.max(0.2, item.count / maxCount)).toFixed(2));

    return {
      locality: item._id.locality,
      city: item._id.city,
      coordinates: [lng, lat],
      count: item.count,
      weight,
      avgPrice: Math.round(item.avgPrice || 0),
      minPrice: item.minPrice || 0,
      maxPrice: item.maxPrice || 0,
      breakdown: {
        residential: item.residentialCount,
        commercial: item.commercialCount,
        land: item.landCount,
        sale: item.forSaleCount,
        rent: item.forRentCount,
        pg: item.forPgCount,
      },
    };
  });

  return {
    layer: 'AVAILABILITY',
    totalClusters: heatmapPoints.length,
    totalProperties: results.reduce((acc, r) => acc + r.count, 0),
    data: heatmapPoints,
  };
}

/**
 * Aggregate client demand data for Layer B
 * Strictly ANONYMIZED: no personal client info exposed
 */
async function getDemandHeatmap(filters = {}) {
  const matchStage = {
    status: { $in: ['active', 'matched'] },
  };

  if (filters.city) matchStage.city = new RegExp(filters.city, 'i');
  if (filters.purpose) matchStage.purpose = filters.purpose;
  if (filters.category) matchStage.category = filters.category;

  const pipeline = [
    { $match: matchStage },
    { $unwind: { path: '$preferredLocalities', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: {
          locality: { $ifNull: ['$preferredLocalities', 'General Area'] },
          city: '$city',
          lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 2] },
          lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 2] },
        },
        demandScore: { $sum: 1 },
        avgMaxBudget: { $avg: '$budget.max' },
        minBudget: { $min: '$budget.min' },
        maxBudget: { $max: '$budget.max' },
        saleDemand: {
          $sum: { $cond: [{ $eq: ['$purpose', 'sale'] }, 1, 0] },
        },
        rentDemand: {
          $sum: { $cond: [{ $eq: ['$purpose', 'rent'] }, 1, 0] },
        },
        pgDemand: {
          $sum: { $cond: [{ $eq: ['$purpose', 'pg'] }, 1, 0] },
        },
      },
    },
    { $sort: { demandScore: -1 } },
  ];

  const results = await ClientRequirement.aggregate(pipeline);

  const maxScore = results.length > 0 ? Math.max(...results.map((r) => r.demandScore), 1) : 1;

  const demandPoints = results.map((item) => {
    let lng = item._id.lng;
    let lat = item._id.lat;
    if (!lng || !lat || (lng === 77.37 && lat === 28.63)) {
      const found = NCR_LOCALITIES.find(
        (loc) => loc.name.toLowerCase() === item._id.locality.toLowerCase()
      );
      if (found) {
        lng = found.coordinates[0];
        lat = found.coordinates[1];
      } else {
        lng = 77.371;
        lat = 28.6415;
      }
    }

    const weight = Number(Math.min(1.0, Math.max(0.2, item.demandScore / maxScore)).toFixed(2));

    return {
      locality: item._id.locality,
      city: item._id.city,
      coordinates: [lng, lat],
      demandScore: item.demandScore,
      weight,
      avgMaxBudget: Math.round(item.avgMaxBudget || 0),
      budgetRange: {
        min: item.minBudget || 0,
        max: item.maxBudget || 0,
      },
      purposeDemand: {
        sale: item.saleDemand,
        rent: item.rentDemand,
        pg: item.pgDemand,
      },
    };
  });

  return {
    layer: 'DEMAND',
    totalClusters: demandPoints.length,
    totalDemandLeads: results.reduce((acc, r) => acc + r.demandScore, 0),
    data: demandPoints,
  };
}

/**
 * Cross-tabulate availability vs demand per locality
 */
async function getLocalitySummary(city = 'Ghaziabad') {
  const [availability, demand] = await Promise.all([
    getAvailabilityHeatmap({ city }),
    getDemandHeatmap({ city }),
  ]);

  const map = new Map();

  availability.data.forEach((item) => {
    const key = item.locality.toLowerCase();
    map.set(key, {
      locality: item.locality,
      city: item.city,
      coordinates: item.coordinates,
      availableCount: item.count,
      demandCount: 0,
      avgPrice: item.avgPrice,
      avgBudget: 0,
    });
  });

  demand.data.forEach((item) => {
    const key = item.locality.toLowerCase();
    if (map.has(key)) {
      const existing = map.get(key);
      existing.demandCount = item.demandScore;
      existing.avgBudget = item.avgMaxBudget;
    } else {
      map.set(key, {
        locality: item.locality,
        city: item.city,
        coordinates: item.coordinates,
        availableCount: 0,
        demandCount: item.demandScore,
        avgPrice: 0,
        avgBudget: item.avgMaxBudget,
      });
    }
  });

  const summaries = Array.from(map.values()).map((s) => {
    // Gap index: positive = excess demand (opportunity for listings)
    const demandSupplyRatio =
      s.availableCount > 0 ? (s.demandCount / s.availableCount).toFixed(2) : (s.demandCount * 2).toFixed(2);
    return {
      ...s,
      demandSupplyRatio: Number(demandSupplyRatio),
      marketStatus:
        s.demandCount > s.availableCount
          ? 'High Demand (Supply Deficit)'
          : s.availableCount > s.demandCount
          ? 'High Supply (Buyer Market)'
          : 'Balanced Market',
    };
  });

  return summaries.sort((a, b) => b.demandCount + b.availableCount - (a.demandCount + a.availableCount));
}

module.exports = {
  getAvailabilityHeatmap,
  getDemandHeatmap,
  getLocalitySummary,
};
