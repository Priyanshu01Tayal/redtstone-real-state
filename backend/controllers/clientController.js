const ClientRequirement = require('../models/ClientRequirement');
const Favorite = require('../models/Favorite');
const SavedSearch = require('../models/SavedSearch');
const Property = require('../models/Property');
const redactOwner = require('../utils/redactOwner');
const { findMatchingProperties } = require('../services/matchingService');
const { NCR_LOCALITIES } = require('../services/geospatialService');

// @desc Create new client property requirement
// @route POST /api/client/requirements
exports.createRequirement = async (req, res, next) => {
  try {
    const {
      purpose,
      category,
      propertyTypes,
      city,
      preferredLocalities,
      budget,
      area,
      bhk,
      furnishingPreference,
      amenitiesPreference,
      moveInDate,
      additionalNotes,
      contactPreference,
      coordinates,
    } = req.body;

    let locationCoords = coordinates;
    if (!locationCoords || locationCoords.length !== 2) {
      // Lookup locality center from NCR reference
      const primeLoc = (preferredLocalities && preferredLocalities[0]) || '';
      const found = NCR_LOCALITIES.find(
        (loc) => loc.name.toLowerCase() === primeLoc.toLowerCase()
      );
      if (found) {
        locationCoords = found.coordinates;
      } else {
        locationCoords = [77.3653, 28.628];
      }
    }

    const requirement = await ClientRequirement.create({
      clientId: req.user._id,
      purpose: purpose || 'sale',
      category: category || 'residential',
      propertyTypes: propertyTypes || ['flat', 'apartment'],
      city: city || 'Ghaziabad',
      preferredLocalities: preferredLocalities || [],
      location: {
        type: 'Point',
        coordinates: locationCoords,
      },
      budget: {
        min: budget?.min || 0,
        max: budget?.max || 10000000,
      },
      area: {
        min: area?.min || 0,
        max: area?.max,
        unit: area?.unit || 'sq ft',
      },
      bhk: bhk || [],
      furnishingPreference: furnishingPreference || 'any',
      amenitiesPreference: amenitiesPreference || [],
      moveInDate: moveInDate ? new Date(moveInDate) : undefined,
      additionalNotes: additionalNotes || '',
      contactPreference: contactPreference || 'phone',
    });

    // Run matching engine to attach immediate top matches
    try {
      const topMatches = await findMatchingProperties(requirement, { limit: 5 });
      requirement.matchedProperties = topMatches.map((m) => ({
        propertyId: m.property._id,
        matchScore: m.matchScore,
      }));
      await requirement.save();
    } catch (e) {
      console.warn('Initial matching error:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Property requirement submitted successfully. Our brokers are finding your best matches!',
      requirement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get client's requirements
// @route GET /api/client/requirements
exports.getMyRequirements = async (req, res, next) => {
  try {
    const requirements = await ClientRequirement.find({ clientId: req.user._id })
      .sort('-createdAt')
      .populate('matchedProperties.propertyId', 'title locality city price purpose bhk images');

    res.status(200).json({
      success: true,
      count: requirements.length,
      requirements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single requirement by ID
// @route GET /api/client/requirements/:id
exports.getRequirementById = async (req, res, next) => {
  try {
    const requirement = await ClientRequirement.findOne({
      _id: req.params.id,
      clientId: req.user._id,
    });

    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    res.status(200).json({
      success: true,
      requirement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update requirement
// @route PATCH /api/client/requirements/:id
exports.updateRequirement = async (req, res, next) => {
  try {
    const requirement = await ClientRequirement.findOneAndUpdate(
      { _id: req.params.id, clientId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Requirement updated',
      requirement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete/Close requirement
// @route DELETE /api/client/requirements/:id
exports.deleteRequirement = async (req, res, next) => {
  try {
    const requirement = await ClientRequirement.findOneAndDelete({
      _id: req.params.id,
      clientId: req.user._id,
    });

    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Requirement removed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Run real-time matching engine for client requirement
// @route GET /api/client/requirements/:id/matches
exports.getRequirementMatches = async (req, res, next) => {
  try {
    const requirement = await ClientRequirement.findOne({
      _id: req.params.id,
      clientId: req.user._id,
    });

    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    const matches = await findMatchingProperties(requirement, { limit: 20 });

    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

// --- FAVORITES ---

// @desc Toggle property in favorites
// @route POST /api/client/favorites/:propertyId
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const existing = await Favorite.findOne({
      userId: req.user._id,
      propertyId,
    });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return res.status(200).json({
        success: true,
        isFavorited: false,
        message: 'Removed from favorites',
      });
    }

    await Favorite.create({
      userId: req.user._id,
      propertyId,
    });

    res.status(201).json({
      success: true,
      isFavorited: true,
      message: 'Added to favorites',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get client's favorite properties
// @route GET /api/client/favorites
exports.getMyFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate({
        path: 'propertyId',
        populate: { path: 'assignedBrokerId', select: 'name email phone avatar rating' },
      })
      .sort('-createdAt');

    const properties = favorites
      .filter((f) => f.propertyId)
      .map((f) => redactOwner(f.propertyId));

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    next(error);
  }
};

// --- SAVED SEARCHES ---

// @desc Create saved search
// @route POST /api/client/saved-searches
exports.createSavedSearch = async (req, res, next) => {
  try {
    const { title, criteria, alertFrequency } = req.body;
    const search = await SavedSearch.create({
      userId: req.user._id,
      title,
      criteria,
      alertFrequency,
    });

    res.status(201).json({
      success: true,
      message: 'Search criteria saved',
      search,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get saved searches
// @route GET /api/client/saved-searches
exports.getMySavedSearches = async (req, res, next) => {
  try {
    const searches = await SavedSearch.find({ userId: req.user._id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: searches.length,
      searches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete saved search
// @route DELETE /api/client/saved-searches/:id
exports.deleteSavedSearch = async (req, res, next) => {
  try {
    await SavedSearch.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.status(200).json({
      success: true,
      message: 'Saved search removed',
    });
  } catch (error) {
    next(error);
  }
};
