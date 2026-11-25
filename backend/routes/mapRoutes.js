const express = require('express');
const router = express.Router();
const {
  searchMapProperties,
  getAvailabilityHeatmapData,
  getDemandHeatmapData,
  getLocalitySummaryData,
} = require('../controllers/mapController');

// Public or Client map endpoints
router.get('/properties', searchMapProperties);
router.get('/availability-heatmap', getAvailabilityHeatmapData);
router.get('/demand-heatmap', getDemandHeatmapData);
router.get('/locality-summary', getLocalitySummaryData);

module.exports = router;
