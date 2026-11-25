const Property = require('../models/Property');
const BrokerAssignment = require('../models/BrokerAssignment');
const User = require('../models/User');
const { logAudit } = require('../middleware/audit');
const { sendNotification } = require('../utils/notificationHelper');
const { sanitizePropertyForClient, sanitizePropertiesList } = require('../utils/redactOwner');

// @desc Get public approved properties with filtering, search, pagination, and sorting
// @route GET /api/properties
exports.getPublicProperties = async (req, res, next) => {
  try {
    const {
      search,
      city,
      locality,
      listingType,
      propertyType,
      category,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      bedrooms,
      bathrooms,
      furnishing,
      amenities,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {
      approvalStatus: 'approved',
      listingStatus: { $in: ['active', 'under_negotiation'] },
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { locality: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (city) query.city = { $regex: `^${city}$`, $options: 'i' };
    if (locality) query.locality = { $regex: locality, $options: 'i' };
    if (listingType) query.listingType = listingType;
    if (propertyType) query.propertyType = propertyType;
    if (category) query.category = category;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minArea || maxArea) {
      query.area = {};
      if (minArea) query.area.$gte = Number(minArea);
      if (maxArea) query.area.$lte = Number(maxArea);
    }

    if (bedrooms) query.bedrooms = Number(bedrooms);
    if (bathrooms) query.bathrooms = Number(bathrooms);
    if (furnishing) query.furnishing = furnishing;

    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : amenities.split(',');
      query.amenities = { $all: amenitiesList };
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default latest
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'area_desc') sortOption = { area: -1 };
    else if (sort === 'featured') sortOption = { featured: -1, createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .populate('assignedBrokerId', 'name email phone avatar licenseNumber experienceYears rating'),
      Property.countDocuments(query),
    ]);

    // Ensure owner information is REDACTED for public client
    const safeProperties = sanitizePropertiesList(properties);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      properties: safeProperties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single public property by ID
// @route GET /api/properties/:id
exports.getPublicPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('assignedBrokerId', 'name email phone avatar licenseNumber experienceYears rating bio specialization');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Only approved properties can be viewed publicly unless owner or broker or admin
    const isPrivileged = req.user && (
      req.user.role === 'admin' ||
      (req.user.role === 'broker' && property.assignedBrokerId?._id?.toString() === req.user._id.toString()) ||
      (req.user.role === 'owner' && property.ownerId?.toString() === req.user._id.toString())
    );

    if (property.approvalStatus !== 'approved' && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Property is currently under review or inactive' });
    }

    // Increment views
    property.viewsCount += 1;
    await property.save();

    // Redact owner if caller is client / anonymous
    if (!isPrivileged) {
      const safe = sanitizePropertyForClient(property);
      return res.status(200).json({ success: true, property: safe });
    }

    // For owner/broker/admin, populate owner
    await property.populate('ownerId', 'name email phone avatar');
    res.status(200).json({ success: true, property });
  } catch (error) {
    next(error);
  }
};

