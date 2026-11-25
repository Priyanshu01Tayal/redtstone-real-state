const Property = require('../models/Property');
const Enquiry = require('../models/Enquiry');
const Visit = require('../models/Visit');
const Deal = require('../models/Deal');
const FollowUp = require('../models/FollowUp');
const Commission = require('../models/Commission');
const Inspection = require('../models/Inspection');
const ClientRequirement = require('../models/ClientRequirement');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationHelper');
const { findMatchingProperties } = require('../services/matchingService');

// @desc Get Broker Dashboard KPI statistics & activities
// @route GET /api/broker/dashboard-stats
exports.getBrokerDashboardStats = async (req, res, next) => {
  try {
    const brokerId = req.user._id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      assignedPropertiesCount,
      verificationQueueCount,
      newEnquiriesCount,
      activeLeadsCount,
      todayVisitsCount,
      upcomingVisitsCount,
      completedVisitsCount,
      activeNegotiationsCount,
      closedDealsCount,
      recentVisits,
      recentEnquiries,
      commissions,
    ] = await Promise.all([
      Property.countDocuments({ assignedBrokerId: brokerId, approvalStatus: 'approved' }),
      Property.countDocuments({
        approvalStatus: 'pending',
        verificationStatus: {
          $in: ['PENDING_BROKER_VERIFICATION', 'CONTACTING_OWNER', 'INSPECTION_SCHEDULED'],
        },
      }),
      Enquiry.countDocuments({ brokerId, status: 'new' }),
      Enquiry.countDocuments({
        brokerId,
        status: { $in: ['contacted', 'visit_requested', 'negotiation'] },
      }),
      Visit.countDocuments({ brokerId, scheduledDate: { $gte: todayStart, $lte: todayEnd } }),
      Visit.countDocuments({
        brokerId,
        scheduledDate: { $gte: new Date() },
        status: { $in: ['Scheduled', 'Confirmed', 'Proposed'] },
      }),
      Visit.countDocuments({ brokerId, status: 'Completed' }),
      Deal.countDocuments({ brokerId, status: 'under_agreement' }),
      Deal.countDocuments({ brokerId, status: 'closed' }),
      Visit.find({ brokerId })
        .sort({ scheduledDate: -1 })
        .limit(5)
        .populate('propertyId', 'title locality')
        .populate('clientId', 'name phone'),
      Enquiry.find({ brokerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('propertyId', 'title locality price')
        .populate('clientId', 'name phone email'),
      Commission.find({ brokerId }),
    ]);

    const totalCommissionEarned = commissions.reduce(
      (sum, c) => sum + (c.brokerCommissionAmount || 0),
      0
    );
    const paidCommission = commissions
      .filter((c) => c.paymentStatus === 'paid')
      .reduce((sum, c) => sum + (c.brokerCommissionAmount || 0), 0);

    res.status(200).json({
      success: true,
      stats: {
        assignedPropertiesCount,
        verificationQueueCount,
        newEnquiriesCount,
        activeLeadsCount,
        todayVisitsCount,
        upcomingVisitsCount,
        completedVisitsCount,
        activeNegotiationsCount,
        closedDealsCount,
        totalCommissionEarned,
        paidCommission,
        pendingCommission: totalCommissionEarned - paidCommission,
      },
      recentVisits,
      recentEnquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get properties assigned to the broker
// @route GET /api/broker/properties
exports.getAssignedProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({
      assignedBrokerId: req.user._id,
      approvalStatus: 'approved',
    })
      .sort({ createdAt: -1 })
      .populate('ownerId', 'name email phone avatar');

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    next(error);
  }
};

// --- VERIFICATION QUEUE & INSPECTIONS ---

// @desc Get properties awaiting broker verification / inspection
// @route GET /api/broker/verification-queue
exports.getVerificationQueue = async (req, res, next) => {
  try {
    const queue = await Property.find({
      approvalStatus: 'pending',
      verificationStatus: {
        $in: [
          'PENDING_BROKER_VERIFICATION',
          'CONTACTING_OWNER',
          'INSPECTION_SCHEDULED',
          'INSPECTION_COMPLETED',
        ],
      },
    })
      .populate('ownerId', 'name email phone')
      .populate('inspectionId')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: queue.length,
      properties: queue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Schedule inspection for a property
// @route POST /api/broker/inspections
exports.createInspection = async (req, res, next) => {
  try {
    const { propertyId, scheduledDate, notes } = req.body;

    const property = await Property.findById(propertyId).populate('ownerId');
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const inspection = await Inspection.create({
      propertyId,
      brokerId: req.user._id,
      ownerId: property.ownerId._id,
      scheduledDate: new Date(scheduledDate),
      inspectionNotes: notes || '',
      status: 'scheduled',
    });

    property.verificationStatus = 'INSPECTION_SCHEDULED';
    property.inspectionId = inspection._id;
    await property.save();

    // Notify Owner
    await createNotification({
      recipientId: property.ownerId._id,
      senderId: req.user._id,
      type: 'visit_scheduled',
      title: 'Physical Property Inspection Scheduled',
      message: `Broker ${req.user.name} has scheduled a physical verification inspection on ${new Date(
        scheduledDate
      ).toLocaleDateString()} for "${property.title}".`,
      data: { propertyId: property._id, inspectionId: inspection._id },
    });

    res.status(201).json({
      success: true,
      message: 'Inspection scheduled successfully',
      inspection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get inspection details
// @route GET /api/broker/inspections/:id
exports.getInspection = async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('propertyId')
      .populate('ownerId', 'name email phone')
      .populate('brokerId', 'name email phone');

    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    res.status(200).json({
      success: true,
      inspection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update inspection checklist, notes and photos
// @route PATCH /api/broker/inspections/:id
exports.updateInspection = async (req, res, next) => {
  try {
    const { checklist, discrepancies, inspectionNotes, inspectionPhotos, status } = req.body;

    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    if (checklist) inspection.checklist = { ...inspection.checklist, ...checklist };
    if (discrepancies !== undefined) inspection.discrepancies = discrepancies;
    if (inspectionNotes !== undefined) inspection.inspectionNotes = inspectionNotes;
    if (inspectionPhotos !== undefined) inspection.inspectionPhotos = inspectionPhotos;
    if (status) inspection.status = status;

    if (status === 'completed') {
      inspection.inspectionDate = new Date();
      await Property.findByIdAndUpdate(inspection.propertyId, {
        verificationStatus: 'INSPECTION_COMPLETED',
      });
    }

    await inspection.save();

    res.status(200).json({
      success: true,
      message: 'Inspection updated successfully',
      inspection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Broker submits verification recommendation to Admin
// @route POST /api/broker/properties/:id/verification-recommendation
exports.submitVerificationRecommendation = async (req, res, next) => {
  try {
    const { recommendation, recommendationReason, checklist } = req.body;
    const propertyId = req.params.id;

    const property = await Property.findById(propertyId).populate('ownerId');
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    let inspection = await Inspection.findOne({ propertyId }).sort('-createdAt');
    if (!inspection) {
      inspection = await Inspection.create({
        propertyId,
        brokerId: req.user._id,
        ownerId: property.ownerId._id,
        scheduledDate: new Date(),
        inspectionDate: new Date(),
        status: 'completed',
        checklist: checklist || {
          addressVerified: true,
          specsVerified: true,
          legalDeedsReviewed: true,
          conditionRated: 4,
          photographsTaken: true,
          keysHandled: true,
        },
      });
    }

    inspection.recommendation = recommendation; // 'approved' | 'rejected' | 'more_info_needed'
    inspection.recommendationReason = recommendationReason || '';
    inspection.submittedToAdminAt = new Date();
    inspection.status = 'completed';
    await inspection.save();

    if (recommendation === 'approved') {
      property.verificationStatus = 'VERIFIED';
    } else if (recommendation === 'rejected') {
      property.verificationStatus = 'REJECTED';
    }
    property.inspectionId = inspection._id;
    await property.save();

    // Notify all Admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        recipientId: admin._id,
        senderId: req.user._id,
        type: 'property_status',
        title: `Verification Recommendation: ${recommendation.toUpperCase()}`,
        message: `Broker ${req.user.name} submitted inspection recommendation (${recommendation}) for "${property.title}".`,
        data: { propertyId: property._id, inspectionId: inspection._id },
      });
    }

    // Notify Owner
    await createNotification({
      recipientId: property.ownerId._id,
      senderId: req.user._id,
      type: 'property_status',
      title: 'Property Inspection Completed',
      message: `Physical inspection for "${property.title}" has been completed and forwarded to management for final publication.`,
      data: { propertyId: property._id },
    });

    res.status(200).json({
      success: true,
      message: 'Verification recommendation submitted to Admin for final publication',
      property,
      inspection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get active client requirements in broker territory
// @route GET /api/broker/requirements
exports.getBrokerClientRequirements = async (req, res, next) => {
  try {
    const requirements = await ClientRequirement.find({
      status: { $in: ['active', 'matched'] },
    })
      .populate('clientId', 'name phone email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: requirements.length,
      requirements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Run match engine for a requirement
// @route GET /api/broker/requirements/:id/matches
exports.getRequirementMatches = async (req, res, next) => {
  try {
    const matches = await findMatchingProperties(req.params.id);
    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

// --- FOLLOW-UPS ---

// @desc Follow-up Management
// @route GET /api/broker/followups
exports.getFollowUps = async (req, res, next) => {
  try {
    const followUps = await FollowUp.find({ brokerId: req.user._id })
      .sort({ scheduledDate: 1 })
      .populate('propertyId', 'title locality')
      .populate('clientId', 'name email phone')
      .populate('enquiryId', 'message status');

    res.status(200).json({
      success: true,
      count: followUps.length,
      followUps,
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/broker/followups
exports.createFollowUp = async (req, res, next) => {
  try {
    const { enquiryId, propertyId, clientId, scheduledDate, type, notes } = req.body;

    const followUp = await FollowUp.create({
      brokerId: req.user._id,
      enquiryId,
      propertyId,
      clientId,
      scheduledDate,
      type,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Follow-up reminder set',
      followUp,
    });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/broker/followups/:id
exports.updateFollowUp = async (req, res, next) => {
  try {
    const { status, outcome } = req.body;
    const followUp = await FollowUp.findOneAndUpdate(
      { _id: req.params.id, brokerId: req.user._id },
      { status, outcome },
      { new: true }
    );

    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Follow-up updated',
      followUp,
    });
  } catch (error) {
    next(error);
  }
};
