const mongoose = require('mongoose');

const businessSettingsSchema = new mongoose.Schema(
  {
    defaultCommissionRate: {
      type: Number,
      default: 2.0, // 2% standard
    },
    brokerCommissionSharePercentage: {
      type: Number,
      default: 40.0, // 40% of brokerage to agent
    },
    demandHeatmapThreshold: {
      type: Number,
      default: 1, // Minimum active requirements in cell to display demand density
    },
    strictOwnerPrivacyShield: {
      type: Boolean,
      default: true,
    },
    companyName: {
      type: String,
      default: 'Redstone Real Estate Brokerage Ltd.',
    },
    contactPhone: {
      type: String,
      default: '+91 98765 43210',
    },
    contactEmail: {
      type: String,
      default: 'contact@redstone.com',
    },
    headquarters: {
      type: String,
      default: 'Tower 4, Expressway Commercial Hub, Sector 62, Noida, UP, India',
    },
    supportedLocalities: [
      {
        name: { type: String, required: true },
        city: { type: String, required: true },
        center: {
          type: { type: String, enum: ['Point'], default: 'Point' },
          coordinates: { type: [Number], required: true }, // [lng, lat]
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('BusinessSettings', businessSettingsSchema);
