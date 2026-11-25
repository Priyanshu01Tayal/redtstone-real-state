const express = require('express');
const router = express.Router();
const {
  createDeal,
  getDeals,
  getCommissions,
  updateCommissionPayment,
} = require('../controllers/dealController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.post('/', authorize('broker', 'admin'), createDeal);
router.get('/', getDeals);
router.get('/commissions', authorize('broker', 'admin'), getCommissions);
router.put('/commissions/:id/payment', authorize('admin'), updateCommissionPayment);

module.exports = router;
