const {
  searchPropertiesInBounds,
  searchPropertiesNear,
} = require('../services/geospatialService');
const {
  getAvailabilityHeatmap,
  getDemandHeatmap,
  getLocalitySummary,
} = require('../services/heatmapService');

// @desc Search properties within map bounding box or radius
// @route GET /api/maps/properties
exports.searchMapProperties = async (req, res, next) => {
  try {
    const { swLng, swLat, neLng, neLat, lng, lat, radius, ...filters } = req.query;

    let properties = [];

    if (swLng && swLat && neLng && neLat) {
      // Bounding box query
      const box = [
        [Number(swLng), Number(swLat)],
        [Number(neLng), Number(neLat)],
      ];
      properties = await searchPropertiesInBounds(box, filters);
    } else if (lng && lat) {
      // Radius query
      const maxDistance = radius ? Number(radius) : 10000;
      properties = await searchPropertiesNear(Number(lng), Number(lat), maxDistance, filters);
    } else {
      // Default to NCR viewport box
      const defaultBox = [
        [77.0, 28.4],
        [77.6, 28.8],
      ];
      properties = await searchPropertiesInBounds(defaultBox, filters);
    }

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Layer A - Property Availability Heatmap
// @route GET /api/maps/availability-heatmap
exports.getAvailabilityHeatmapData = async (req, res, next) => {
  try {
    const data = await getAvailabilityHeatmap(req.query);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Layer B - Client Demand Heatmap (Anonymized)
// @route GET /api/maps/demand-heatmap
exports.getDemandHeatmapData = async (req, res, next) => {
  try {
    const data = await getDemandHeatmap(req.query);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Locality Supply & Demand Summary
// @route GET /api/maps/locality-summary
exports.getLocalitySummaryData = async (req, res, next) => {
  try {
    const city = req.query.city || 'Ghaziabad';
    const summary = await getLocalitySummary(city);
    res.status(200).json({
      success: true,
      count: summary.length,
      summary,
    });
  } catch (error) {
    next(error);
  }
};
