const AuditLog = require('../models/AuditLog');

const logAudit = async (req, action, resourceType, resourceId, details = {}) => {
  try {
    await AuditLog.create({
      userId: req?.user?._id || null,
      userRole: req?.user?.role || 'anonymous',
      action,
      resourceType,
      resourceId: resourceId?.toString() || null,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress || '127.0.0.1',
    });
  } catch (error) {
    console.error('[AuditLog] Error saving log:', error.message);
  }
};

module.exports = { logAudit };
