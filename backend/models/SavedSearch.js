const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    criteria: {
      purpose: String,
      category: String,
      propertyType: String,
      city: String,
      locality: String,
      minPrice: Number,
      maxPrice: Number,
      bhk: Number,
    },
    alertFrequency: {
      type: String,
      enum: ['instant', 'daily', 'weekly', 'never'],
      default: 'daily',
    },
  },
  { timestamps: true }
);

savedSearchSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SavedSearch', savedSearchSchema);
