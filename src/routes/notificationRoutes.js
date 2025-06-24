const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  getNotifications,
  createNotification,
  markNotificationAsRead,
} = require('../controllers/notificationController');

router.get('/', authenticateToken, getNotifications);
router.post('/', authenticateToken, createNotification);
router.patch('/:id/read', authenticateToken, markNotificationAsRead);

module.exports = router;
