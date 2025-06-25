const express = require('express');
const router = express.Router();
const {
  getAdminOrders,
  softDeleteOrder,
  updateOrder,
} = require('../controllers/adminOrderController');
const authenticateToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/admin/orders', authenticateToken, isAdmin, getAdminOrders);
router.put('/admin/orders/:id', authenticateToken, isAdmin, updateOrder);
router.delete('/admin/orders/:id', authenticateToken, isAdmin, softDeleteOrder);

module.exports = router;
