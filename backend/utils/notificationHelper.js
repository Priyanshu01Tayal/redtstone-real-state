const Notification = require('../models/Notification');
const { emitToUser, emitToRole } = require('../config/socket');

/**
 * Creates an in-app notification in DB and emits real-time Socket.IO event.
 */
const sendNotification = async ({
  recipientId,
  senderId = null,
  title,
  message,
  type = 'general',
  relatedEntity = { entityType: 'None', entityId: null },
}) => {
  try {
    const cleanRecipientId = recipientId?._id || recipientId;
    const cleanSenderId = senderId?._id || senderId;

    if (!cleanRecipientId) return null;

    const notification = await Notification.create({
      recipientId: cleanRecipientId,
      senderId: cleanSenderId,
      title,
      message,
      type,
      relatedEntity,
    });

    // Real-time delivery
    emitToUser(cleanRecipientId, 'notification', notification);

    console.log(`[Notification] Created & delivered to User ${cleanRecipientId}: "${title}"`);
    return notification;
  } catch (error) {
    console.error('[Notification] Error creating notification:', error.message);
  }
};

module.exports = {
  sendNotification,
  createNotification: sendNotification,
};
