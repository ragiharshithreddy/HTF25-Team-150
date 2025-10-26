const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/async');

// @desc    Get my notifications
// @route   GET /api/notifications/me
// @access  Private
exports.getMyNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly } = req.query;

  const query = { userId: req.user.id };
  if (unreadOnly === 'true') {
    query.read = false;
  }

  const notifications = await Notification.find(query)
    .sort('-createdAt')
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    userId: req.user.id,
    read: false
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    data: notifications
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  if (notification.userId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  notification.read = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, read: false },
    { read: true, readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  if (notification.userId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notification deleted'
  });
});

// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private
exports.clearAll = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ userId: req.user.id });

  res.status(200).json({
    success: true,
    message: 'All notifications cleared'
  });
});

// @desc    Create notification (Admin)
// @route   POST /api/notifications
// @access  Private/Admin
exports.createNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create(req.body);

  // Emit socket event
  const io = req.app.get('io');
  io.to(req.body.userId.toString()).emit('notification', notification);

  res.status(201).json({
    success: true,
    data: notification
  });
});

module.exports = exports;
