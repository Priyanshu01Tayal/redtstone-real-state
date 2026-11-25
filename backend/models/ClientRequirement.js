const mongoose = require('mongoose');

const clientRequirementSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ['sale', 'rent', 'pg', 'lease'],
      default: 'sale',
      index: true,
    },
    category: {
      type: String,
      enum: ['residential', 'commercial', 'land'],
      default: 'residential',
      index: true,
    },
    propertyTypes: {
      type: [String],
      default: ['flat', 'apartment'],
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    preferredLocalities: {
      type: [String],
      default: [],
      index: true,
    },
    // GeoJSON Point location for area-based geospatial demand matching
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.3653, 28.628],
      },
    },
    searchRadius: {
      type: Number,
      default: 5000, // In meters (e.g. 5 km)
    },
    budget: {
      min: { type: Number, default: 0 },
      max: { type: Number, required: true, index: true },
    },
    area: {
      min: { type: Number, default: 0 },
      max: { type: Number },
      unit: { type: String, default: 'sq ft' },
    },
    bhk: {
      type: [Number],
      default: [],
    },
    bedrooms: {
      type: Number,
      default: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
    },
    furnishingPreference: {
      type: String,
      enum: ['any', 'unfurnished', 'semi-furnished', 'fully-furnished'],
      default: 'any',
    },
    amenitiesPreference: {
      type: [String],
      default: [],
    },
    moveInDate: {
      type: Date,
    },
    pgPreferences: {
      gender: { type: String, enum: ['male', 'female', 'unisex', 'any'], default: 'any' },
      foodIncluded: { type: Boolean, default: false },
    },
    additionalNotes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'matched', 'fulfilled', 'closed'],
      default: 'active',
      index: true,
    },
    contactPreference: {
      type: String,
      enum: ['phone', 'email', 'whatsapp', 'broker_visit'],
      default: 'phone',
    },
    matchedProperties: [
      {
        propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
        matchScore: { type: Number },
        matchedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Indexes
clientRequirementSchema.index({ location: '2dsphere' });
clientRequirementSchema.index({ city: 1, purpose: 1, category: 1, status: 1 });
clientRequirementSchema.index({ 'budget.max': 1, status: 1 });

module.exports = mongoose.model('ClientRequirement', clientRequirementSchema);
