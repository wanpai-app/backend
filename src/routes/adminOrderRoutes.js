const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAdminOrders,
  softDeleteOrder,
  updateOrder,
} = require('../controllers/adminOrderController');
const authenticateToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const validate = require('../middleware/validate');
const { orderSchema } = require('../validators/orderValidator');

router.get('/admin/orders', authenticateToken, isAdmin, getAdminOrders);
router.put('/admin/orders/:id', authenticateToken, isAdmin, updateOrder);
router.post('/orders', authenticateToken, validate(orderSchema), createOrder);
router.delete('/admin/orders/:id', authenticateToken, isAdmin, softDeleteOrder);

module.exports = router;
