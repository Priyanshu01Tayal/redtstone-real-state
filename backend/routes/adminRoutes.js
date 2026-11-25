const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  approveProperty,
  rejectProperty,
  assignBroker,
  getUsers,
  toggleUserStatus,
  getAuditLogs,
  getAdminProperties,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard-stats', getAdminDashboardStats);
router.get('/properties', getAdminProperties);
router.put('/properties/:id/approve', approveProperty);
router.put('/properties/:id/reject', rejectProperty);
router.put('/properties/:id/assign-broker', assignBroker);
router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
