const express = require('express');
const router = express.Router();
const {
  createVisit,
  ownerRespondVisit,
  updateVisitStatus,
  getOwnerVisits,
  getBrokerVisits,
  getClientVisits,
  getAllVisits,
} = require('../controllers/visitController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/', protect, createVisit);
router.put('/:id/owner-confirmation', protect, authorize('owner'), ownerRespondVisit);
router.put('/:id/status', protect, authorize('broker', 'admin'), updateVisitStatus);
router.get('/owner', protect, authorize('owner'), getOwnerVisits);
router.get('/broker', protect, authorize('broker'), getBrokerVisits);
router.get('/client', protect, authorize('client'), getClientVisits);
router.get('/admin', protect, authorize('admin'), getAllVisits);

module.exports = router;
