const express = require('express');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
  createNotification
} = require('../controllers/notificationsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/me', protect, getMyNotifications);
router.put('/read-all', protect, markAllAsRead);
router.delete('/clear-all', protect, clearAll);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);
router.post('/', protect, authorize('admin'), createNotification);

module.exports = router;
