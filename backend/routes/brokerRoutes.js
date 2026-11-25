const express = require('express');
const router = express.Router();
const {
  getBrokerDashboardStats,
  getAssignedProperties,
  getVerificationQueue,
  createInspection,
  getInspection,
  updateInspection,
  submitVerificationRecommendation,
  getBrokerClientRequirements,
  getRequirementMatches,
  getFollowUps,
  createFollowUp,
  updateFollowUp,
} = require('../controllers/brokerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.use(authorize('broker'));

router.get('/dashboard-stats', getBrokerDashboardStats);
router.get('/properties', getAssignedProperties);

// Verification Queue & Inspections
router.get('/verification-queue', getVerificationQueue);
router.post('/inspections', createInspection);
router.get('/inspections/:id', getInspection);
router.patch('/inspections/:id', updateInspection);
router.post('/properties/:id/verification-recommendation', submitVerificationRecommendation);

// Client Requirement Matching
router.get('/requirements', getBrokerClientRequirements);
router.get('/requirements/:id/matches', getRequirementMatches);

// Follow-ups
router.get('/followups', getFollowUps);
router.post('/followups', createFollowUp);
router.put('/followups/:id', updateFollowUp);

module.exports = router;
