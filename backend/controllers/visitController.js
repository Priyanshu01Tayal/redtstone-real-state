const Visit = require('../models/Visit');
const Property = require('../models/Property');
const Enquiry = require('../models/Enquiry');
const User = require('../models/User');
const { logAudit } = require('../middleware/audit');
const { sendNotification } = require('../utils/notificationHelper');

// @desc Request or schedule a property visit
// Can be initiated by Client or directly scheduled by Broker
// @route POST /api/visits
exports.createVisit = async (req, res, next) => {
  try {
    const { propertyId, enquiryId, scheduledDate, scheduledTime, brokerNotes } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    let clientId;
    let brokerId = property.assignedBrokerId;
    let initialStatus = 'Requested';

    if (req.user.role === 'client') {
      clientId = req.user._id;
      initialStatus = 'Requested';
    } else if (req.user.role === 'broker' || req.user.role === 'admin') {
      brokerId = req.user._id;
      initialStatus = 'Scheduled';
      
      // If enquiryId provided, extract clientId
      if (enquiryId) {
        const enq = await Enquiry.findById(enquiryId);
        if (enq) clientId = enq.clientId;
      }
      if (!clientId && req.body.clientId) {
        clientId = req.body.clientId;
      }
    }

    if (!clientId) {
      return res.status(400).json({ success: false, message: 'Client ID is required for scheduling visit' });
    }

    const visit = await Visit.create({
      propertyId: property._id,
      enquiryId: enquiryId || null,
      clientId,
      brokerId,
      ownerId: property.ownerId,
      scheduledDate,
      scheduledTime,
      status: initialStatus,
      brokerNotes: brokerNotes || '',
      ownerConfirmation: 'pending',
    });

    property.visitsCount += 1;
    await property.save();

    await logAudit(req, 'VISIT_CREATED', 'Visit', visit._id, { status: initialStatus });

    const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    // 1. Automatic notification to Owner
    await sendNotification({
      recipientId: property.ownerId,
      title: 'Property Visit Scheduled',
      message: `Your property visit for "${property.title}" in ${property.locality} has been scheduled for ${formattedDate} at ${scheduledTime}. Please confirm your availability in your dashboard.`,
      type: 'visit_scheduled',
      relatedEntity: { entityType: 'Visit', entityId: visit._id },
    });

    // 2. Notification to Broker (if scheduled by client)
    if (req.user.role === 'client' && brokerId) {
      await sendNotification({
        recipientId: brokerId,
        senderId: clientId,
        title: 'New Visit Request Received',
        message: `Client ${req.user.name} requested a visit for "${property.title}" on ${formattedDate} at ${scheduledTime}.`,
        type: 'visit_scheduled',
        relatedEntity: { entityType: 'Visit', entityId: visit._id },
      });
    }

    // 3. Notification to Client (if scheduled by broker)
    if (req.user.role === 'broker' || req.user.role === 'admin') {
      await sendNotification({
        recipientId: clientId,
        senderId: req.user._id,
        title: 'Property Visit Scheduled by Broker',
        message: `Your visit for "${property.title}" has been scheduled for ${formattedDate} at ${scheduledTime}. Our broker will meet you on site.`,
        type: 'visit_scheduled',
        relatedEntity: { entityType: 'Visit', entityId: visit._id },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Visit scheduled successfully. Property owner and participants have been notified.',
      visit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Owner confirms or requests reschedule of a visit
// @route PUT /api/visits/:id/owner-confirmation
exports.ownerRespondVisit = async (req, res, next) => {
  try {
    const { confirmation, notes } = req.body; // 'confirmed' or 'change_requested'

    const visit = await Visit.findById(req.params.id)
      .populate('propertyId', 'title locality')
      .populate('brokerId', 'name');

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    if (visit.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: not property owner' });
    }

    visit.ownerConfirmation = confirmation;
    if (notes) visit.ownerNotes = notes;

    if (confirmation === 'confirmed') {
      visit.status = 'Confirmed';
    } else if (confirmation === 'change_requested') {
      visit.status = 'Rescheduled';
    }

    await visit.save();
    await logAudit(req, 'VISIT_OWNER_RESPONSE', 'Visit', visit._id, { confirmation, notes });

    // Notify broker of owner's action
    if (visit.brokerId) {
      await sendNotification({
        recipientId: visit.brokerId,
        senderId: req.user._id,
        title: `Owner ${confirmation === 'confirmed' ? 'Confirmed' : 'Requested Change For'} Visit`,
        message: `Property owner has ${confirmation === 'confirmed' ? 'confirmed' : 'requested a reschedule for'} visit on "${visit.propertyId?.title}". Notes: ${notes || 'None'}`,
        type: confirmation === 'confirmed' ? 'visit_confirmed' : 'visit_rescheduled',
        relatedEntity: { entityType: 'Visit', entityId: visit._id },
      });
    }

    res.status(200).json({
      success: true,
      message: `Visit marked as ${confirmation}`,
      visit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Broker or Admin updates visit status (e.g., Scheduled, Confirmed, Completed, Cancelled, Rescheduled, No Show)
// @route PUT /api/visits/:id/status
exports.updateVisitStatus = async (req, res, next) => {
  try {
    const { status, brokerNotes, scheduledDate, scheduledTime, rescheduleReason } = req.body;

    const visit = await Visit.findById(req.params.id)
      .populate('propertyId', 'title locality')
      .populate('clientId', 'name email');

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    // Verify broker/admin permission
    if (req.user.role === 'broker' && visit.brokerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this visit' });
    }

    // If rescheduling
    if (scheduledDate && scheduledTime && (scheduledDate !== visit.scheduledDate || scheduledTime !== visit.scheduledTime)) {
      visit.rescheduleHistory.push({
        previousDate: visit.scheduledDate,
        previousTime: visit.scheduledTime,
        requestedBy: req.user._id,
        reason: rescheduleReason || 'Broker rescheduled visit time',
        timestamp: new Date(),
      });
      visit.scheduledDate = scheduledDate;
      visit.scheduledTime = scheduledTime;
      visit.ownerConfirmation = 'pending';
    }

    if (status) visit.status = status;
    if (brokerNotes !== undefined) visit.brokerNotes = brokerNotes;

    await visit.save();
    await logAudit(req, 'VISIT_STATUS_UPDATED', 'Visit', visit._id, { status, scheduledDate, scheduledTime });

    // Send notifications to Owner and Client
    const formattedDate = new Date(visit.scheduledDate).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    let notifTitle = `Visit Status Updated: ${status}`;
    let notifMsg = `The visit for "${visit.propertyId?.title}" is now marked as ${status} (Scheduled for ${formattedDate} at ${visit.scheduledTime}).`;

    if (status === 'Cancelled') {
      notifTitle = 'Visit Cancelled';
      notifMsg = `The property visit for "${visit.propertyId?.title}" has been cancelled.`;
    }

    await sendNotification({
      recipientId: visit.ownerId,
      title: notifTitle,
      message: notifMsg,
      type: status === 'Cancelled' ? 'visit_cancelled' : 'visit_scheduled',
      relatedEntity: { entityType: 'Visit', entityId: visit._id },
    });

    await sendNotification({
      recipientId: visit.clientId,
      title: notifTitle,
      message: notifMsg,
      type: status === 'Cancelled' ? 'visit_cancelled' : 'visit_scheduled',
      relatedEntity: { entityType: 'Visit', entityId: visit._id },
    });

    res.status(200).json({
      success: true,
      message: 'Visit updated successfully',
      visit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get visits for Owner
// @route GET /api/visits/owner
exports.getOwnerVisits = async (req, res, next) => {
  try {
    const visits = await Visit.find({ ownerId: req.user._id })
      .sort({ scheduledDate: -1 })
      .populate('propertyId', 'title locality city images')
      .populate('brokerId', 'name email phone avatar');

    res.status(200).json({
      success: true,
      count: visits.length,
      visits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get visits for Broker
// @route GET /api/visits/broker
exports.getBrokerVisits = async (req, res, next) => {
  try {
    const { status, dateFilter } = req.query;
    const query = { brokerId: req.user._id };

    if (status) query.status = status;

    if (dateFilter === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      query.scheduledDate = { $gte: start, $lte: end };
    } else if (dateFilter === 'upcoming') {
      query.scheduledDate = { $gte: new Date() };
    }

    const visits = await Visit.find(query)
      .sort({ scheduledDate: 1 })
      .populate('propertyId', 'title locality city address ownerId')
      .populate('clientId', 'name email phone avatar')
      .populate('ownerId', 'name email phone');

    res.status(200).json({
      success: true,
      count: visits.length,
      visits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get visits for Client
// @route GET /api/visits/client
exports.getClientVisits = async (req, res, next) => {
  try {
    const visits = await Visit.find({ clientId: req.user._id })
      .sort({ scheduledDate: -1 })
      .populate('propertyId', 'title locality city address images')
      .populate('brokerId', 'name email phone avatar rating');

    res.status(200).json({
      success: true,
      count: visits.length,
      visits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Admin get all visits
// @route GET /api/visits/admin
exports.getAllVisits = async (req, res, next) => {
  try {
    const visits = await Visit.find()
      .sort({ scheduledDate: -1 })
      .populate('propertyId', 'title locality city')
      .populate('brokerId', 'name email phone')
      .populate('clientId', 'name email phone')
      .populate('ownerId', 'name email phone');

    res.status(200).json({
      success: true,
      count: visits.length,
      visits,
    });
  } catch (error) {
    next(error);
  }
};
