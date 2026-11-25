const User = require('../models/User');
const Property = require('../models/Property');
const BrokerAssignment = require('../models/BrokerAssignment');
const Enquiry = require('../models/Enquiry');
const Visit = require('../models/Visit');
const Deal = require('../models/Deal');
const Commission = require('../models/Commission');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../middleware/audit');
const { sendNotification } = require('../utils/notificationHelper');

// @desc Admin Dashboard High Level KPIs
// @route GET /api/admin/dashboard-stats
exports.getAdminDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalBrokers,
      totalClients,
      totalProperties,
      pendingProperties,
      approvedProperties,
      rejectedProperties,
      totalEnquiries,
      totalVisits,
      closedDeals,
      commissions,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ role: 'broker' }),
      User.countDocuments({ role: 'client' }),
      Property.countDocuments(),
      Property.countDocuments({ approvalStatus: 'pending' }),
      Property.countDocuments({ approvalStatus: 'approved' }),
      Property.countDocuments({ approvalStatus: 'rejected' }),
      Enquiry.countDocuments(),
      Visit.countDocuments(),
      Deal.countDocuments({ status: 'closed' }),
      Commission.find(),
    ]);

    const totalRevenue = commissions.reduce((sum, c) => sum + (c.companyRevenueAmount || 0), 0);
    const totalCommissionTurnover = commissions.reduce((sum, c) => sum + (c.totalCommissionAmount || 0), 0);
    const paidToBrokers = commissions
      .filter((c) => c.paymentStatus === 'paid')
      .reduce((sum, c) => sum + (c.brokerCommissionAmount || 0), 0);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOwners,
        totalBrokers,
        totalClients,
        totalProperties,
        pendingProperties,
        approvedProperties,
        rejectedProperties,
        totalEnquiries,
        totalVisits,
        closedDeals,
        totalRevenue,
        totalCommissionTurnover,
        paidToBrokers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Admin Property Approval & Broker Assignment workflow
// @route PUT /api/admin/properties/:id/approve
exports.approveProperty = async (req, res, next) => {
  try {
    const { brokerId, notes } = req.body;

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (!brokerId) {
      return res.status(400).json({ success: false, message: 'Please select an in-house broker to assign to this property' });
    }

    const broker = await User.findOne({ _id: brokerId, role: 'broker' });
    if (!broker) {
      return res.status(400).json({ success: false, message: 'Selected broker was not found or is invalid' });
    }

    property.approvalStatus = 'approved';
    property.publicationStatus = 'approved';
    property.verificationStatus = 'VERIFIED';
    property.assignedBrokerId = broker._id;
    property.rejectionReason = '';
    await property.save();

    // Create / Record Broker Assignment
    await BrokerAssignment.create({
      propertyId: property._id,
      brokerId: broker._id,
      assignedBy: req.user._id,
      notes: notes || 'Assigned upon property approval',
      status: 'active',
    });

    await logAudit(req, 'PROPERTY_APPROVED_AND_ASSIGNED', 'Property', property._id, { brokerId: broker._id });

    // 1. Notify Owner that property is approved and active
    await sendNotification({
      recipientId: property.ownerId,
      title: 'Property Approved & Published!',
      message: `Great news! Your property "${property.title}" in ${property.locality} has been verified and published. Senior Broker ${broker.name} has been assigned to represent your property.`,
      type: 'property_approval',
      relatedEntity: { entityType: 'Property', entityId: property._id },
    });

    // 2. Notify Broker about new assignment
    await sendNotification({
      recipientId: broker._id,
      title: 'New Property Assigned to You',
      message: `You have been assigned as lead broker for "${property.title}" (${property.locality}, ${property.city}). Client enquiries will be routed directly to you.`,
      type: 'broker_assigned',
      relatedEntity: { entityType: 'Property', entityId: property._id },
    });

    res.status(200).json({
      success: true,
      message: 'Property approved and broker assigned successfully. Now visible to public.',
      property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Admin Rejects Property
// @route PUT /api/admin/properties/:id/reject
exports.rejectProperty = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    property.approvalStatus = 'rejected';
    property.rejectionReason = rejectionReason;
    await property.save();

    await logAudit(req, 'PROPERTY_REJECTED', 'Property', property._id, { rejectionReason });

    // Notify Owner
    await sendNotification({
      recipientId: property.ownerId,
      title: 'Property Listing Requires Changes',
      message: `Your property submission "${property.title}" could not be approved. Reason: ${rejectionReason}. You can edit your listing and re-submit.`,
      type: 'property_rejected',
      relatedEntity: { entityType: 'Property', entityId: property._id },
    });

    res.status(200).json({
      success: true,
      message: 'Property has been rejected with feedback sent to the owner',
      property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Admin Reassign Broker to Property
// @route PUT /api/admin/properties/:id/assign-broker
exports.assignBroker = async (req, res, next) => {
  try {
    const { brokerId, notes } = req.body;

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const broker = await User.findOne({ _id: brokerId, role: 'broker' });
    if (!broker) {
      return res.status(400).json({ success: false, message: 'Broker not found' });
    }

    // Mark previous assignments as reassigned
    await BrokerAssignment.updateMany(
      { propertyId: property._id, status: 'active' },
      { status: 'reassigned' }
    );

    property.assignedBrokerId = broker._id;
    await property.save();

    await BrokerAssignment.create({
      propertyId: property._id,
      brokerId: broker._id,
      assignedBy: req.user._id,
      notes: notes || 'Reassigned by administrator',
      status: 'active',
    });

    await logAudit(req, 'BROKER_REASSIGNED', 'Property', property._id, { brokerId: broker._id });

    // Notify Broker
    await sendNotification({
      recipientId: broker._id,
      title: 'Property Reassigned to You',
      message: `You are now the lead broker for "${property.title}" in ${property.locality}.`,
      type: 'broker_assigned',
      relatedEntity: { entityType: 'Property', entityId: property._id },
    });

    res.status(200).json({
      success: true,
      message: 'Broker assigned successfully',
      property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Admin User Management (List users, toggle status)
// @route GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users: users.map((u) => u.toSafeObject()),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Admin toggle user status (active / suspended)
// @route PUT /api/admin/users/:id/status
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    await logAudit(req, 'USER_STATUS_TOGGLED', 'User', user._id, { newStatus: status });

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Admin Audit Logs
// @route GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'name email role');

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Admin Get All Properties (with full owner & broker data)
// @route GET /api/admin/properties
exports.getAdminProperties = async (req, res, next) => {
  try {
    const { approvalStatus, listingStatus, category, search } = req.query;
    const query = {};

    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (listingStatus) query.listingStatus = listingStatus;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { locality: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .populate('ownerId', 'name email phone avatar')
      .populate('assignedBrokerId', 'name email phone avatar licenseNumber')
      .populate('inspectionId');

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    next(error);
  }
};
