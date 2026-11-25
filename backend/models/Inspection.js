const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    brokerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    inspectionDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    checklist: {
      addressVerified: { type: Boolean, default: false },
      specsVerified: { type: Boolean, default: false },
      legalDeedsReviewed: { type: Boolean, default: false },
      conditionRated: { type: Number, min: 1, max: 5, default: 4 },
      photographsTaken: { type: Boolean, default: false },
      keysHandled: { type: Boolean, default: false },
    },
    discrepancies: {
      type: String,
      default: '',
    },
    inspectionNotes: {
      type: String,
      default: '',
    },
    inspectionPhotos: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' },
      },
    ],
    recommendation: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'more_info_needed'],
      default: 'pending',
    },
    recommendationReason: {
      type: String,
      default: '',
    },
    submittedToAdminAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

inspectionSchema.index({ brokerId: 1, status: 1 });
inspectionSchema.index({ propertyId: 1, status: 1 });

module.exports = mongoose.model('Inspection', inspectionSchema);