// @desc Get featured properties for home page
// @route GET /api/properties/featured
exports.getFeaturedProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({
      approvalStatus: 'approved',
      listingStatus: 'active',
      featured: true,
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('assignedBrokerId', 'name email phone avatar rating');

    res.status(200).json({
      success: true,
      properties: sanitizePropertiesList(properties),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Owner creates new property
// @route POST /api/properties/owner
exports.ownerCreateProperty = async (req, res, next) => {
  try {
    const propertyData = {
      ...req.body,
      ownerId: req.user._id,
      approvalStatus: 'pending', // Requires admin review
      listingStatus: 'active',
    };

    // Calculate pricePerSqFt
    if (propertyData.price && propertyData.area && propertyData.area > 0) {
      propertyData.pricePerSqFt = Math.round(propertyData.price / propertyData.area);
    }

    const property = await Property.create(propertyData);

    await logAudit(req, 'PROPERTY_CREATED', 'Property', property._id, { title: property.title });

    // Notify admins about new property submission
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await sendNotification({
        recipientId: admin._id,
        senderId: req.user._id,
        title: 'New Property Submitted for Approval',
        message: `${req.user.name} submitted "${property.title}" in ${property.locality}, ${property.city}.`,
        type: 'property_approval',
        relatedEntity: { entityType: 'Property', entityId: property._id },
      });
    }

    // Notify the owner that it was received
    await sendNotification({
      recipientId: req.user._id,
      title: 'Property Submitted Successfully',
      message: `Your property "${property.title}" has been submitted for admin verification.`,
      type: 'property_approval',
      relatedEntity: { entityType: 'Property', entityId: property._id },
    });

    res.status(201).json({
      success: true,
      message: 'Property submitted successfully and is awaiting admin approval',
      property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Owner gets their own properties
// @route GET /api/properties/owner/my-properties
exports.ownerGetMyProperties = async (req, res, next) => {
  try {
    const { status, approvalStatus } = req.query;
    const query = { ownerId: req.user._id };

    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (status) query.listingStatus = status;

    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .populate('assignedBrokerId', 'name email phone avatar rating');

    const counts = {
      total: await Property.countDocuments({ ownerId: req.user._id }),
      approved: await Property.countDocuments({ ownerId: req.user._id, approvalStatus: 'approved' }),
      pending: await Property.countDocuments({ ownerId: req.user._id, approvalStatus: 'pending' }),
      rejected: await Property.countDocuments({ ownerId: req.user._id, approvalStatus: 'rejected' }),
    };

    res.status(200).json({
      success: true,
      counts,
      properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Owner updates their property
// @route PUT /api/properties/owner/:id
exports.ownerUpdateProperty = async (req, res, next) => {
  try {
    let property = await Property.findOne({ _id: req.params.id, ownerId: req.user._id });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found or unauthorized' });
    }

    // Disallow tampering with approvalStatus directly
    const updateData = { ...req.body };
    delete updateData.approvalStatus;
    delete updateData.assignedBrokerId;
    delete updateData.ownerId;

    // If property was rejected and edited, reset to pending for review
    if (property.approvalStatus === 'rejected') {
      updateData.approvalStatus = 'pending';
      updateData.rejectionReason = '';
    }

    property = await Property.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    await logAudit(req, 'PROPERTY_UPDATED_BY_OWNER', 'Property', property._id);

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Owner deletes property
// @route DELETE /api/properties/owner/:id
exports.ownerDeleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found or unauthorized' });
    }

    await logAudit(req, 'PROPERTY_DELETED_BY_OWNER', 'Property', req.params.id);

    res.status(200).json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const threeDService = require('../services/threeDProcessingService');

// @desc Owner updates categorized media for property
// @route POST /api/properties/:id/media
exports.updateCategorizedMedia = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Must be owner or admin or assigned broker
    const isOwner = property.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isBroker = req.user.role === 'broker' && property.assignedBrokerId?.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin && !isBroker) {
      return res.status(403).json({ success: false, message: 'Not authorized to update media for this property' });
    }

    const { categorizedMedia } = req.body;
    if (categorizedMedia) {
      property.categorizedMedia = categorizedMedia;

      // Sync backward-compatible flat images array
      const flatImages = [];
      const categories = ['exterior', 'livingRoom', 'bedrooms', 'kitchen', 'bathrooms', 'balcony', 'other'];
      categories.forEach((cat) => {
        if (categorizedMedia[cat] && Array.isArray(categorizedMedia[cat])) {
          categorizedMedia[cat].forEach((img, idx) => {
            flatImages.push({
              url: img.url,
              caption: img.caption || cat,
              category: cat,
              isFeatured: img.isFeatured || (flatImages.length === 0),
              isPanorama: !!img.isPanorama,
              sortOrder: img.sortOrder || idx,
            });
          });
        }
      });

      if (categorizedMedia.panoramas && Array.isArray(categorizedMedia.panoramas)) {
        categorizedMedia.panoramas.forEach((pano) => {
          flatImages.push({
            url: pano.url,
            caption: pano.caption || pano.roomName || '360 Panorama',
            category: 'panorama',
            isFeatured: false,
            isPanorama: true,
            sortOrder: 99,
          });
        });
      }

      if (flatImages.length > 0) {
        property.images = flatImages;
      }

      if (categorizedMedia.walkthroughVideos && Array.isArray(categorizedMedia.walkthroughVideos)) {
        property.videos = categorizedMedia.walkthroughVideos.map((v) => ({
          url: v.url,
          title: v.title || 'Property Walkthrough Video',
          duration: v.duration || 0,
        }));
      }

      property.threeDExperience.status = 'media_uploaded';
      await property.save();
    }

    res.status(200).json({
      success: true,
      message: 'Categorized media updated successfully',
      property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Request 3D / 360 / Walkthrough processing job
// @route POST /api/properties/:id/3d-experience/process
exports.process3DExperience = async (req, res, next) => {
  try {
    const experience = await threeDService.create3DProcessingJob(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: '3D/Tour processing initiated',
      experience,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Broker/Admin reviews 3D experience
// @route PUT /api/properties/:id/3d-experience/review
exports.review3DExperience = async (req, res, next) => {
  try {
    const { action, notes } = req.body; // 'approve' | 'reject' | 'publish'
    const experience = await threeDService.review3DExperience(req.params.id, action, req.user._id, notes);
    res.status(200).json({
      success: true,
      message: `3D experience status updated to ${experience.status}`,
      experience,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get public 3D/Walkthrough experience
// @route GET /api/properties/:id/3d-experience
exports.get3DExperience = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.status(200).json({
      success: true,
      experience: property.threeDExperience || { status: 'not_requested', experienceType: 'none' },
      categorizedMedia: property.categorizedMedia || {},
    });
  } catch (error) {
    next(error);
  }
};
