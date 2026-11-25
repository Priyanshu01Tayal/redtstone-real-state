const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    enquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enquiry',
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    dealType: {
      type: String,
      enum: ['sale', 'rent'],
      required: true,
    },
    finalPrice: {
      type: Number,
      required: [true, 'Final closing price is required'],
    },
    agreementDate: {
      type: Date,
      default: Date.now,
    },
    closingDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'under_agreement', 'closed', 'cancelled'],
      default: 'under_agreement',
      index: true,
    },
    termsAndConditions: {
      type: String,
      default: '',
    },
    paymentSchedule: [
      {
        milestone: String,
        amount: Number,
        dueDate: Date,
        status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
      },
    ],
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Deal', dealSchema);
