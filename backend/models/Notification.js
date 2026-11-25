const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'enquiry',
        'visit_scheduled',
        'visit_confirmed',
        'visit_cancelled',
        'visit_rescheduled',
        'property_approval',
        'property_rejected',
        'property_status',
        'inspection',
        'broker_assigned',
        'deal_update',
        'general',
      ],
      default: 'general',
      index: true,
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['Property', 'Enquiry', 'Visit', 'Deal', 'None'],
        default: 'None',
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
