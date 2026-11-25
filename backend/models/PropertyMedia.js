const mongoose = require('mongoose');

const propertyMediaSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'floorplan', 'document'],
      default: 'image',
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
    },
    originalName: {
      type: String,
    },
    size: {
      type: Number,
    },
    mimeType: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PropertyMedia', propertyMediaSchema);
