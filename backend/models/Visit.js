const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    enquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enquiry',
      index: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
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
    scheduledDate: {
      type: Date,
      required: [true, 'Visit date is required'],
    },
    scheduledTime: {
      type: String,
      required: [true, 'Visit time is required'],
    },
    status: {
      type: String,
      enum: [
        'Requested',
        'Proposed',
        'Scheduled',
        'Confirmed',
        'Completed',
        'Cancelled',
        'Rescheduled',
        'No Show',
      ],
      default: 'Requested',
      index: true,
    },
    ownerConfirmation: {
      type: String,
      enum: ['pending', 'confirmed', 'change_requested'],
      default: 'pending',
    },
    ownerNotes: {
      type: String,
      default: '',
    },
    brokerNotes: {
      type: String,
      default: '',
    },
    clientFeedback: {
      type: String,
      default: '',
    },
    rescheduleHistory: [
      {
        previousDate: Date,
        previousTime: String,
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visit', visitSchema);
