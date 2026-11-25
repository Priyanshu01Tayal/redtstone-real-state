const express = require('express');
const router = express.Router();
const {
  createEnquiry,
  getClientEnquiries,
  getBrokerEnquiries,
  updateEnquiryStatus,
  getAllEnquiries,
} = require('../controllers/enquiryController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/', protect, authorize('client'), createEnquiry);
router.get('/client', protect, authorize('client'), getClientEnquiries);
router.get('/broker', protect, authorize('broker'), getBrokerEnquiries);
router.put('/:id/status', protect, authorize('broker', 'admin'), updateEnquiryStatus);
router.get('/admin', protect, authorize('admin'), getAllEnquiries);

module.exports = router;
