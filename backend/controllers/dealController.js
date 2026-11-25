const Deal = require('../models/Deal');
const Commission = require('../models/Commission');
const Property = require('../models/Property');
const Enquiry = require('../models/Enquiry');
const User = require('../models/User');
const { logAudit } = require('../middleware/audit');
const { sendNotification } = require('../utils/notificationHelper');

// @desc Create a new deal (Closed or Under Agreement) and calculate commission
// @route POST /api/deals
exports.createDeal = async (req, res, next) => {
  try {
    const {
      propertyId,
      enquiryId,
      clientId,
      dealType, // 'sale' or 'rent'
      finalPrice,
      agreementDate,
      closingDate,
      status, // 'under_agreement' or 'closed'
      termsAndConditions,
      // Commission specifics
      commissionType = 'percentage',
      commissionRate = 2.0, // default 2%
      commissionPayer = 'both',
      brokerCommissionSharePercentage = 40, // 40% to broker, 60% company
    } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Determine broker: assigned broker or current user if broker
    const brokerId = property.assignedBrokerId || req.user._id;

    const deal = await Deal.create({
      propertyId: property._id,
      enquiryId: enquiryId || null,
      clientId,
      brokerId,
      ownerId: property.ownerId,
      dealType: dealType || property.listingType,
      finalPrice,
      agreementDate: agreementDate || new Date(),
      closingDate: closingDate || (status === 'closed' ? new Date() : null),
      status: status || 'under_agreement',
      termsAndConditions: termsAndConditions || '',
    });

    // Update property listing status
    if (status === 'closed') {
      property.listingStatus = dealType === 'sale' ? 'sold' : 'rented';
      await property.save();

      // Increment broker deals count
      await User.findByIdAndUpdate(brokerId, { $inc: { dealsCount: 1 } });
    } else {
      property.listingStatus = 'under_negotiation';
      await property.save();
    }

    // Update enquiry if linked
    if (enquiryId) {
      await Enquiry.findByIdAndUpdate(enquiryId, {
        status: status === 'closed' ? 'closed_won' : 'negotiation',
      });
    }

    // Calculate Commission
    let totalCommissionAmount = 0;
    if (commissionType === 'percentage') {
      totalCommissionAmount = Math.round((finalPrice * commissionRate) / 100);
    } else {
      totalCommissionAmount = Number(req.body.fixedCommissionAmount || 50000);
    }

    let buyerShare = 0;
    let sellerShare = 0;
    if (commissionPayer === 'both') {
      buyerShare = Math.round(totalCommissionAmount / 2);
      sellerShare = Math.round(totalCommissionAmount / 2);
    } else if (commissionPayer === 'buyer') {
      buyerShare = totalCommissionAmount;
    } else {
      sellerShare = totalCommissionAmount;
    }

    const brokerAmount = Math.round((totalCommissionAmount * brokerCommissionSharePercentage) / 100);
    const companyRevenue = totalCommissionAmount - brokerAmount;

    const commission = await Commission.create({
      dealId: deal._id,
      propertyId: property._id,
      brokerId,
      propertyValue: finalPrice,
      commissionType,
      commissionRate,
      totalCommissionAmount,
      commissionPayer,
      buyerCommissionShare: buyerShare,
      sellerCommissionShare: sellerShare,
      brokerCommissionSharePercentage,
      brokerCommissionAmount: brokerAmount,
      companyRevenueAmount: companyRevenue,
      paymentStatus: 'pending',
    });

    await logAudit(req, 'DEAL_CREATED', 'Deal', deal._id, { finalPrice, totalCommissionAmount });

    // Notify broker
    await sendNotification({
      recipientId: brokerId,
      title: 'Deal Recorded Successfully',
      message: `Deal recorded for "${property.title}" for ₹${finalPrice.toLocaleString('en-IN')}. Estimated broker commission: ₹${brokerAmount.toLocaleString('en-IN')}.`,
      type: 'deal_update',
      relatedEntity: { entityType: 'Deal', entityId: deal._id },
    });

    // Notify admin
    const admins = await User.find({ role: 'admin' });
    for (const adm of admins) {
      await sendNotification({
        recipientId: adm._id,
        title: 'New Deal & Commission Logged',
        message: `Deal closed on "${property.title}". Value: ₹${finalPrice.toLocaleString('en-IN')}. Commission: ₹${totalCommissionAmount.toLocaleString('en-IN')}.`,
        type: 'deal_update',
        relatedEntity: { entityType: 'Deal', entityId: deal._id },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Deal and commission records created successfully',
      deal,
      commission,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Deals
// @route GET /api/deals
exports.getDeals = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'broker') {
      query.brokerId = req.user._id;
    } else if (req.user.role === 'owner') {
      query.ownerId = req.user._id;
    } else if (req.user.role === 'client') {
      query.clientId = req.user._id;
    }

    const deals = await Deal.find(query)
      .sort({ createdAt: -1 })
      .populate('propertyId', 'title locality city price listingType images')
      .populate('brokerId', 'name email phone avatar')
      .populate('clientId', 'name email phone')
      .populate('ownerId', 'name email phone');

    res.status(200).json({
      success: true,
      count: deals.length,
      deals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Commissions (Admin & Broker)
// @route GET /api/deals/commissions
exports.getCommissions = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'broker') {
      query.brokerId = req.user._id;
    }

    const commissions = await Commission.find(query)
      .sort({ createdAt: -1 })
      .populate('propertyId', 'title locality city')
      .populate('brokerId', 'name email phone avatar')
      .populate('dealId', 'dealType finalPrice status agreementDate closingDate');

    // Totals summary
    const summary = commissions.reduce(
      (acc, curr) => {
        acc.totalCommission += curr.totalCommissionAmount || 0;
        acc.brokerEarnings += curr.brokerCommissionAmount || 0;
        acc.companyRevenue += curr.companyRevenueAmount || 0;
        if (curr.paymentStatus === 'paid') {
          acc.paidCommission += curr.totalCommissionAmount || 0;
        } else {
          acc.pendingCommission += curr.totalCommissionAmount || 0;
        }
        return acc;
      },
      {
        totalCommission: 0,
        brokerEarnings: 0,
        companyRevenue: 0,
        paidCommission: 0,
        pendingCommission: 0,
      }
    );

    res.status(200).json({
      success: true,
      summary,
      count: commissions.length,
      commissions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update commission payment status (Admin only)
// @route PUT /api/deals/commissions/:id/payment
exports.updateCommissionPayment = async (req, res, next) => {
  try {
    const { paymentStatus, paidAmount, paymentReference, notes } = req.body;

    const commission = await Commission.findById(req.params.id)
      .populate('brokerId', 'name email')
      .populate('propertyId', 'title');

    if (!commission) {
      return res.status(404).json({ success: false, message: 'Commission record not found' });
    }

    if (paymentStatus) commission.paymentStatus = paymentStatus;
    if (paidAmount !== undefined) commission.paidAmount = paidAmount;
    if (paymentReference) commission.paymentReference = paymentReference;
    if (notes) commission.notes = notes;
    if (paymentStatus === 'paid') commission.paymentDate = new Date();

    await commission.save();
    await logAudit(req, 'COMMISSION_PAYMENT_UPDATED', 'Commission', commission._id, { paymentStatus, paidAmount });

    // Notify broker
    await sendNotification({
      recipientId: commission.brokerId._id,
      title: `Commission Payment ${paymentStatus.toUpperCase()}`,
      message: `Commission of ₹${commission.brokerCommissionAmount.toLocaleString('en-IN')} for "${commission.propertyId?.title}" is now ${paymentStatus}.`,
      type: 'deal_update',
      relatedEntity: { entityType: 'Deal', entityId: commission.dealId },
    });

    res.status(200).json({
      success: true,
      message: 'Commission payment updated successfully',
      commission,
    });
  } catch (error) {
    next(error);
  }
};
