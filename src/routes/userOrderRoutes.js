const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  applyReturn,
} = require('../controllers/orderController');
const authenticateToken = require('../middleware/auth');
const validate = require('../middleware/validate');
const { orderSchema } = require('../validators/orderValidator');

router.get('/orders', authenticateToken, getUserOrders);
router.get('/orders/:id', authenticateToken, getOrderById);
router.post('/orders', authenticateToken, validate(orderSchema), createOrder);
router.post('/orders/:id/return', authenticateToken, applyReturn);

module.exports = router;
