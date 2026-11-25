const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema(
  {
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      required: true,
      unique: true,
      index: true,
    },
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
    propertyValue: {
      type: Number,
      required: true,
    },
    commissionType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    commissionRate: {
      type: Number,
      default: 2.0, // default 2%
    },
    totalCommissionAmount: {
      type: Number,
      required: true,
    },
    commissionPayer: {
      type: String,
      enum: ['buyer', 'seller', 'both'],
      default: 'both',
    },
    buyerCommissionShare: {
      type: Number,
      default: 0,
    },
    sellerCommissionShare: {
      type: Number,
      default: 0,
    },
    brokerCommissionSharePercentage: {
      type: Number,
      default: 40, // 40% to the broker, 60% company brokerage revenue
    },
    brokerCommissionAmount: {
      type: Number,
      required: true,
    },
    companyRevenueAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partially_paid', 'paid', 'overdue'],
      default: 'pending',
      index: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    paymentDate: {
      type: Date,
    },
    paymentReference: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Commission', commissionSchema);
