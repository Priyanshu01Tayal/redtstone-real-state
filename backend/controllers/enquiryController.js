const Enquiry = require('../models/Enquiry');
const Property = require('../models/Property');
const User = require('../models/User');
const { logAudit } = require('../middleware/audit');
const { sendNotification } = require('../utils/notificationHelper');

// @desc Client submits an enquiry on a property
// @route POST /api/enquiries
exports.createEnquiry = async (req, res, next) => {
  try {
    const { propertyId, message, preferredTime, budget } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.approvalStatus !== 'approved') {
      return res.status(400).json({ success: false, message: 'Cannot enquire on an unapproved property' });
    }

    const client = req.user;

    const enquiry = await Enquiry.create({
      propertyId: property._id,
      clientId: client._id,
      brokerId: property.assignedBrokerId || null,
      ownerId: property.ownerId,
      message,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      preferredTime: preferredTime || 'Anytime',
      budget: budget || property.price,
      status: 'new',
    });

    // Increment enquiries count on property
    property.enquiriesCount += 1;
    await property.save();

    await logAudit(req, 'ENQUIRY_CREATED', 'Enquiry', enquiry._id, { propertyId: property._id });

    // 1. Notify Assigned Broker if assigned
    if (property.assignedBrokerId) {
      await sendNotification({
        recipientId: property.assignedBrokerId,
        senderId: client._id,
        title: 'New Client Enquiry Received',
        message: `${client.name} enquired about "${property.title}" in ${property.locality}. Preferred time: ${preferredTime || 'Flexible'}.`,
        type: 'enquiry',
        relatedEntity: { entityType: 'Enquiry', entityId: enquiry._id },
      });
    }

    // 2. CRITICAL RULE: Notify Property Owner automatically WITHOUT revealing client's personal phone/email
    await sendNotification({
      recipientId: property.ownerId,
      title: 'New Property Enquiry',
      message: `Your property in ${property.locality} ("${property.title}") received a new enquiry. Our assigned broker is reviewing it and coordinating next steps.`,
      type: 'enquiry',
      relatedEntity: { entityType: 'Property', entityId: property._id },
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully. Our assigned broker will connect with you shortly!',
      enquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Client views their own enquiries
// @route GET /api/enquiries/client
exports.getClientEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find({ clientId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('propertyId', 'title locality city price listingType propertyType images')
      .populate('brokerId', 'name email phone avatar rating');

    res.status(200).json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Broker views enquiries for properties assigned to them
// @route GET /api/enquiries/broker
exports.getBrokerEnquiries = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { brokerId: req.user._id };
    if (status) query.status = status;

    const enquiries = await Enquiry.find(query)
      .sort({ createdAt: -1 })
      .populate('propertyId', 'title locality city price listingType propertyType ownerId')
      .populate('clientId', 'name email phone avatar');

    res.status(200).json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Broker updates enquiry status & notes
// @route PUT /api/enquiries/:id/status
exports.updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status, noteText } = req.body;

    const enquiry = await Enquiry.findById(req.params.id)
      .populate('propertyId', 'title locality')
      .populate('clientId', 'name email');

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    // Verify authorization: broker assigned or admin
    if (req.user.role === 'broker' && enquiry.brokerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not assigned to this enquiry' });
    }

    if (status) enquiry.status = status;

    if (noteText) {
      enquiry.notes.push({
        text: noteText,
        createdBy: req.user._id,
      });
    }

    await enquiry.save();
    await logAudit(req, 'ENQUIRY_STATUS_UPDATED', 'Enquiry', enquiry._id, { status, noteText });

    res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully',
      enquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Admin gets all enquiries
// @route GET /api/enquiries/admin
exports.getAllEnquiries = async (req, res, next) => {
  try {
    const { status, brokerId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (brokerId) query.brokerId = brokerId;

    const enquiries = await Enquiry.find(query)
      .sort({ createdAt: -1 })
      .populate('propertyId', 'title locality city price listingType')
      .populate('clientId', 'name email phone')
      .populate('brokerId', 'name email phone')
      .populate('ownerId', 'name email phone');

    res.status(200).json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    next(error);
  }
};
